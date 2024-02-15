const HOUR = 3600000;
const {promiseMap, isObject} = require('../utils');

const fs = require('fs');
const fsAsync = fs.promises;
const path = require('path');


const debug = require('debug')('filename-temp-track');

class Tracker {
  constructor(base = `/tmp/${process.pid}`) {
    fs.mkdirSync(base, {recursive: true});
    this.files = {};
    this.base = base;
    process.addListener('exit', () => this.cleanupAllSync());
  }

  getFilesBeingTracked() {
    return Object.keys(this.files);
  }
  get BASE_DIR() {
    return this.base;
  }
  set BASE_DIR(dir) {
    fs.mkdirSync(dir, {recursive: true});
    this.base = dir;
  }
  async track(filename, timeout = HOUR, inDirectory = true) {
    if (isObject(filename)) {
      timeout = filename.cleanupTimeout || timeout;
      inDirectory = filename.inDirectory || inDirectory;
      filename = filename.filename;
    }
    if (inDirectory) {
      filename = path.join(this.base, filename);
    }
    if (this.files[filename]) {
      return filename;
    }
    this.files[filename] = true;
    // configure automatic cleanup
    setTimeout(() => this.cleanupFile(filename), timeout);
    return filename;
  }

  async cleanupFile(pathname) {
    try {
      await fsAsync.unlink(pathname);
    } catch (err) {
      debug(err);
    } finally {
      delete this.files[pathname];
    }
  }

  cleanupFileSync(pathname) {
    try {
      fs.unlinkSync(pathname);
    } catch (err) {
      debug(err);
    }
    delete this.files[pathname];
  }

  async cleanupAll() {
    await promiseMap(Object.keys(this.files),
      file => fsAsync.unlink(file).catch(debug));
    this.files = {};
  }

  cleanupAllSync() {
    Object.keys(this.files).forEach((file) => {
      try {
        fs.unlinkSync(file);
      } catch (err) {
        debug(err);
      }
    });
    this.files = {};
  }
}


module.exports = new Tracker();
module.exports.Tracker = Tracker;
