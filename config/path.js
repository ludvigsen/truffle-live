const path = require('../node_modules/path');
const backup = {};
const res = Object.keys(path).reduce((obj, key) => {
  if (typeof path[key] === 'function') {
    backup[key] = path[key];
    obj[key] = function() {
      if (path[key] && path[key].apply) {
        return path[key].apply(this, arguments);
      }
      console.log('WHAT THE ACTUAL FUCK', key);
      console.log('WHAT THE ACTUAL FUCK', backup);
      console.log('WHAT THE ACTUAL FUCK', backup[key]);
      console.log('WHAT THE ACTUAL FUCK', backup[key].apply);
      return backup[key].apply(this, arguments);
    };
  } else {
    obj[key] = path[key];
  }
  return obj;
}, {});
module.exports = res;
