exports = function(file) {
  console.log('THIS IS WORKING', file);
  const fileCache = JSON.stringify(localStorage.getItem('fileCache'));
  console.log('THIS IS WORKING', fileCache[file]);
  return fileCache[file];
};
