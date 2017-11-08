import { exists, writeFile, mkdir } from './files';
import { BUILD_CONTRACTS_PATH, MIGRATIONS_PATH, CONTRACTS_PATH, BUILD_PATH, TESTS_PATH } from './paths';


const PATHS = [MIGRATIONS_PATH, CONTRACTS_PATH, BUILD_PATH, TESTS_PATH, BUILD_CONTRACTS_PATH];

const migration1 = {
  content: 'var Migrations = artifacts.require("./Migrations.sol");\n ' +
    'module.exports = function(deployer) {\n  deployer.deploy(Migrations);\n};',
  path: MIGRATIONS_PATH + '1_initial_migrations.js',
};
const migration2 = {
  content: ' var SimpleStorage = artifacts.require("./SimpleStorage.sol");\n' +
    'module.exports = function(deployer) {\n  deployer.deploy(SimpleStorage);\n};',
  path: MIGRATIONS_PATH + '2_deploy_contract.js',
};

const migrationsFile = {
  content: 'pragma solidity ^0.4.2;\n'+
    'contract Migrations {\n'+
    '  address public owner;\n '+
    '  uint public last_completed_migration;\n\n'+
    '  modifier restricted() {\n    if (msg.sender == owner)\n      _;\n  }\n\n'+
    '  function Migrations() {\n    owner = msg.sender;\n  }\n\n'+
    '  function setCompleted(uint completed) restricted {\n'+
    '    last_completed_migration = completed;\n  }\n\n'+
    '  function upgrade(address new_address) restricted {\n'+
    '    Migrations upgraded = Migrations(new_address);\n'+
    '    upgraded.setCompleted(last_completed_migration);\n  }\n}',
  path: CONTRACTS_PATH + 'Migrations.sol',
};

const simpleStorageFile = {
  content: 'pragma solidity ^0.4.2;\n' +
    'contract SimpleStorage {\n' +
    '  uint storedData;\n\n' +
    '  function set(uint x) {\n'+
    '    storedData = x;\n  }\n\n'+
    '  function get() constant returns (uint) {\n'+
    '    return storedData;\n  }\n}',
  path: CONTRACTS_PATH + 'SimpleStorage.sol',
};

const simpleStorageTest = {
  content: 'const SimpleStorage = artifacts.require("./SimpleStorage.sol");\n' +
    'contract(\'SimpleStorage\', function(accounts) {\n' +
    '  it("should init and change value", function() {\n' +
    '    SimpleStorage.deployed().then(storage => {\n' +
    '      storage.value.call().then(function(value) {\n' +
    '        assert.equal(value, 0, "Value should be zero after dep.");\n' +
    '      }).then(function() {\n'+
    '        return storage.setValue(5);\n' +
    '      }).then(function(tx) {\n' +
    '        return storage.value.call();\n' +
    '      }).then(function(value) {\n' +
    '        assert.equal(value, 5, "Value should be five.");\n'+
    '      });\n'+
    '    });\n' +
    '  });\n' +
    '});',
  path: TESTS_PATH + 'simpleStorageTest.js',
}

const files = [migration1, migration2, migrationsFile, simpleStorageFile, simpleStorageTest];

async function init() {
  for (const path of PATHS) {
    if (!(await exists(path))) {
      await mkdir(path);
    }
  }
  for (const file of files) {
    const isThere = await exists(file.path);
    if (!isThere) {
      await writeFile(file);
    }
  }
}

export default init;
