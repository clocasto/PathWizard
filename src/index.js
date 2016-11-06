'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var fs = require('fs');
var path = require('path');

function PathWizard() {
  var rootPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.cwd();

  this.root = rootPath;
  this.ignored = ['node_modules', 'bower_components'];
  this.nodes = [];
}

PathWizard.prototype.abs = function (filePath) {
  if (!filePath) throw new Error('A search expression must be provided to the \'abs\' method.');
  if (!filePath.length) throw new Error('The \'abs\' method requires a non-empty string.');

  var _filePath = void 0,
      _filePathWithIndex = void 0,
      matches = [];
  if (filePath === '/') {
    _filePath = ['index.js'];
  } else {
    _filePath = Array.isArray(filePath) ? filePath : filePath.split(path.sep);
    if (_filePath[_filePath.length - 1] === '') _filePath.pop();
    if (_filePath[0] === '.' || _filePath[0] === '') _filePath.shift();
  }

  if (!this.nodes.length) traverse.bind(this)();

  var target = _filePath[_filePath.length - 1];
  if (target.indexOf('.') < 0) {
    _filePath.push(_filePath.pop() + '.js');
    _filePathWithIndex = _filePath.slice();
    _filePathWithIndex.push(_filePathWithIndex.pop().replace(/\.\w+/, ''), 'index.js');
  };

  // console.log('\n');
  // console.log('filePath', filePath);
  // console.log('_filePath', _filePath);
  // console.log('_filePathWithIndex', _filePathWithIndex);
  // console.log('\n');

  matches = findMatchingDirectories.bind(this)(_filePath);

  if (!matches.length && _filePathWithIndex) matches = findMatchingDirectories.bind(this)(_filePathWithIndex);
  if (matches.length === 1) return path.join.apply(path, [this.root].concat(_toConsumableArray(matches.pop())));else err.bind(this)(filePath, matches);
};

PathWizard.prototype.rel = function (filePath) {
  if (!filePath) throw new Error('A search expression must be provided to the \'abs\' method.');
  if (!filePath.length) throw new Error('The \'abs\' method requires a non-empty string.');

  var fileName = filePath.slice().split(path.sep).pop();
  var to = path.normalize(this.abs(filePath));
  var rel = path.relative('', to);
  if (rel === fileName) return '';
  return (/\.\./.test(rel) ? rel : './' + rel
  );
};

PathWizard.prototype.req = function (filePath) {
  if (!filePath) throw new Error('A search expression must be provided to the \'req\' method.');
  if (!filePath.length) throw new Error('The \'req\' method requires a non-empty string or array search expression.');

  return require(this.abs(filePath));
};

PathWizard.prototype.ignore = function (expressions) {
  ignorePath.bind(this)(expressions);
  return this;
};

PathWizard.prototype.absDir = function () {};

PathWizard.prototype.relDir = function () {};

function traverse() {
  var _this = this;

  var directory = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var nodes = fs.readdirSync(path.join(this.root, directory)).filter(function (n) {
    var name = n.split(path.sep).pop();
    return !isPathIgnored.bind(_this)(name);
  });

  nodes.forEach(function (node) {
    if (fs.statSync(path.join(_this.root, directory, node)).isDirectory()) {
      traverse.bind(_this)(path.join(directory, node));
    }
    _this.nodes.push(path.join(directory, node).split(path.sep));
  });
  return this.nodes;
}

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

function err(filePath, matches) {
  if (!matches.length) throw 'No files in ' + this.root + ' matched ' + filePath + '\n';else throw 'The path did not uniquely resolve! ' + '\n\n' + matches.map(function (match) {
    return path.join.apply(path, _toConsumableArray(match));
  }).join('\n') + '\n';
}

function PathWizardModule(rootPath) {
  if (rootPath && typeof rootPath !== 'string') throw new Error('PathWizard constructor only accepts undefined or a string-typed project directory.');
  return new PathWizard(rootPath);
}

module.exports = PathWizardModule;
