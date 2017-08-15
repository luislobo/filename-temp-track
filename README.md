# File name tracking in temporary directory and auto clean up

Keeps track of filenames, saved in a temporary folder, and automatically cleans up by default in an hour

Useful when receiving files being uploaded, or downloaded, that needs to be cleaned up after some time or
when the process exits

## Install

```bash
npm install filename-temp-track
```
or
```
yarn filename-temp-track
```

## Use

The library exposes the following functions:
 track, cleanupFile, cleanupFileSync, cleanupAll, cleanupAllSync and getBaseDirectory:


### track(filename|opts)
Tracks a filename, under a temporary folder, and deletes it after an hour, by default.
- `filename|opts`: It accepts a filename or an object with options. Options could be `filename` with the filename, and `cleanupTimeout`
with a cleanup timeout in milliseconds.
- Returns a Promise with the full path name, including the base temporary directory.

Example: 
```javascript
// Tracks for a filename, using the default timeout of an hour
ft.track('filename.xls')
  .then(function(pathName){ // pathName should be /tmp/sometemp/filename.xls});
```

Example: 
```javascript
// Tracks for a filename, using a custom timeout of a minute
ft.track({filename: 'filename.xls', cleanupTimeout: 1000 * 60})
  .then(function(pathName){ // pathName should be /tmp/sometemp/filename.xls});
```

### cleanupFile(pathname)
Cleans up the pathname
- `pathname`: is the full path name of the file to cleaned up
- Returns a Promise 

### cleanupFileSync(pathname)
Cleans up the pathname (sync version)
- `pathname`: is the full path name of the file to cleaned up
- Returns undefined

### cleanupAll()
Cleans up all the files being controlled by this module

### cleanupAllSync()
Cleans up all the files being controlled by this module (sync version)

### getBaseDirectory()
Returns the temporary base directory

### getFilesBeingTracked()
Returns the array of files being tracked

## History

v 1.0.0 - Initial version

## License
MIT - Copyright (c) 2017 - Luis Lobo Borobia