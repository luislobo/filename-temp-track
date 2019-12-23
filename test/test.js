const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
chai.use(chaiAsPromised);
chai.should();

const Promise = require('bluebird');

const ft = require('../lib/index');

const touch = filename => fs.closeSync(fs.openSync(filename, 'w'));


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
    const files = [
      '1.txt',
      '2.txt',
      '3.txt'
    ];
    const result = await Promise.map(files, file => ft.track(file));
    result.map(touch);


    result.should.be.an('array').and.have.lengthOf(3);
    await ft.cleanupAll();
    ft.getFilesBeingTracked().should.be.an('array').and.be.empty;

    await Promise.map(result, async file => fs.existsSync(file).should.equal(false));
  });

  it('should track a file, wait for it\'s timeout, and the file should be gone', async () => {
    const pathname = await ft.track({
      filename: '3.txt',
      cleanupTimeout: 100
    });
    touch(pathname);
    fs.existsSync(pathname).should.be.true;

    await Promise.delay(150);
    fs.existsSync(pathname).should.be.false;
  });
});
