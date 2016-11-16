'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var fs = require('fs');
var path = require('path');

function PathWizard() {
  var rootPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.cwd();

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$cache = _ref.cache,
      cache = _ref$cache === undefined ? true : _ref$cache,
      _ref$ignored = _ref.ignored,
      ignored = _ref$ignored === undefined ? ['node_modules', 'bower_components'] : _ref$ignored;

  this.root = rootPath;
  this.ignored = ignored;
  this.nodes = [];
  this.cache = !!cache;
}

PathWizard.prototype.abs = function (filePath) {
  if (!filePath) throw new Error('A search expression must be provided to the \'abs\' method.');
  if (!filePath.length) throw new Error('The \'abs\' method requires a non-empty string.');

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

  if (this.cache && !this.nodes.length) {
    this.traverse();
    prependRoot.bind(this)();
  } else if (!this.cache) {
    this.nodes = [];
    this.traverse();
    prependRoot.bind(this)();
  }

  var target = _filePath[_filePath.length - 1];
  if (target.indexOf('.') < 0) {
    _filePath.push(_filePath.pop() + '.js');
    _filePathWithIndex = _filePath.slice();
    _filePathWithIndex.push(_filePathWithIndex.pop().replace(/\.\w+/, ''), 'index.js');
  }

  matches = findMatchingDirectories.bind(this)(_filePath);
  if (!matches.length && _filePathWithIndex) matches = findMatchingDirectories.bind(this)(_filePathWithIndex);
  if (matches.length === 1) return path.join.apply(path, [this.root].concat(_toConsumableArray(matches.pop().slice(1))));else err.bind(this)(filePath, matches);
};

PathWizard.prototype.rel = function (filePath) {
  if (!filePath) throw new Error('A search expression must be provided to the \'abs\' method.');
  if (!filePath.length) throw new Error('The \'abs\' method requires a non-empty string.');

  var _to = path.normalize(this.abs(filePath));
  var _from = module.parent.filename;
  var rel = path.relative(_from, _to).slice(3);

  return (/\.\./.test(rel) ? rel : './' + rel
  );
};

PathWizard.prototype.req = function (filePath) {
  if (!filePath) throw new Error('A search expression must be provided to the \'req\' method.');
  if (!filePath.length) throw new Error('The \'req\' method requires a non-empty string or array search expression.');

  var mod = void 0;
  try {
    mod = require(filePath);
  } catch (e) {
    mod = require(this.abs(filePath));
  } finally {
    return mod;
  }
};

PathWizard.prototype.ignore = function (expressions) {
  ignorePath.bind(this)(expressions);
  return this;
};

PathWizard.prototype.absDir = function (filePath) {
  if (!filePath) throw new Error('A search expression must be provided to the \'abs\' method.');
  if (!filePath.length) throw new Error('The \'abs\' method requires a non-empty string.');

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
    this.traverse();
    prependRoot.bind(this)();
  } else if (!this.cache) {
    this.nodes = [];
    this.traverse();
    prependRoot.bind(this)();
  }

  matches = findMatchingDirectories.bind(this)(_filePath);
  if (matches.length === 1) return path.join.apply(path, [this.root].concat(_toConsumableArray(matches.pop().slice(1))));else err.bind(this)(filePath, matches);
};

PathWizard.prototype.relDir = function (filePath) {
  if (!filePath) throw new Error('A search expression must be provided to the \'abs\' method.');
  if (!filePath.length) throw new Error('The \'abs\' method requires a non-empty string.');

  var to = path.normalize(this.absDir(filePath));
  var rel = path.relative('', to);

  return (/\.\./.test(rel) ? rel : './' + rel
  );
};

PathWizard.prototype.flush = function () {
  this.nodes = [];
  return this;
};

PathWizard.prototype.traverse = function () {
  var _this = this;

  var directory = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var nodes = fs.readdirSync(path.join(this.root, directory)).filter(function (n) {
    var name = n.split(path.sep).pop();
    return !isPathIgnored.bind(_this)(name);
  });

  nodes.forEach(function (node) {
    if (fs.statSync(path.join(_this.root, directory, node)).isDirectory()) {
      _this.traverse.bind(_this)(path.join(directory, node));
    }
    _this.nodes.push(path.join(directory, node).split(path.sep));
  });
  return this.nodes;
};

function findMatchingDirectories(_filePath) {
  var matches = [];
  this.nodes.forEach(function (node) {
    var _path = _filePath.slice();
    var _node = node.slice();
    while (_path.length) {
      if (_path.pop() !== _node.pop()) return;
    }
    matches.push(node);
  });
  return matches;
}

function isPathIgnored(pathSegment) {
  if (pathSegment[0] === '.') return true;
  return this.ignored.some(function (element) {
    return element === pathSegment;
  });
}

function ignorePath(pathSegment) {
  if (Array.isArray(pathSegment)) {
    var _ignored;

    pathSegment.forEach(function (exp) {
      if (typeof exp !== 'string') 'Ignored files and directories must be strings.' + '\n';
    });
    (_ignored = this.ignored).push.apply(_ignored, _toConsumableArray(pathSegment));
  }
  this.ignored.push(pathSegment);
}

function prependRoot() {
  this.nodes = this.nodes.map(function (node) {
    node.unshift('~');
    return node;
  });
}

function err(filePath, matches) {
  if (!matches.length) throw 'No files in ' + this.root + ' matched ' + filePath + '\n';else throw 'The path did not uniquely resolve! ' + '\n\n' + matches.map(function (match) {
    return path.join.apply(path, _toConsumableArray(match));
  }).join('\n') + '\n';
}

function PathWizardModule(rootPath, options) {
  if (rootPath && typeof rootPath !== 'string') throw new Error('PathWizard constructor only accepts undefined or a string-typed project directory.');
  return new PathWizard(rootPath, options);
}

module.exports = PathWizardModule;

delete require.cache[__filename];
