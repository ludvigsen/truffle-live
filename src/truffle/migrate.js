/*global location*/
/*eslint no-restricted-globals: ["error", "event", "fdescribe"]*/
import {MIGRATIONS_PATH, BUILD_CONTRACTS_PATH} from './paths';

const Promise = require('bluebird');
const migrate = require('truffle-migrate');
const Artifactor = require('truffle-artifactor');
const Resolver = require('truffle-resolver');
const Web3 = require('web3');

const artifactor = new Artifactor(BUILD_CONTRACTS_PATH);
const provider = new Web3.providers.HttpProvider('/testrpc/');
const web3 = new Web3(provider);
Promise.promisifyAll(web3.eth, {suffix: 'Promise'});

async function runMigration() {
  const accounts = await web3.eth.getAccountsPromise();
  const resolver = new Resolver({
    working_directory: '/',
    contracts_build_directory: BUILD_CONTRACTS_PATH,
    from: accounts[0],
    gas: 500000,
  });
  return new Promise((f, r) => {
    migrate.run(
      {
        working_directory: '/',
        migrations_directory: MIGRATIONS_PATH,
        contracts_build_directory: BUILD_CONTRACTS_PATH,
        provider,
        artifactor,
        resolver,
        network: 'localhost',
        network_id: 42,
        logger: console,
        from: accounts[0],
        reset: true,
      },
      async err => {
        if (err) {
          r(err);
          return;
        }
        f();
      },
    );
  });
}

export default runMigration;
