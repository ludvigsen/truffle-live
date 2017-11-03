/*global self*/
/*eslint no-restricted-globals: ["error", "event", "fdescribe"]*/
const DB_PATH = 'database';
console.log('TEST: ', process);

process.versions = {
  node: '',
};

process.binding = (name) => {
  console.log('name: ', name);
  return { fs: {}, os: { errno: {} } };
};

const fsPolyfill = require('browserify-fs');
const fs = require('fs');

Object.assign(fs, fsPolyfill);
fs.rmdirSync = () => {};
console.log('FS: ', fs);
fs.mkdir('/tmp');
// const browserifyFs = require('browserify-fs');
// Object.assign(fs, browserifyFs); // Hacky, should be possible to do this within browserify config
const Provider = require('ganache-core/lib/provider');

fs.mkdir(DB_PATH);
let provider;

self.addEventListener('install', function(event) {
  return new Promise(async (f, r) => {
    provider = new Provider({ network_id: 42 });
    console.log('PROVIDER: ', provider);
    await (new Promise((f) => setTimeout(f, 5000)));
    f();
  });
});

self.addEventListener('fetch', function(event) {
  if (event.request.url.indexOf('testrpc') !== -1){
    const headers = {
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*"
    };

    return event.respondWith(new Promise((f, r) => {
      event.request.json().then(payload => {
        console.log('DATA: ', payload);
        provider.sendAsync(payload, (err, result) => {
          if (err) {
            r(err);
            return;
          }
          headers["Content-Type"] = "application/json";
          f(new Response(JSON.stringify(result), {
            status: 200,
            headers,
          }));
        });
      }).catch((err) => {
        headers["Content-Type"] = "text/plain";
        f(new Response('', {
          status: 400,
          headers,
        }));
      });
    }));
  }
  console.log('event.request.url: ', event.request.url);
  return fetch(event.request);
});
