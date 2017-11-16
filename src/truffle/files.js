const fs = require('fs');

export function dir(path) {
  return new Promise((f, r) => {
    fs.readdir(path, (err, files) => {
      f(files);
    });
  });
}

export function exists(path) {
  return new Promise((f, r) => {
    fs.exists(path, bool => {
      f(bool);
    });
  });
}

export function writeRaw(path, content) {
  return new Promise((f, r) => {
    fs.writeFile(path, content, 'utf8', err => {
      if (err) {
        r(err);
        return;
      }
      f();
    });
  });
}

export function rmdir(path) {
  return new Promise((f, r) => {
    fs.rmdir(path, err => {
      if (err) {
        r(err);
        return;
      }
      f();
    });
  });
}

export function readdir(path) {
  return new Promise((f, r) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        r(err);
        return;
      }
      f(files);
    });
  });
}

async function recursiveRemoveDir(path) {
  const dirExists = await exists(path);
  console.log('dir exists: ', dirExists);
  if (dirExists) {
    const subFiles = await readdir(path);
    console.log('subFiles: ', subFiles);
    for (let i = 0; i < subFiles.length; i++) {
      await recursiveRemoveDir(subFiles[i]);
    }
    console.log('remove: ', path);
    await rmdir(path);
  }
}

export const mkdir = path => {
  return new Promise((f, r) => {
    fs.mkdir(path, err => {
      if (err) {
        r(err);
        return;
      }
      f();
    });
  });
};

export const readFile = path => {
  return new Promise((f, r) => {
    fs.readFile(path, 'utf8', (err, res) => {
      if (err) {
        r(err);
        return;
      }
      f(res);
    });
  });
};

export const writeFile = file => {
  console.log('WRITE FILE: ', file.path);
  return writeRaw(file.path, file.content);
};
