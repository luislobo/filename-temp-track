require('./frameworks.js');
const {promiseMap} = require('../utils');
const fs = require('fs');
const fsAsync = fs.promises;

const _ = require('lodash');

const ft = require('../lib/index');
const {setTimeout} = require('timers/promises');


const touch = filename => fs.closeSync(fs.openSync(filename, 'w'));


// according to your preference of assertion style

describe('The Default Tracker', () => {

  afterEach(() => ft.cleanupAllSync());

  describe('getting tracked files', () => {
    it('should get tracked files (nothing)', () => {
      const files = ft.getFilesBeingTracked();
      should.exist(files);
      files.should.have.length(0);
    });
    it('should get tracked files (some file)', async () => {
      await ft.track('awesomefile.txt');
      const files = ft.getFilesBeingTracked();
      should.exist(files);
      files.should.have.length(1);
    });
  });

  describe('BASE_DIR', () => {
    const TEST_DIR = '/tmp/myspecialtestdir';
    const ORIGINAL_DIR = ft.BASE_DIR;

    afterEach(() => {
      ft.BASE_DIR = ORIGINAL_DIR;
      try {
        fs.rmdirSync(TEST_DIR);
      } catch (err) {
        _.noop();
      }
    });
    describe('getting the base directory', () => {
      it('should return the BASE_DIR', () => should.equal(ft.BASE_DIR, ORIGINAL_DIR));
    });
    describe('setting the base directory', () => {
      it('should set the BASE_DIR', () => {
        ft.BASE_DIR = TEST_DIR;
        should.equal(ft.BASE_DIR, TEST_DIR);
      });
      it('should create the BASE_DIR', () => {
        ft.BASE_DIR = TEST_DIR;
        should.equal(ft.BASE_DIR, TEST_DIR);
        should.equal(fs.existsSync(TEST_DIR), true);
      });
      it('should handle when the BASE_DIR already exists', () => {
        fs.mkdirSync(TEST_DIR);
        ft.BASE_DIR = TEST_DIR;
        should.equal(ft.BASE_DIR, TEST_DIR);
        should.equal(fs.existsSync(TEST_DIR), true);
      });
    });
  });

  async function trackList() {
    const files = [
      '1.txt',
      '2.txt',
      '3.txt'
    ];
    const result = await promiseMap(files, file => ft.track(file));
    result.map(touch);
    result.should.be.an('array').and.have.lengthOf(3);
    return result;
  }

  describe('track', () => {
    describe('with a filename', () => {
      it('should return a full path name', async () => {
        (await ft.track('myfile.txt')).should.contain('myfile.txt');
      });

      it('should be able to track the same file more than one time', async () => {
        await ft.track('myfile.txt');
        (await ft.track('myfile.txt')).should.contain('myfile.txt');
      });

      it('should be able to track several files and clear them all', async () => trackList());

      it('should be able to track files not in the base directory', async () => {
        await ft.track('./specialfile.txt', 100, false);
        touch('./specialfile.txt');
        fs.existsSync('./specialfile.txt').should.be.true;
        await setTimeout(150);
        fs.existsSync('./specialfile.txt').should.be.false;
      });
    });

    describe('with a config object', () => {
      it('should still track just a file', async () => {
        const pathname = await ft.track({filename: 'somefile.txt'});
        touch(pathname);
        await ft.cleanupFile(pathname);
        fs.existsSync(pathname).should.be.false;
      });
      it('should track a file, wait for it\'s timeout, and the file should be gone', async () => {
        const pathname = await ft.track({
          filename: '3.txt',
          cleanupTimeout: 100
        });
        touch(pathname);
        fs.existsSync(pathname).should.be.true;

        await setTimeout(150);
        fs.existsSync(pathname).should.be.false;
      });
      it('place a file in the tracked directory by default', async () => {
        const pathname = await ft.track({
          filename: 'abc123.txt',
          cleanupTimeout: 100
        });
        pathname.should.match(/^\/tmp/);
      });
    });
  });

  describe('cleanupFile (async)', () => {
    it('should clear a filename', async () => {
      const pathname = await ft.track('another.txt');
      touch(pathname);
      fs.existsSync(pathname).should.be.true;
      await ft.cleanupFile(pathname);
      fs.existsSync(pathname).should.be.false;
      ft.getFilesBeingTracked().should.be.an('array').and.be.empty;
    });
    it('should handle errors', async () => {
      const pathname = 'another.txt';
      await ft.cleanupFile(pathname);
      fs.existsSync(pathname).should.be.false;
      ft.getFilesBeingTracked().should.be.an('array').and.be.empty;
    });
  });

  describe('cleanupFileSync', () => {
    it('should clear a filename', async () => {
      const pathname = await ft.track('another.txt');
      touch(pathname);
      fs.existsSync(pathname).should.be.true;
      ft.cleanupFileSync(pathname);
      fs.existsSync(pathname).should.be.false;
      ft.getFilesBeingTracked().should.be.an('array').and.be.empty;
    });
    it('should handle errors', async () => {
      const pathname = 'another.txt';
      ft.cleanupFileSync(pathname);
      fs.existsSync(pathname).should.be.false;
      ft.getFilesBeingTracked().should.be.an('array').and.be.empty;
    });
  });

  describe('cleanupAllSync', () => {
    describe('with a list of files', () => {
      let result;
      beforeEach(async () => {
        result = await trackList();
      });
      it('should clean up a list of files', async () => {
        ft.cleanupAllSync();
        ft.getFilesBeingTracked().should.be.an('array').and.be.empty;
        await promiseMap(result, async file => fs.existsSync(file).should.equal(false));
      });
      it('should handle errors', async () => {
        await promiseMap(result, file => fsAsync.unlink(file));
        ft.cleanupAllSync();
      });
    });
    it('should clean up nothing', async () => {
      ft.cleanupAllSync();
      ft.getFilesBeingTracked().should.be.an('array').and.be.empty;
    });
  });

  describe('cleanupAllSync', () => {
    describe('with a list of files', () => {
      let result;
      beforeEach(async () => {
        result = await trackList();
      });
      it('should clean up a list of files', async () => {
        await ft.cleanupAll();
        ft.getFilesBeingTracked().should.be.an('array').and.be.empty;
        await promiseMap(result, async file => fs.existsSync(file).should.equal(false));
      });
      it('should handle errors', async () => {
        await promiseMap(result, file => fsAsync.unlink(file));
        await ft.cleanupAll();
      });
    });
    it('should clean up nothing', async () => {
      await ft.cleanupAll();
      ft.getFilesBeingTracked().should.be.an('array').and.be.empty;
    });
  });

});

describe('The Tracker Class', () => {
  const {Tracker} = ft;
  it('should be the super class of the exported object', () => ft.should.be.an.instanceOf(Tracker));
  it('should be able to handle a different base directory', () => new Tracker('/tmp/root/of/tracker'));
});
