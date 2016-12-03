const fs = require('fs');
const path = require('path');

module.exports = PathWizardModule;

if (require.cache && __filename) delete require.cache[__filename];

function PathWizardModule(target = module.parent.require, rootPath, options) {
  if (rootPath && typeof rootPath !== 'string') throw new Error('PathWizard constructor only accepts undefined or a string-typed project directory.');
  const _PathWizard = new PathWizard(rootPath, options);
  return _PathWizard.proxy(target);
}

function PathWizard(rootPath = process.cwd(), { cache = true, ignored = ['node_modules', 'bower_components'] } = {}) {
  this.root = rootPath;
  this.ignored = ignored;
  this.cache = !!cache;
  this.nodes = this.cache ? traverse(this.root, this.ignored) : [];
}

PathWizard.prototype.abs = function(filePath) {
  let _filePath, _filePathWithIndex, matches;
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

  let target = _filePath[_filePath.length - 1];
  if (target.indexOf('.') < 0) {
    _filePath.push(`${_filePath.pop()}.js`);
    _filePathWithIndex = _filePath.slice();
    _filePathWithIndex.push(_filePathWithIndex.pop()
      .replace(/\.\w+/, ''), 'index.js');
  }

  matches = findMatchingDirectories(this.nodes, _filePath);
  if (!matches.length && _filePathWithIndex)
    matches = findMatchingDirectories(this.nodes, _filePathWithIndex);
  if (matches.length === 1) return path.join(this.root, ...matches.pop().slice(1));
  else err(this.root, filePath, matches);
}

PathWizard.prototype.rel = function(filePath) {
  checkSearchTerm(filePath, 'rel');

  const _to = path.normalize(this.abs(filePath));
  const _from = module.parent.filename;
  const rel = path.relative(_from, _to).slice(3);

  return /\.\./.test(rel) ? rel : `./${rel}`;
}

PathWizard.prototype.absDir = function(filePath) {
  checkSearchTerm(filePath, 'absDir');

  let _filePath, matches;
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
  if (matches.length === 1) return path.join(this.root, ...matches.pop().slice(1));
  else err(this.root, filePath, matches);
};

PathWizard.prototype.relDir = function(filePath) {
  checkSearchTerm(filePath, 'relDir');

  const to = path.normalize(this.absDir(filePath));
  const rel = path.relative(this.root, to);

  return /\.\./.test(rel) ? rel : `./${rel}`;
};

PathWizard.prototype.ignore = function(expressions) {
  ignorePath(expressions, this.ignored);
  return this;
};

PathWizard.prototype.unignore = function(expressions) {
  unignorePath(expressions, this.ignored);
  return this;
};

PathWizard.prototype.proxy = function(target) {
  return new Proxy(target, {
    apply: (target, thisArg, argumentList) => requireModule(target, this.abs.bind(this), ...argumentList),
    get: (target, property) => {
      switch (property) {
        case 'abs':
          return this.abs.bind(this);
        case 'absDir':
          return this.absDir.bind(this);
        case 'rel':
          return this.rel.bind(this);
        case 'relDir':
          return this.relDir.bind(this);
        case 'ignore':
          return this.ignore.bind(this);
        case 'unignore':
          return this.unignore.bind(this);
        case 'root':
          return this.root;
        case 'nodes':
          return this.nodes;
        case 'cache':
          return this.cache;
        case 'ignored':
          return this.ignored;
        default:
          return target[property];
      }
    }
  })
}

