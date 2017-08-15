var AN_HOUR = 3600000;

var fileTracking = [];

var baseDirectory = require('tempy').directory();
var _ = require('lodash');
var path = require('path');
var Promise = require('bluebird');
var fs = require('fs');
Promise.promisifyAll(fs);

// add process on exit handler to clean up all files
process.addListener('exit', function () {
  cleanupAllSync();
});

module.exports = {
  track: track,
  cleanupFile: cleanupFile,
  cleanupFileSync: cleanupFileSync,
  cleanupAll: cleanupAll,
  cleanupAllSync: cleanupAllSync,
  getBaseDirectory: function () {
    return baseDirectory;
  },
  getFilesBeingTracked: function () {
    return fileTracking;
  }
};

function track(options) {
  return Promise.try(function () {
    // set up parameters
    var filename;
    var cleanupTimeout = AN_HOUR;
    if (_.isString(options)) {
      filename = options;
    } else { // treat as object
      filename = options.filename;
      cleanupTimeout = options.cleanupTimeout || AN_HOUR;
    }
    // full directory and file name
    var pathName = path.join(baseDirectory, filename);

    // add to array if it does not exist
    if (fileTracking.indexOf(pathName) === -1) {
      fileTracking.push(pathName);
      // configure automatic cleanup
      setTimeout(function (pathname) {
        fs.access(pathname, function (err) {
          if (err) {
            // do nothing
          } else {
            fs.unlink(pathname, function () {
              // do nothing
            });
          }
        });
      }, cleanupTimeout, pathName);
    }
    return pathName;
  });
}

function cleanupFile(pathName) {
  return fs.unlinkAsync(pathName)
    .catch(function () {
      // ignore if it does not exist
    })
    .finally(function () {
      _.remove(fileTracking, function (file) {
        return file === pathName;
      });
    });
}

function cleanupFileSync(pathName) {
  try {
    fs.unlinkSync(pathName);
  } catch (err) {
    // do nothing
  }
  _.remove(fileTracking, function (file) {
    return file === pathName;
  });
}

function cleanupAll() {
  return Promise.all(fileTracking, fs.unlinkAsync)
    .catch(function () {
      // do nothing
    })
    .finally(function () {
      fileTracking = [];
    });
}

function cleanupAllSync() {
  try {
    _.forEach(fileTracking, fs.unlinkSync);
  } catch (err) {
    // do nothing
  }
  fileTracking = [];
}
