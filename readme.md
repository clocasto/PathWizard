PathWizard [![Build Status](https://travis-ci.org/clocasto/PathWizard.svg?branch=master)](https://travis-ci.org/clocasto/PathWizard) [![Coverage Status](https://coveralls.io/repos/github/clocasto/PathWizard/badge.svg?branch=master&x=y)](https://coveralls.io/github/clocasto/PathWizard?branch=master)
=========

A lightweight wrapper around `require` which finds node modules and files based on the shortest unique path.

PathWizard makes requiring modules and relative/absolute path finding simpler. A user can return a path to or require a file, `'server/db/index.js'`, from just the shortest unique path of (`'index'`). If there were another `index.js` file in the project folder, `'client/index.js'`, an error would be thrown because `'index'` was not a unique path. Instead, the user might specify `'db'` to PathWizard, *from anywhere in the project folder*, to access the file's path or export.

Upon the first invocation of one of its searching methods (`abs`, `absDir`, `rel`, `relDir`, and `req`), PathWizard will traverse the specified project root folder (`process.cwd` by default) and maintain a cache of all discovered directories.

***Note***: This module will **not** cache itself in node's `require.cache`. This is to enable dynamic updating of `module.parent.filename`, which the `req` method relies upon to find the invoking ('[from](https://nodejs.org/api/path.html#path_path_relative_from_to)') filepath.

#### Table of Contents  
  1. [Shortest Unique Path](#shortest_unique_path)  
  2. [Installation](#installation)
  3. [Usage](#usage)
  4. [API (Methods)](#api)  
     ** `abs`  
     ** `rel`  
     ** `req`  
     ** `absDir`  
     ** `relDir`  
     ** `traverse`  
     ** `ignore`  
  5. [Tests](#tests)  
  6. [Configuring](#configuring)  

## <a href="shortest_unique_path"></a>Shortest Unique Path

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

## <a href="#installation"></a>Installation

  ~~`npm install pathwizard --save`~~  
  `npm install https://github.com/clocasto/PathWizard.git`

## <a href="usage"></a>Usage

  `var pw = require('pathwizard')()`

  `require('pathwizard')` is a constructor function which returns a new PathWizard instance. The constructor takes two optional parameters: absolute path to project root folder and options.

  `var options = {
  	cache: boolean,
  	ignored: array of directory names
  }`

## <a href="api"></a>API (Methods)

**abs**  
This method returns the absolute path of a matching **file**. This method does *not* match folders, but can find matching files within arbitrarily-named, nested folders.

**rel**  
This method returns the relative path *from the file invoking 'rel'* to the matching **file**. This method does *not* match folders, but can find matching files within arbitrarily-named, nested folders.

**req**  
This method returns a module based on either a matching installed module *or* a matching file. This method uses the `abs` method to find matching files.

**absDir**  
This method returns the absolute path of a matching *folder*. This method does *not* match **files**.

**relDir**  
This method returns the relative path of a matching *folder*. This method does *not* match **files**.

**traverse**  
This method returns an array of all directory paths (files *and* folders) in the PathWizard instance's root directory.  

**ignore**  
This method adds the provided directory name (note: this is *not* a path, but a folder or file name) to the list of directory names which are ignored. `node_modules` and `bower_components` are ignored by default.

## <a href="tests"></a>Tests

  npm test

## <a href="contributing"></a>Contributing

Please use the AirBNB style guide for consistency. Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.0.1 Development
