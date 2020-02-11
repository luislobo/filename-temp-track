const HOUR = 3600000;

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const Promise = require('bluebird');
const debug = require('debug')('filename-temp-track');

Promise.promisifyAll(fs);

class Tracker {
  constructor(base = `/tmp/${process.pid}`) {
    fs.mkdirSync(base, {recursive: true});
    this.files = {};
    this.base = base;
    process.addListener('exit', () => this.cleanupAllSync());
  }

  getFilesBeingTracked() {
    return _.keys(this.files);
  }
  get BASE_DIR() {
    return this.base;
  }
  set BASE_DIR(dir) {
    fs.mkdirSync(dir, {recursive: true});
    this.base = dir;
  }
  async track(filename, timeout = HOUR, inDirectory = true) {
    if (_.isObject(filename)) {
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
      await fs.unlinkAsync(pathname);
    } catch (err) {
      debug(err);
    } finally {
      _.unset(this.files, pathname);
    }
  }

  cleanupFileSync(pathname) {
    try {
      fs.unlinkSync(pathname);
    } catch (err) {
      debug(err);
    }
    _.unset(this.files, pathname);
  }

  async cleanupAll() {
    await Promise.map(_.keys(this.files), file => fs.unlinkAsync(file)
      .catch(debug));
    this.files = {};
  }

  cleanupAllSync() {
    _.keys(this.files).forEach((file) => {
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
