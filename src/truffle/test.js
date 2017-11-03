require('setimmediate'); // Polyfill
const fs = require('fs');
const Promise = require('bluebird');
const dir = require("node-dir");
dir.files = (dir, cb) => {
  cb(null, ['/migrations/1_initial_migrations.js', '/migrations/2_deploy_contract.js'])
};
const ReadStream = require('read-stream');
const WriteStream = require('write-stream');
const browserifyFs = require('browserify-fs');
//fsExtra = require('fs-extra');
Object.assign(fs, browserifyFs); // I don't know why this is necessary

fs.ReadStream = ReadStream;
fs.WriteStream = WriteStream;
fs.access = fs.exists;
fs.fdatasync = () => {};

const fsExtra = require('fs-extra');
Object.assign(fsExtra, fs);

const fileCache = {};

const originalWriteFile = fs.writeFile;
fs.writeFile = (path, content, encoding, cb) => {
  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = 'utf8';
  }
  fileCache[path] = content;
  originalWriteFile(path, content, encoding, cb);
};

fs.readFileSync = (file) => {
  if (fileCache[file]) {
    return fileCache[file];
  }
  throw 'No such file or directory';
}

// const fsExtra = require('fs-extra');
console.log('fsExtra: ', fsExtra);
fsExtra.outputFile = (output_path, content, encoding, cb) => {
  console.log('OUTPUT FILE: ', output_path, content, encoding);
  return fs.writeFile(output_path, content, cb);
};

const files = require('./files');

const solc = require('solc/wrapper');
const migrate = require('truffle-migrate');
const Resolver = require('truffle-resolver');
const Artifactor = require("truffle-artifactor");

process.chdir = (...args) => {
  console.log('CHANGE DIR: ', args);
}

const MIGRATIONS_PATH = '/migrations/';
const CONTRACTS_PATH = '/contracts/';
const BUILD_PATH = '/build'
const BUILD_CONTRACTS_PATH = BUILD_PATH + CONTRACTS_PATH;
const artifactor = new Artifactor(BUILD_CONTRACTS_PATH);
const migration1 = {
  content: 'var Migrations = artifacts.require("./Migrations.sol"); ' +
    'module.exports = function(deployer) {deployer.deploy(Migrations);};',
  path: MIGRATIONS_PATH + '1_initial_migrations.js',
};
const migration2 = {
  content: ' var SimpleStorage = artifacts.require("./SimpleStorage.sol");' +
    'module.exports = function(deployer) {deployer.deploy(SimpleStorage);};',
  path: MIGRATIONS_PATH + '2_deploy_contract.js',
};

const migrationsFile = {
  content: 'pragma solidity ^0.4.2;'+
    'contract Migrations {'+
    'address public owner;'+
    'uint public last_completed_migration;'+
    'modifier restricted() {if (msg.sender == owner) _;}'+
    'function Migrations() {owner = msg.sender;}'+
    'function setCompleted(uint completed) restricted {'+
    'last_completed_migration = completed;}'+
    'function upgrade(address new_address) restricted {'+
    'Migrations upgraded = Migrations(new_address);'+
    'upgraded.setCompleted(last_completed_migration);}}',
  path: CONTRACTS_PATH + 'Migrations.sol',
};

const simpleStorageFile = {
  content: 'pragma solidity ^0.4.2;' +
    'contract SimpleStorage {' +
    'uint storedData;' +
    'function set(uint x) {'+
    'storedData = x;}'+
    'function get() constant returns (uint) {'+
    'return storedData;}}',
  path: CONTRACTS_PATH + 'SimpleStorage.sol',
};

fs.mkdir(MIGRATIONS_PATH);
fs.mkdir(CONTRACTS_PATH);
fs.mkdir(BUILD_PATH);
fs.mkdir(BUILD_CONTRACTS_PATH);

//const migrate = require('../truffle-migrate');
const deployer = require('truffle-deployer');
const contract = require('truffle-contract');
const solcABI = require('solc/abi');
const Web3 = require('web3');

console.log('MODULE: ', window.Module);
const compiler = solc(window.Module);
const input = 'contract x { function g() {} }';
const output = compiler.compile(input, 1);
const migrationCompiled = compiler.compile(migrationsFile.content, 1);
const simpleCompiled = compiler.compile(simpleStorageFile.content, 1);


const migrationsJson = {
  contract_name: 'Migrations',
  abi: JSON.parse(migrationCompiled.contracts[':Migrations'].interface),
  binary: migrationCompiled.contracts[':Migrations'].bytecode,
};

const migrationsJsonFile = {
  content: JSON.stringify(migrationsJson),
  path: BUILD_CONTRACTS_PATH + 'Migrations.json',
};

const simpleStorageJson = {
  contract_name: 'SimpleStorage',
  abi: JSON.parse(simpleCompiled.contracts[':SimpleStorage'].interface),
  binary: simpleCompiled.contracts[':SimpleStorage'].bytecode,
};

const simpleStorageJsonFile = {
  content: JSON.stringify(simpleStorageJson),
  path: BUILD_CONTRACTS_PATH + 'SimpleStorage.json',
};

const abi = JSON.parse(output.contracts[':x'].interface);
const provider = new Web3.providers.HttpProvider('/testrpc/');
const web3 = new Web3(provider);
Promise.promisifyAll(web3.eth, { suffix: "Promise" });

function replaceLinkReferences(bytecode, linkReferences, libraryName) {
  var linkId = "__" + libraryName;

  while (linkId.length < 40) {
    linkId += "_";
  }

  linkReferences.forEach(function(ref) {
    // ref.start is a byte offset. Convert it to character offset.
    var start = (ref.start * 2) + 2;

    bytecode = bytecode.substring(0, start) + linkId + bytecode.substring(start + 40);
  });

  return bytecode;
};

async function init (){
  // await (new Promise((f) => setTimeout(f, 15000)));
  const accounts = await web3.eth.getAccountsPromise();
  console.log('ACCOUNTS: ', accounts);
  const balance = await web3.eth.getBalancePromise(accounts[0]);
  console.log('BALANCE: ', balance.toString());
  console.log('BALANCE: ', balance.toString());
  console.log('BALANCE: ', balance.toString());
  console.log('BALANCE: ', balance.toString());
  console.log('BALANCE: ', balance.toString());
  console.log('BALANCE: ', balance.toString());
  await (new Promise((f, r) => {
    fs.writeFile(migration1.path, migration1.content, 'utf8', (err) => {
      if (err) {
        r(err);
        return;
      }
      f();
    });
  }));
  console.log('MIGRATION 2');
  //await files.writeRaw(migration1.path, migration1.content);
  await files.writeFile(migration2);
  await files.writeFile(migrationsFile);
  await files.writeFile(simpleStorageFile);
  await files.writeFile(migrationsJsonFile);
  await files.writeFile(simpleStorageJsonFile);

  const resolver = new Resolver({
    working_directory: '/',
    contracts_build_directory: BUILD_CONTRACTS_PATH,
    from: accounts[0],
    gas: 900000,
  });
  migrate.run({
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
  }, async (err) => {
    if (err) {
      console.error('errorr', err);
      return;
    }
    const res = JSON.parse(await files.readFile('/build/contracts/SimpleStorage.json'));
    console.log(res);
    const contr = web3.eth.contract(res.abi).at(res.networks[42].address);
    contr.set(5, {from: accounts[0]}, (err, res) => {
      if (err) {
        console.log('ERR: ', err);
        return;
      }
      console.log('RES: ', res);
      contr.get.call((err, val) => {
        console.log('ERR: ', err);
        console.log('VALUE: ', val.toString());
      });
    });
    console.log('CONTR: ', contr);
    console.log('SUCCESS: ', res.networks[42].address);
  })
  console.log("The file was saved!");
}
init();
