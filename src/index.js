import React from 'react';
import ReactDOM from 'react-dom';
// import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import registerTestRPCServiceWorker from './testrpc/registerTestRPCServiceWorker';
import initFiles from './truffle/init-files';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
registerTestRPCServiceWorker(() => {
  initFiles();
  //console.log('READY');
});

// setTimeout(() => {
  //require('./truffle/test');
// }, 5000)
