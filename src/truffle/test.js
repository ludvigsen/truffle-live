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
const provider = new Web3.providers.HttpProvider('testrpc/');
const web3 = new Web3(provider);
Promise.promisifyAll(web3.eth, {suffix: 'Promise'});

async function test(loggerCallback) {
  // TODO: Don't duplicate this
  const callLogger = (...args) => {
    loggerCallback(...args);
  };
  const loggers = ['debug', 'error', 'info', 'log', 'warn'];
  const logger = loggers.reduce((res, l) => {
    res[l] = callLogger;
    return res;
  }, {});

  const accounts = await web3.eth.getAccountsPromise();
  let tests = await dir(TESTS_PATH);
  tests = tests.map(t => `${TESTS_PATH}${t}`);
  const originalLog = console.log;
  console.log = (...args) => {
    if (window.testIsRunning) {
      logger.log(...args);
    } else {
      originalLog(...args);
    }
  };
  window.testIsRunning = true;
  return new Promise((f, r) => {
    ttest.run(
      {
        contracts_directory: CONTRACTS_PATH,
        contracts_build_directory: BUILD_CONTRACTS_PATH,
        migrations_directory: MIGRATIONS_PATH,
        test_files: tests,
        network: 'dev',
        network_id: 42,
        logger,
        networks: {
          dev: {
            network_id: 42,
            host: `${location.host}` + `${location.pathname}testrpc/`,
            from: accounts[0],
            port: window.location.protocol === 'https:' ? 443 : 80,
            gas: 500000,
          },
        },
        provider: provider,
      },
      (err, succ) => {
        window.testIsRunning = false;
        console.log = originalLog;
        if (err) {
          r(err);
          console.error(err);
          return;
        }
        f(succ);
      },
    );
  });
}

export default test;
