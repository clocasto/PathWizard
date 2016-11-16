PathWizard
=========
[![Coverage Status](https://coveralls.io/repos/github/clocasto/PathWizard/badge.svg?branch=master)](https://coveralls.io/github/clocasto/PathWizard?branch=master)  
A lightweight wrapper around `require` which finds node modules and files based on the shortest unique path.

## Description
While perfectly valid, requiring and importing files using relative paths can be tedious. This tool allows a user to specify the *shortest unique path name*. 

For example, if your project folder contains a `'server/db/index.js'` file, a developer can use PathWizard to grab the absolute file path (`abs`), relative file path (`rel`), or the file's module export (`req`) from just the shortest unique path of (`'index'`). However, if there were another `index.js` file in the project (`'client/index.js'`), an error would be thrown because `'index'` was not a unique path. Instead, the user could call any of the three methods with  `'db'`, *from anywhere in the project folder*, to access the file's path or export.

Upon the first invocation of one of its searching methods (`abs`, `absDir`, `rel`, `relDir`, and `req`), PathWizard will traverse the specified project root folder (`process.cwd` by default) and maintain a cache of all directories in the file tree.

***Note***: This module will **not** cache itself in node's `require.cache`. This is to enable dynamic updating of `module.parent.filename`, which the `req` method relies upon to find the invoking ('from') filepath.

## Installation

  ~~`npm install pathwizard --save`~~  
  `npm install https://github.com/clocasto/PathWizard.git`

## Usage

  `var pw = require('pathwizard')([projectPath], [])`

  `require('pathwizard')` is a constructor function which returns a new PathWizard instance. The constructor takes two optional parameters: absolute path to project root folder and options.

  `var options = {
  	cache: boolean,
  	ignored: array of directory names
  }`
  

## Shortest Unique Path

Given the following project folder structure:

    /test-folder
    ├── a
    │   ├── a.js
    │   └── test.js
    ├── app.js
    ├── b
    │   ├── b.js
    │   └── index.js
    ├── c
    │   └── c
    │       ├── c.js
    │       ├── d.js
    │       ├── f.js
    │       ├── g.js
    │       └── index.js
    └── index.js

Shortest Unique Filepath Results (based on the `abs` method):

Search String | Result | Reason
---------------------|-------------|------------
`'g'` or `'g.js'`          | `'/test-folder/c/c/g.js'`  | Success!
`'c/c'`, `'c/c/c'` or `'c'`| `'/test-folder/c/c/c.js'`  | Success!
`'index'` or `'index.js'`  | `throw new Error()`. | Index is not a unique path.  
`'b'`                    | `'test-folder/b/b.js'`. | Like `require`, `b.js` is prioritized over `b/index.js`.  

## API (Methods)

**abs**  
This method returns the absolute path of a matching **file**. This method does *not* match folders, but can find matching files within arbitrarily-named, nested folders.

**rel**  
This method returns the relative path *from the file invoking 'require'* to the matching **file**. This method does *not* match folders, but can find matching files within arbitrarily-named, nested folders.

**req**  
This method returns a module based on either a matching installed module *or* a matching file. This method uses the `abs` method to find matching files.

**absDir**  
This method returns the absolute path of a matching *folder*. This method does *not* match **files**.

**relDir**  
This method returns the relative path of a matching *folder*. This method does *not* match **files**.

**traverse**  
This method returns an array of all directory paths (files *and* folders) in the root directory.  

**ignore**  
This method adds the given directory name (note: this is *not* a path, but a folder or file name) to the list of directory names which are ignored. `node_modules` and `bower_components` are ignored by default.

## Tests

  npm test

## Contributing

Please use the AirBNB style guide for consistency. Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.0.1 Development
