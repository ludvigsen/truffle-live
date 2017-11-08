'use strict';

if (typeof Promise === 'undefined') {
  // Rejection tracking prevents a common issue where React gets into an
  // inconsistent state due to an error, but it gets swallowed by a Promise,
  // and the user has no idea what causes React's erratic future behavior.
  require('promise/lib/rejection-tracking').enable();
  window.Promise = require('promise/lib/es6-extensions.js');
}

// fetch() polyfill for making API calls.
require('whatwg-fetch');

// Object.assign() is commonly used with React.
// It will use the native implementation if it's present and isn't buggy.
Object.assign = require('object-assign');

// In tests, polyfill requestAnimationFrame since jsdom doesn't provide it yet.
// We don't polyfill it in the browser--this is user's responsibility.
if (process.env.NODE_ENV === 'test') {
  require('raf').polyfill(global);
}

require('setimmediate'); // Polyfill

// FS polyfills
const fs = require('fs');
const ReadStream = require('read-stream');
const WriteStream = require('write-stream');
const browserifyFs = require('browserify-fs');
Object.assign(fs, browserifyFs); // I don't know why this is necessary

fs.ReadStream = ReadStream;
fs.WriteStream = WriteStream;
fs.access = fs.exists;
fs.fdatasync = () => {};

const fsExtra = require('fs-extra');
Object.assign(fsExtra, fs);

let fileCache = {};
try {
  const fileCacheString = localStorage.getItem('fileCache');
  fileCache = JSON.parse(fileCacheString);
} catch (e) {
  console.error('COULD NOT LOAD FILECACHE');
}
if (!fileCache) {
  fileCache = {};
}

const originalWriteFile = fs.writeFile;
fs.writeFile = (path, content, encoding, cb) => {
  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = 'utf8';
  }
  fileCache[path] = content;
  localStorage.setItem('fileCache', JSON.stringify(fileCache));
  originalWriteFile(path, content, encoding, cb);
};

const originalReadFile = fs.readFile;
fs.readFile = (path, encoding, cb) => {
  console.log('PATH: ', path, encoding, cb);

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = 'utf8';
  }
  if (window.currentDir && path.charAt(0) === '.') {
    path = `${window.currentDir}/${path.substr(1)}`;
  }
  console.log('READING ', path);
  originalReadFile(path, encoding, cb);
}

fs.readFileSync = (path) => {
  console.log('READ FILE SYNC: ', path);
  if (window.currentDir && path.charAt(0) === '.') {
    path = `${window.currentDir}/${path.substr(1)}`;
  }
  console.log('READ FILE SYNC: ', path);
  console.log('fileCache: ', fileCache);
  if (fileCache[path]) {
    console.log('IN CACHE!!');
    return fileCache[path];
  }
  throw 'No such file or directory';
}

fsExtra.outputFile = (output_path, content, encoding, cb) => {
  console.log('OUTPUT FILE: ', output_path, content, encoding);
  return fs.writeFile(output_path, content, cb);
};

const dir = require("node-dir");
dir.files = (dir, cb) => {
  fs.readdir(dir, (err, files) => {
    cb(null, files.map(f => `${dir}${f}`));
  });
};

const soljson = require('solc/soljson');
console.log('soljson: ', soljson);
Object.assign(soljson, window.Module);
console.log('soljson: ', soljson);

process.chdir = (dir) => {
  window.currentDir = dir;
  console.log('CHANGE DIR: ', dir);
};

const mocha = require('mocha');
console.log(mocha);
const path = require('path');
console.log('###');
console.log('###');
console.log(path);
console.log('###');
console.log('###');
