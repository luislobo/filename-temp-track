const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
chai.use(chaiAsPromised);
chai.should();

const Promise = require('bluebird');

const ft = require('../lib/index');

// according to your preference of assertion style

describe('Track a file', () => {

  beforeEach(() => ft.cleanupAllSync());

  it('should return a full path name', () => ft.track('myfile.txt')
    .then(pathName => pathName)
    .should.eventually.contain('myfile.txt'));

  it('should be able to track the same file more than one time', () => ft.track('myfile.txt')
    .then(() => ft.track('myfile.txt'))
    .should.eventually.contain('myfile.txt'));

  it('should clear a filename', async () => {
    const pathname = await ft.track('another.txt');
    // creates an empty file
    await ft.cleanupFile(pathname);
    ft.getFilesBeingTracked().should.be.an('array').and.be.empty;
  });

  it('should be able to track several files and clear them all', async () => {
    const result = await Promise.all([
      ft.track('1.txt'),
      ft.track('2.txt'),
      ft.track('3.txt')
    ]);

    result.should.be.an('array').and.have.lengthOf(3);
    await ft.cleanupAll();
    ft.getFilesBeingTracked().should.be.an('array').and.be.empty;
  });

  it('should track a file, wait for it\'s timeout, and the file should be gone', async () => {
    const pathname = await ft.track({
      filename: '3.txt',
      cleanupTimeout: 100
    });
    fs.closeSync(fs.openSync(pathname, 'w'));
    fs.existsSync(pathname).should.be.true;

    await Promise.delay(150);
    fs.existsSync(pathname).should.be.false;
  });
});
