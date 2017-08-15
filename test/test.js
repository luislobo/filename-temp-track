var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var fs = require('fs');
chai.use(chaiAsPromised);
chai.should();
var ft = require('../lib/index');

// according to your preference of assertion style

describe('Track a file', function () {

  beforeEach(function () {
    ft.cleanupAllSync();
  });

  it('should return a full path name', function () {
    return ft.track('myfile.txt')
      .then(function (pathName) {
        return pathName;
      })
      .should.eventually.contain('myfile.txt');
  });

  it('should be able to track the same file more than one time', function () {
    return ft.track('myfile.txt')
      .then(function () {
        return ft.track('myfile.txt');
      })
      .should.eventually.contain('myfile.txt');
  });

  it('should clear a filename', function () {
    return ft.track('another.txt')
      .then(function (pathName) {
        // creates an empty file
        return ft.cleanupFile(pathName)
          .then(function () {
            ft.getFilesBeingTracked().should.be.an('array').and.be.empty;
            return true;
          });
      });
  });

  it('should be able to track several files and clear them all', function () {
    return Promise.all([
      ft.track('1.txt'),
      ft.track('2.txt'),
      ft.track('3.txt')
    ])
      .then(function (result) {
        result.should.be.an('array').and.have.lengthOf(3);
        return ft.cleanupAll()
          .then(function () {
            ft.getFilesBeingTracked().should.be.an('array').and.be.empty;
            return true;
          });
      });
  });

  it('should track a file, wait for it\'s timeout, and the file should be gone', function () {
    return ft.track({filename: '3.txt', cleanupTimeout: 100})
      .then(function (pathName) {
        // create the file
        fs.closeSync(fs.openSync(pathName, 'w'));
        fs.existsSync(pathName).should.be.true;
        return pathName;
      })
      .delay(150)
      .then(function (pathName) {
        fs.existsSync(pathName).should.be.false;
      });
  });
});
