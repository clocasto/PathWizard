pathwizard [![Build Status](https://travis-ci.org/clocasto/pathwizard.svg?branch=master)](https://travis-ci.org/clocasto/pathwizard) [![Coverage Status](https://coveralls.io/repos/github/clocasto/pathwizard/badge.svg?branch=master&version=1_0_0)](https://coveralls.io/github/clocasto/pathwizard?branch=master)
=========

A lightweight wrapper around `require` which finds node modules and files based on the shortest unique path. Instead of hard-coding string literals for relative module paths when using `require`, just specify the shortest, unique segment of a path, and pathwizard will find the correct full path.

***Note 1***: This module will **not** cache itself in node's `require.cache`. This is to enable dynamic updating of `module.parent.filename`, which pathwizard relies upon to find the invoking ('[from](https://nodejs.org/api/path.html#path_path_relative_from_to)') filepath when determining relative paths.  

***Note 2***: This module does *not* work in the browser. pathwizard currently relies upon node's `fs` to gather a list of all the directories in the project folder, so an error will be produced if the filesystem is inaccessible.  

#### Table of Contents  
  0. [Introduction](#introduction)
  1. [Shortest Unique Path](#shortest-unique-path)  
  2. [Installation](#installation)
  3. [Usage](#usage)
  4. [API and Methods](#api_methods)  
     * Invocation  
     * `abs`  
     * `rel`  
     * `absDir`  
     * `relDir`  
     * `ignore`  
     * `unignore`  
  5. [Tests](#tests)  
  6. [Contributing](#contributing)  
  
## <a href="introduction"></a>Introduction

PathWizard makes requiring modules and relative/absolute path finding simpler. A user can return a path to or require a file, `'server/db/index.js'`, *from anywhere in the project folder* just using the shortest unique path of (`'index'`). If there were another `index.js` file in the project folder, `'client/index.js'`, an error would be thrown because `'index'` would not be a unique path. Instead, the user might specify `'db'` to pathwizard to access the file's path or export.

Upon the importing the pathwizard module (pathwizard is a proxy around a module's `module.require` function), pathwizard will traverse the specified project root folder (`process.cwd` by default) and maintain a cached list of all discovered directories.

## <a href="shortest-unique-path"></a>Shortest Unique Path  
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

Search String | Output | Status
---------------------|-------------|------------
`'g'` or `'g.js'`          | `'/test-folder/c/c/g.js'`  | Success!
`'c/c'`, `'c/c/c'` or `'c'`| `'/test-folder/c/c/c.js'`  | Success!
`'index'` or `'index.js'`  | `throw new Error()`. | Index is not a unique path.  
`'b'`                    | `'test-folder/b/b.js'`. | Like `require`, `b.js` is prioritized over `b/index.js`.  

## <a href="installation"></a>Installation

  ~~`npm install pathwizard --save`~~  
  `npm install https://github.com/clocasto/pathwizard.git`

## <a href="usage"></a>Usage

  `require('pathwizard')` invokes a constructor function which returns a new pathwizard function instance (a proxy around the   `module.require` method of the invoking file). The pathwizard module takes one optional options parameter.

**Definition**  
  `const pw = require('pathwizard')(options)`

**Options**  
  `root [string]`: absolute path of project root directory  
  `cache [boolean]`: toggle caching of found directories list  
  `ignored [array[string]]`: list of directory names to ignore during file matching  
  
**Module Loading**  
  `pw('chai')` or `pw('server/db')`

## <a href="api_methods"></a>API and Methods

**Invocation**  
The function returned by `require('pathwizard')` behaves similarly to node.js' `require`. The difference is that it will find files based on the shortest unique path segment in addition to requiring modules by name, absolute path, or relative path.  
`pw('server/api'); // Loads the module.exports of the matching 'server/api.js' or 'server/api/index.js' file`  

**abs**  
This method returns the absolute path of a matching **file**. This method does *not* match folders, but can find matching files within arbitrarily-named, nested folders.  
`pw.abs('server/db'); // Returns absolute path to the matching server/db file`  

**rel**  
This method returns the relative path *from the file invoking 'rel'* to the matching **file**. This method does *not* match folders, but can find matching files within arbitrarily-named, nested folders.  
`pw.rel('server/db'); // Returns relative path from the invoking file to the matching 'db.js' or 'db/index.js' file`  

**absDir**  
This method returns the absolute path of a matching *folder*. This method does *not* match **files**.  
`pw.absDir('server/config'); // Returns absolute path to the matching 'config' folder directory`  

**relDir**  
This method returns the relative path of a matching *folder*. This method does *not* match **files**.
`pw.relDir('server/db/schema'); // Returns relative path to the matching 'schema' folder directory` 

**ignore**  
This method adds the provided directory name, or array of directory names, (note: this is *not* a path, but a folder or file name) to the list of directory names which are ignored. `node_modules` and `bower_components` are ignored by default.  
`pw.ignore('client'); // Adds the directory name, 'client', to the list of path segments to ignore when traversing the file system` 

**unignore**  
This method removes the provided directory name, or array of directory names, (note: this is *not* a path, but a folder or file name) to the list of directory names which are ignored. `node_modules` and `bower_components` are ignored by default.  
`pw.unignore('client'); // Removes the directory name, 'client', from the list of ignored path segments`   

## <a href="tests"></a>Tests

  `npm test`  
  `npm run cover:dev` for coverage report  

## <a href="contributing"></a>Contributing

Implement any changes in the src/ files and use `npm run transpile` to build the dist/ file.  
  
Please use the AirBNB style guide for consistency. Add unit tests for any new or changed functionality. Lint and test your code.  

## Release History

* 1.0.0 Release
