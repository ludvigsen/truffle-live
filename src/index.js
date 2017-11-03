import React from 'react';
import ReactDOM from 'react-dom';
// import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import registerTestRPCServiceWorker from './testrpc/registerTestRPCServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
registerTestRPCServiceWorker(() => {
  console.log('READY');
});

setTimeout(() => {
  require('./truffle/test');
}, 5000)
