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


### track(filename, cleanupTimeout, inDirectory)
Tracks a filename, under a temporary folder, and deletes it after an hour, by default.
- `filename`: string with the file name. If inDirectory is false, this is the full path of the file to track
- `cleanuptimeout`: number in ms after which to delete the file
- `filename`: boolean (default true)
- Returns a Promise with the full path name, including the base temporary directory.
- filename can be an object with all the same properties as the method signature. 

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

### getFilesBeingTracked()
Returns the array of files being tracked

## History

v 2.0.0 - Refactor into Class

v 1.0.0 - Initial version

## License
MIT - Copyright (c) 2017 - Luis Lobo Borobia