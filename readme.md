PathWizard
=========

A lightweight wrapper around `require` which finds modules and files based on the shortest unique path.

While perfectly valid, requiring and importing files using relative paths can be tedious. This tool allows a user to specify the *shortest unique path name*. For example, if your project folder contains a `'server/db/index.js'` file, one could either grab the absolute file path (`abs`), relative file path (`rel`), or the file's module export (`PathWizard.prototype.req`) by the shortest unique path of (`'index'`). However, if there were another `index.js` file in the project, an error would be thrown. Instead, the user could call any of the three methods, *from anywhere in the project folder*, with  `'db'` to access the file's path or export.

Upon the first invocation of one of its searching methods (`abs`, `absDir`, `rel`, `relDir`, and `req`), PathWizard will traverse the specified project root folder (`process.cwd` by default) and maintain a cache of all directories in the file tree.

***Note***: This module will **not** cache itself in node's `require.cache`. This is to enable dynamic updating of `module.parent.filename`, which the `req` method relies upon to find the invoking, 'from' filepath.

## Installation

  `npm install pathwizard --save`

## Usage

  `var pw = require('pathwizard')([Project Path]=process.cwd)`

## Shortest Unique Path

Given the following project folder structure:

`/test-folder
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
└── index.js`

Shortest Unique Filepath Results (based on the `abs` method):

`'g' or 'g.js'`: `'/test-folder/c/c/g.js'`
`'c/c' or 'c/c/c' or 'c'`: `'/test-folder/c/c/c.js'`
`'index' or 'index.js'`: `throw new Error()`. Index is not a unique path.
`'b'`: `'test-folder/b/b.js'`. Like `require`, `b.js` would take precedence over `b/index.js`.

## API (Methods)

`abs`
This method returns the absolute path of a matching **file**. This method does *not* match folders, but can find matching files within arbitrarily-named, nested folders.

`rel`
This method returns the relative path *from the file invoking 'require'* to the matching **file**. This method does *not* match folders, but can find matching files within arbitrarily-named, nested folders.

`req`
This method returns a module based on either a matching installed module *or* a matching file. This method uses the `abs` method to find matching files.

`absDir`
This method returns the absolute path of a matching *folder*. This method does *not* match **files**.

`relDir`
This method returns the relative path of a matching *folder*. This method does *not* match **files**.

`ignore`
This method adds the given directory name (note: this is *not* a path, but a folder or file name) to the list of directory names which are ignored. `node_modules` and `bower_components` are ignored by default.

## Tests

  npm test

## Contributing

Uses the AirBNB style guide. Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release