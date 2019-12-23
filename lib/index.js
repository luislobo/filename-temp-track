const HOUR = 3600000;

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const Promise = require('bluebird');

Promise.promisifyAll(fs);

class Tracker {
  constructor(base = '/tmp') {
    this.files = {};
    this.base = base;
    process.addListener('exit', () => this.cleanupAllSync());
  }

  getFilesBeingTracked() {
    return _.values(this.files);
  }
  get BASE_DIR() {
    return this.base;
  }
  set BASE_DIR(dir) {
    this.base = dir;
  }
  async track(filename, timeout = HOUR, inDirectory = true) {
    if (_.isObject(filename)) {
      timeout = filename.cleanupTimeout || timeout;
      filename = filename.filename;
      inDirectory = filename.inDirectory;
    }
    if (inDirectory) {
      filename = path.join(this.base, filename);
    }
    if (this.files[filename]) {
      return filename;
    }
    this.files[filename] = true;
    // configure automatic cleanup
    setTimeout(async (file) => {
      try {
        await fs.unlinkAsync(file);
      } catch (err) {
      // do nothing
      }
    }, timeout, filename);
    return filename;
  }

  async cleanupFile(pathname) {
    try {
      await fs.unlinkAsync(pathname);
    } catch (err) {
    // do nothing
    } finally {
      _.unset(this.files, pathname);
    }
  }

  cleanupFileSync(pathname) {
    try {
      fs.unlinkSync(pathname);
    } catch (err) {
    // do nothing
    }
    _.unset(this.files, pathname);
  }

  async cleanupAll() {
    try {
      await Promise.map(_.values(this.files), fs.unlinkAsync);
    } catch (err) {
      _.noop();
    } finally {
      this.files = {};
    }
  }

  cleanupAllSync() {
    try {
      _.forEach(this.files, fs.unlinkSync);
    } catch (err) {
    // do nothing
    }
    this.files = {};
  }
}


module.exports = new Tracker();
module.exports.Tracker = Tracker;
