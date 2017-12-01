const mocha = require('../node_modules/mocha/lib/mocha');
const path = require('path');
mocha.prototype.loadFiles = function(fn) {
  var self = this;
  var suite = this.suite;
  this.files.forEach(function(file) {
    file = path.resolve(file);
    const fileCache = JSON.parse(localStorage.getItem('fileCache'));
    suite.emit('pre-require', global, file, self);
    suite.emit('require', eval(fileCache[file]), self);
    suite.emit('post-require', global, file, self);
  });
  fn && fn();
};
module.exports = mocha;
