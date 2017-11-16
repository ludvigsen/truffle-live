/*global location*/
/*eslint no-restricted-globals: ["error", "event", "fdescribe"]*/
import {
  TESTS_PATH,
  CONTRACTS_PATH,
  MIGRATIONS_PATH,
  BUILD_CONTRACTS_PATH,
} from './paths';
import {dir} from './files';
const Promise = require('bluebird');
const ttest = require('truffle-core/lib/test');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider('/testrpc/');
const web3 = new Web3(provider);
Promise.promisifyAll(web3.eth, {suffix: 'Promise'});

console.log(test);

async function test() {
  const accounts = await web3.eth.getAccountsPromise();
  let tests = await dir(TESTS_PATH);
  tests = tests.map(t => `${TESTS_PATH}${t}`);
  return new Promise((f, r) => {
    ttest.run(
      {
        contracts_directory: CONTRACTS_PATH,
        contracts_build_directory: BUILD_CONTRACTS_PATH,
        migrations_directory: MIGRATIONS_PATH,
        test_files: tests,
        network: 'dev',
        network_id: 42,
        logger: console,
        networks: {
          dev: {
            network_id: 42,
            host: `${location.host}${location.pathname}testrpc/`,
            from: accounts[0],
            port: '',
            gas: 500000,
          },
        },
        provider: 'does not matter???',
      },
      (err, succ) => {
        if (err) {
          r(err);
          console.log('ERR: ', err);
          return;
        }
        f(succ);
      },
    );
  });
}

export default test;
