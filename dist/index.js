'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');

module.exports = PathWizardModule;

//Prevents PathWizard from being cached in require.cache - enables `rel` method functionality
if (require.cache && __filename) delete require.cache[__filename];

function PathWizardModule() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (options.root && typeof options.root !== 'string') throw new Error('PathWizard constructor only accepts undefined or a string-typed project directory.');
  var _PathWizard = new PathWizard(options);
  return proxifyPathWizard(_PathWizard);
}

var PathWizard = function () {
  function PathWizard() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$cache = _ref.cache,
        cache = _ref$cache === undefined ? true : _ref$cache,
        _ref$ignored = _ref.ignored,
        ignored = _ref$ignored === undefined ? ['node_modules', 'bower_components'] : _ref$ignored,
        _ref$root = _ref.root,
        rootPath = _ref$root === undefined ? process.cwd() : _ref$root;

    _classCallCheck(this, PathWizard);

    this.root = rootPath;
    this.ignored = ignored;
    this.cache = !!cache;
    this.nodes = this.cache ? traverse(this.root, this.ignored) : null;
  }

  /**
   * Search Method - Finds absolute path to the file matching the search expression argument
   * @param  {String, Array[String]} filePath [shortest unique path (search expression)]
   * @returns {String}                         [absolute path to the matching module]
   */


  _createClass(PathWizard, [{
    key: 'abs',
    value: function abs(filePath) {
      checkSearchTerm(filePath, 'rel');

      var _filePath = void 0,
          _filePathWithIndex = void 0,
          matches = void 0;
      if (isRootPath(filePath)) {
        _filePath = ['index.js'];
      } else {
        _filePath = Array.isArray(filePath) ? filePath : filePath.split(path.sep);
        formatPathArray(_filePath);
      }

      if (!this.cache) {
        this.nodes = traverse(this.root, this.ignored);
      }

      var target = _filePath[_filePath.length - 1];
      if (!/\.js$/.test(target)) {
        _filePath.push(_filePath.pop() + '.js');
        _filePathWithIndex = _filePath.slice();
        _filePathWithIndex.push(_filePathWithIndex.pop().replace(/\.\w+/, ''), 'index.js');
      }

      matches = findMatchingDirectories(this.nodes, _filePath);
      if (!matches.length && _filePathWithIndex) matches = findMatchingDirectories(this.nodes, _filePathWithIndex);
      if (matches.length === 1) return path.join.apply(path, [this.root].concat(_toConsumableArray(matches.pop().slice(1))));else err(this.root, filePath, matches);
    }

    /**
     * Search Method - Finds relative path from invoking file to the file matching the 
     * search expression argument
     * @param  {String, Array[String]} filePath [shortest unique path (search expression)]
     * @returns {String}                         [relative path to the matching module]
     */

  }, {
    key: 'rel',
    value: function rel(filePath) {
      var _to = path.normalize(this.abs(filePath));
      var _from = module.parent.filename;
      var rel = path.relative(_from, _to).slice(3);

      return (/\.\./.test(rel) ? rel : './' + rel
      );
    }

    /**
     * Search Method - Finds absolute path to the folder matching the search expression argument
     * @param  {String, Array[String]} filePath [shortest unique path (search expression)]
     * @returns {String}                         [absolute path to the matching folder]
     */

  }, {
    key: 'absDir',
    value: function absDir(filePath) {
      checkSearchTerm(filePath, 'absDir');

      var _filePath = void 0,
          matches = void 0;
      if (isRootPath(filePath)) {
        return path.normalize(this.root);
      } else {
        _filePath = Array.isArray(filePath) ? filePath : filePath.split(path.sep);
        formatPathArray(_filePath);
      }

      if (!this.cache) {
        this.nodes = traverse(this.root, this.ignored);
      }

      matches = findMatchingDirectories(this.nodes, _filePath);
      if (matches.length === 1) return path.join.apply(path, [this.root].concat(_toConsumableArray(matches.pop().slice(1))));else err(this.root, filePath, matches);
    }

    /**
     * Search Method - Finds relative path from invoking file to the folder matching the 
     * search expression argument
     * @param  {String, Array[String]} filePath [shortest unique path (search expression)]
     * @returns {String}                         [relative path to the matching module]
     */

  }, {
    key: 'relDir',
    value: function relDir(filePath) {
      var to = path.normalize(this.absDir(filePath));
      var rel = path.relative(this.root, to);

      return (/\.\./.test(rel) ? rel : './' + rel
      );
    }

    /**
     * Helper Method - Expression(s) passed to `ignore` won't be searched through
     * @param  {String, Array[String]} expressions [directory name(s) to ignore during searching]
     * @returns {Object}                            [proxified PathWizard instance]
     */

  }, {
    key: 'ignore',
    value: function ignore(expressions) {
      ignorePath(expressions, this.ignored);
      this.nodes = traverse(this.root, this.ignored);
      return proxifyPathWizard(this);
    }

    /**
     * Helper Method - Expression(s) passed to `unignore` will be removed from the ignored 
     * directory names
     * @param  {String, Array[String]} expressions [directory name(s) to unignore]
     * @returns {Object}                            [proxified PathWizard instance]
     */

  }, {
    key: 'unignore',
    value: function unignore(expressions) {
      unignorePath(expressions, this.ignored);
      this.nodes = traverse(this.root, this.ignored);
      return proxifyPathWizard(this);
    }
  }]);

  return PathWizard;
}();
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function checkSearchTerm(filePath, method) {
  if (!filePath) throw new Error('A search expression must be provided to the \'' + method + '\' method.');
  if (!filePath.length) throw new Error('The \'' + method + '\' method requires a non-empty string.');
}

function err(rootPath, filePath, matches) {
  if (!matches.length) throw 'No files in ' + rootPath + ' matched ' + filePath + '\n';else throw 'The path did not uniquely resolve! ' + '\n\n' + matches.map(function (match) {
    var _path2;

    return (_path2 = path).join.apply(_path2, _toConsumableArray(match));
  }).join('\n') + '\n';
}

/**
 * Searches through a list of directories and finds matches with the search expression
 * @param  {Array[Array[String]]} nodeArray [List of all project directories, broken into arrays segments]
 * @param  {Array[String]}        _filePath [Search Expression - Array of path segments]
 * @returns {Array[Array[String]]}           [Array of all matching directory paths]
 */
function findMatchingDirectories(nodeArray, _filePath) {
  var matches = [];
  nodeArray.forEach(function (node) {
    var _path = _filePath.slice();
    var _node = node.slice();
    while (_path.length) {
      if (_path.pop() !== _node.pop()) return;
    }
    matches.push(node);
  });
  return matches;
}

function formatPathArray(pathArray) {
  pathArray.forEach(function (element, index) {
    if (element.indexOf('/') >= 0) pathArray[index] = pathArray[index].replace('/', '');
  });
  formatTrailingDirectory(pathArray);
  if (isRootSegment(pathArray[0])) pathArray[0] = '~';
}

function formatTrailingDirectory(pathArray) {
  var lastElement = pathArray[pathArray.length - 1];
  if (lastElement === '' || lastElement === '/') pathArray.pop();
}

/**
 * Takes a path segment (directory name) and adds it to a blacklist of directories
 * @param  {String, Array[String]} pathSegment [Directory Name(s) (to ignore)]
 * @param  {Array[String]}         ignored     [List of directory names to ignore when searching]
 * @returns {undefined}                         [Side-effects only (mutates `ignored` argument)]
 */
function ignorePath(pathSegment, ignored) {
  if (Array.isArray(pathSegment)) {
    pathSegment.forEach(function (expression) {
      if (typeof expression !== 'string') throw 'Ignored files and directories must be strings.' + '\n';
      if (!isPathIgnored(expression, ignored) && expression.length) ignored.push(expression);
    });
  } else if (typeof pathSegment === 'string') {
    if (!isPathIgnored(pathSegment, ignored) && pathSegment.length) ignored.push(pathSegment);
  } else throw 'Invalid argument type provided to \'ignore\' method. Ignore expressions must be a string or an array of strings!';
}

function isPathIgnored(pathSegment, ignored) {
  if (pathSegment[0] === '.') return true; //The traverse method won't look at hidden directories.
  return ignored.some(function (element) {
    return element === pathSegment;
  });
}

function isRootPath(filePath) {
  if (Array.isArray(filePath) && filePath.length === 1) {
    return isRootSegment(filePath[0]);
  } else if (typeof filePath === 'string') {
    return isRootSegment(filePath);
  }
  return false;
}

/**
 * Determines if a pathSegment is a reference to the root directory
 * @param  {String}  pathSegment [A directory name (path segment)]
 * @returns {Boolean}             [Determines if the pathSegment string is a reference to the root]
 */
function isRootSegment(pathSegment) {
  switch (pathSegment) {
    case '':
      return true;
    case '.':
      return true;
    case '/':
      return true;
    case './':
      return true;
    default:
      return false;
  };
}

/**
 * Prepends the root directory symbol to all directories in the project
 * @param  {Array[String]} node [A relative filepath split on the system-separator]
 * @returns {Array[String]}      [A project-root-relative path split on the system-separator]
 */
function prependRoot(node) {
  if (node[0] !== '~') node.unshift('~');
  return node;
}

/**
 * Returns a proxy of the parent module's `module.require` function
 * @param  {PathWizard (Object)} wizard [PathWizard instance for proxy-ing]
 * @returns {Proxy (Object)}             [A proxy of the invoking module's `module.require`]
 */
function proxifyPathWizard(wizard) {
  return new Proxy(module.parent.require, {
    apply: function apply(target, thisArg, argumentList) {
      return requireModule.apply(undefined, [wizard.abs.bind(wizard)].concat(_toConsumableArray(argumentList)));
    },
    get: function get(target, property) {
      switch (property) {
        case 'abs':
          return wizard.abs.bind(wizard);
        case 'absDir':
          return wizard.absDir.bind(wizard);
        case 'rel':
          return wizard.rel.bind(wizard);
        case 'relDir':
          return wizard.relDir.bind(wizard);
        case 'ignore':
          return wizard.ignore.bind(wizard);
        case 'unignore':
          return wizard.unignore.bind(wizard);
        case 'root':
          return wizard.root;
        case 'nodes':
          return wizard.nodes;
        case 'cache':
          return wizard.cache;
        case 'ignored':
          return wizard.ignored;
        default:
          return target[property];
      }
    }
  });
}

/**
 * Used to traverse the file system and gather a list of directories
 * @param  {String}               rootPath     [Absolute path to the project's root directory]
 * @param  {Array[Array[String]]} ignoredArray [Directory names to ignore]
 * @param  {String}               directory    [Current directory name to process]
 * @param  {Array[Array[String]]} nodesArray   [Accumulator of directories found during traversal]
 * @returns {Array[Array[String]]}              [Array of directories in the PathWizard's root directory]
 */
function traverse() {
  var rootPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.cwd();
  var ignoredArray = arguments[1];
  var directory = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var nodesArray = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  var nodes = fs.readdirSync(path.join(rootPath, directory)).filter(function (n) {
    var name = n.split(path.sep).pop();
    return !isPathIgnored(name, ignoredArray);
  });

  nodes.forEach(function (node) {
    if (fs.statSync(path.join(rootPath, directory, node)).isDirectory()) {
      traverse(rootPath, ignoredArray, path.join(directory, node), nodesArray);
    }
    nodesArray.push(path.join(directory, node).split(path.sep));
  });
  return nodesArray.map(prependRoot);
}

/**
 * Imports a specified module, first trying an installed module and then project file modules
 *
 * Note: Given the following code:
 * `const pw = require('pathwizard')()`
 * `const chai = pw('chai');`
 * `const db = pw('server/db');`
 * 
 * This is the function called when `pw` is invoked with a `filePath` search expression
 * 
 * @param  {Function}              findingFunction [PathWizard Instance `abs` method]
 * @param  {String, Array[String]} filePath        [Shortest unique path search expression]
 * @returns {Variable (Module)}                     [Module.exports of matched module]
 */
function requireModule(findingFunction, filePath) {
  checkSearchTerm(filePath, 'requireModule');

  var mod = void 0;
  try {
    mod = module.parent.require(filePath);
  } catch (e) {
    mod = module.parent.require(findingFunction(filePath));
  }
  return mod;
};

/**
 * Takes a path segment (directory name) and removes it from the blacklist of directories
 * @param  {String, Array[String]} pathSegment [Directory Name(s) (to ignore)]
 * @param  {Array[String]}         ignored     [List of directory names to ignore when searching]
 * @returns {undefined}                         [Side-effects only (mutates `ignored` argument)]
 */
function unignorePath(pathSegment, ignored) {
  if (Array.isArray(pathSegment)) {
    pathSegment.forEach(function (expression) {
      if (typeof expression !== 'string') throw 'Ignored files and directories must be strings.' + '\n';
      var pathIndex = ignored.indexOf(expression);
      if (pathIndex >= 0 && pathSegment.length > 0) ignored.splice(pathIndex, 1);
    });
  } else if (typeof pathSegment === 'string') {
    var pathIndex = ignored.indexOf(pathSegment);
    if (pathIndex >= 0 && pathSegment.length > 0) ignored.splice(pathIndex, 1);
  } else throw 'Invalid argument type provided to \'ignore\' method. Ignore expressions must be a string or an array of strings!';
}
