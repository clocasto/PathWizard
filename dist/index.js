'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var fs = require('fs');
var path = require('path');

module.exports = PathWizardModule;

if (require.cache && __filename) delete require.cache[__filename];

function PathWizardModule() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var func = arguments[1];

  if (options.root && typeof options.root !== 'string') throw new Error('PathWizard constructor only accepts undefined or a string-typed project directory.');
  var _PathWizard = new PathWizard(options);
  return _PathWizard.proxy(module.parent.require);
}

function PathWizard() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$cache = _ref.cache,
      cache = _ref$cache === undefined ? true : _ref$cache,
      _ref$ignored = _ref.ignored,
      ignored = _ref$ignored === undefined ? ['node_modules', 'bower_components'] : _ref$ignored,
      _ref$root = _ref.root,
      rootPath = _ref$root === undefined ? process.cwd() : _ref$root;

  this.root = rootPath;
  this.ignored = ignored;
  this.cache = !!cache;
  this.nodes = this.cache ? traverse(this.root, this.ignored) : null;
}

PathWizard.prototype.abs = function (filePath) {
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
  if (target.indexOf('.') < 0) {
    _filePath.push(_filePath.pop() + '.js');
    _filePathWithIndex = _filePath.slice();
    _filePathWithIndex.push(_filePathWithIndex.pop().replace(/\.\w+/, ''), 'index.js');
  }

  matches = findMatchingDirectories(this.nodes, _filePath);
  if (!matches.length && _filePathWithIndex) matches = findMatchingDirectories(this.nodes, _filePathWithIndex);
  if (matches.length === 1) return path.join.apply(path, [this.root].concat(_toConsumableArray(matches.pop().slice(1))));else err(this.root, filePath, matches);
};

PathWizard.prototype.rel = function (filePath) {
  checkSearchTerm(filePath, 'rel');

  var _to = path.normalize(this.abs(filePath));
  var _from = module.parent.filename;
  var rel = path.relative(_from, _to).slice(3);

  return (/\.\./.test(rel) ? rel : './' + rel
  );
};

PathWizard.prototype.absDir = function (filePath) {
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
};

PathWizard.prototype.relDir = function (filePath) {

  var to = path.normalize(this.absDir(filePath));
  var rel = path.relative(this.root, to);

  return (/\.\./.test(rel) ? rel : './' + rel
  );
};

PathWizard.prototype.ignore = function (expressions) {
  ignorePath(expressions, this.ignored);
  return this;
};

PathWizard.prototype.unignore = function (expressions) {
  unignorePath(expressions, this.ignored);
  return this;
};

PathWizard.prototype.proxy = function (providedTarget) {
  var _this = this;

  return new Proxy(providedTarget, {
    apply: function apply(target, thisArg, argumentList) {
      return requireModule.apply(undefined, [_this.abs.bind(_this)].concat(_toConsumableArray(argumentList)));
    },
    get: function get(target, property) {
      switch (property) {
        case 'abs':
          return _this.abs.bind(_this);
        case 'absDir':
          return _this.absDir.bind(_this);
        case 'rel':
          return _this.rel.bind(_this);
        case 'relDir':
          return _this.relDir.bind(_this);
        case 'ignore':
          return _this.ignore.bind(_this);
        case 'unignore':
          return _this.unignore.bind(_this);
        case 'root':
          return _this.root;
        case 'nodes':
          return _this.nodes;
        case 'cache':
          return _this.cache;
        case 'ignored':
          return _this.ignored;
        default:
          return target[property];
      }
    }
  });
};
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

function prependRoot(node) {
  if (node[0] !== '~') node.unshift('~');
  return node;
}

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
