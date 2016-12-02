'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var fs = require('fs');
var path = require('path');

module.exports = PathWizardModule;

if (require.cache && __filename) delete require.cache[__filename];

function PathWizardModule() {
  var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : module.parent.require;
  var rootPath = arguments[1];
  var options = arguments[2];

  if (rootPath && typeof rootPath !== 'string') throw new Error('PathWizard constructor only accepts undefined or a string-typed project directory.');
  var _PathWizard = new PathWizard(rootPath, options);
  return _PathWizard.proxy(target);
}

function PathWizard() {
  var rootPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.cwd();

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$cache = _ref.cache,
      cache = _ref$cache === undefined ? true : _ref$cache,
      _ref$ignored = _ref.ignored,
      ignored = _ref$ignored === undefined ? ['node_modules', 'bower_components'] : _ref$ignored;

  this.root = rootPath;
  this.ignored = ignored;
  this.cache = !!cache;
  this.nodes = this.cache ? traverse(this.root, this.ignored) : [];
}

PathWizard.prototype.abs = function (filePath) {
  var _filePath = void 0,
      _filePathWithIndex = void 0,
      matches = void 0;
  if (filePath === '/') {
    _filePath = ['index.js'];
  } else {
    _filePath = Array.isArray(filePath) ? filePath : filePath.split(path.sep);
    if (_filePath[_filePath.length - 1] === '') _filePath.pop();
    if (_filePath[0] === '.' || _filePath[0] === '') _filePath[0] = '~';
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

PathWizard.prototype.ignore = function (expressions) {
  ignorePath(expressions, this.ignored);
  return this;
};

PathWizard.prototype.absDir = function (filePath) {
  checkSearchTerm(filePath, 'absDir');

  var _filePath = void 0,
      matches = void 0;
  if (filePath === '/') {
    return path.normalize(this.root);
  } else {
    _filePath = Array.isArray(filePath) ? filePath : filePath.split(path.sep);
    if (_filePath[_filePath.length - 1] === '') _filePath.pop();
    if (_filePath[0] === '.' || _filePath[0] === '') _filePath[0] = '~';
  }
  if (this.cache && !this.nodes.length) {
    this.nodes = traverse(this.root, this.ignored);
  } else if (!this.cache) {
    this.nodes = traverse(this.root, this.ignored);
  }

  matches = findMatchingDirectories(this.nodes, _filePath);
  if (matches.length === 1) return path.join.apply(path, [this.root].concat(_toConsumableArray(matches.pop().slice(1))));else err(this.root, filePath, matches);
};

PathWizard.prototype.relDir = function (filePath) {
  checkSearchTerm(filePath, 'relDir');

  var to = path.normalize(this.absDir(filePath));
  var rel = path.relative('', to);

  return (/\.\./.test(rel) ? rel : './' + rel
  );
};

PathWizard.prototype.proxy = function (target) {
  var _this = this;

  return new Proxy(target, {
    apply: function apply(target, thisArg, argumentList) {
      return requireModule.apply(undefined, [target, _this.abs.bind(_this)].concat(_toConsumableArray(argumentList)));
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
        case 'root':
          return _this.root;
        case 'nodes':
          return _this.nodes;
        case 'cache':
          return _this.cache;
        case 'ignored':
          return _this.ignored;
        case 'target':
          return _this;
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

function ignorePath(pathSegment, ignored) {
  if (Array.isArray(pathSegment)) {
    pathSegment.forEach(function (exp) {
      if (typeof exp !== 'string') 'Ignored files and directories must be strings.' + '\n';
    });
    ignored.push.apply(ignored, _toConsumableArray(pathSegment));
  }
  ignored.push(pathSegment);
}

function isPathIgnored(pathSegment, ignoredArray) {
  if (pathSegment[0] === '.') return true;
  return ignoredArray.some(function (element) {
    return element === pathSegment;
  });
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

function requireModule(target, findingFunction, filePath) {
  checkSearchTerm(filePath, 'requireModule');

  var mod = void 0;
  try {
    mod = target(filePath);
  } catch (e) {
    mod = target(findingFunction(filePath));
  }
  return mod;
};
