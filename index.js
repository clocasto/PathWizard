const fs = require('fs');
const path = require('path');

function PathWizard(rootPath = process.cwd(), { cache = true, ignored = ['node_modules', 'bower_components'] } = {}) {
  this.root = rootPath;
  this.ignored = ignored;
  this.nodes = [];
  this.cache = !!cache;
}

PathWizard.prototype.abs = function (filePath) {
  if (!filePath) throw new Error(`A search expression must be provided to the 'abs' method.`);
  if (!filePath.length) throw new Error(`The 'abs' method requires a non-empty string.`);

  let _filePath, _filePathWithIndex, matches;
  if (filePath === '/') {
    _filePath = ['index.js'];
  } else {
    _filePath = Array.isArray(filePath) ? filePath : filePath.split(path.sep);
    if (_filePath[_filePath.length - 1] === '') _filePath.pop();
    if (_filePath[0] === '.' || _filePath[0] === '') _filePath[0] = '~';
  }

  if (!this.cache) {
    this.nodes = [];
    this.traverse();
    prependRoot.bind(this)();
  }

  let target = _filePath[_filePath.length - 1];
  if (target.indexOf('.') < 0) {
    _filePath.push(`${_filePath.pop()}.js`);
    _filePathWithIndex = _filePath.slice();
    _filePathWithIndex.push(_filePathWithIndex.pop()
      .replace(/\.\w+/, ''), 'index.js');
  }

  matches = findMatchingDirectories.bind(this)(_filePath);
  if (!matches.length && _filePathWithIndex)
    matches = findMatchingDirectories.bind(this)(_filePathWithIndex);
  if (matches.length === 1) return path.join(this.root, ...matches.pop().slice(1));
  else err.bind(this)(filePath, matches);
}

PathWizard.prototype.rel = function (filePath) {
  if (!filePath) throw new Error(`A search expression must be provided to the 'abs' method.`);
  if (!filePath.length) throw new Error(`The 'abs' method requires a non-empty string.`);

  const _to = path.normalize(this.abs(filePath));
  const _from = module.parent.filename;
  const rel = path.relative(_from, _to).slice(3);

  return /\.\./.test(rel) ? rel : `./${rel}`;
}

PathWizard.prototype.req = function (filePath) {
  if (!filePath) throw new Error(`A search expression must be provided to the 'req' method.`);
  if (!filePath.length) throw new Error(`The 'req' method requires a non-empty string or array search expression.`);

  let mod;
  try {
    mod = require(filePath);
  } catch (e) {
    mod = require(this.abs(filePath));
  }
  return mod;
};

PathWizard.prototype.ignore = function (expressions) {
  ignorePath.bind(this)(expressions);
  return this;
};

PathWizard.prototype.absDir = function (filePath) {
  if (!filePath) throw new Error(`A search expression must be provided to the 'abs' method.`);
  if (!filePath.length) throw new Error(`The 'abs' method requires a non-empty string.`);

  let _filePath, matches;
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
  if (matches.length === 1) return path.join(this.root, ...matches.pop().slice(1));
  else err.bind(this)(filePath, matches);
};

PathWizard.prototype.relDir = function (filePath) {
  if (!filePath) throw new Error(`A search expression must be provided to the 'abs' method.`);
  if (!filePath.length) throw new Error(`The 'abs' method requires a non-empty string.`);

  const to = path.normalize(this.absDir(filePath));
  const rel = path.relative('', to);

  return /\.\./.test(rel) ? rel : `./${rel}`;
};

PathWizard.prototype.flush = function () {
  this.nodes = [];
  return this;
}

PathWizard.prototype.traverse = function (directory = '') {
  const nodes = fs.readdirSync(path.join(this.root, directory))
    .filter(n => {
      const name = n.split(path.sep)
        .pop();
      return !isPathIgnored.bind(this)(name);
    });

  nodes.forEach(node => {
    if (fs.statSync(path.join(this.root, directory, node))
      .isDirectory()) {
      this.traverse.bind(this)(path.join(directory, node));
    }
    this.nodes.push(path.join(directory, node)
      .split(path.sep));
  });
  return this.nodes;
}

function findMatchingDirectories(_filePath) {
  const matches = [];
  this.nodes.forEach(node => {
    const _path = _filePath.slice();
    const _node = node.slice();
    while (_path.length) {
      if (_path.pop() !== _node.pop()) return;
    }
    matches.push(node);
  })
  return matches;
}

function isPathIgnored(pathSegment) {
  if (pathSegment[0] === '.') return true;
  return this.ignored.some(element => element === pathSegment);
}

function ignorePath(pathSegment) {
  if (Array.isArray(pathSegment)) {
    pathSegment.forEach(exp => {
      if (typeof exp !== 'string') `Ignored files and directories must be strings.${'\n'}`;
    })
    this.ignored.push(...pathSegment);
  }
  this.ignored.push(pathSegment);
}

function prependRoot() {
  this.nodes = this.nodes.map((node) => {
    node.unshift('~')
    return node;
  });
}

function err(filePath, matches) {
  if (!matches.length)
    throw `No files in ${this.root} matched ${filePath}${'\n'}`;
  else
    throw `The path did not uniquely resolve! ${'\n\n'}${matches.map (match => path.join(...match)).join('\n')}${'\n'}`;
}

function PathWizardModule(rootPath, { cache = true, ignored = ['node_modules', 'bower_components'] } = {}) {
  if (rootPath && typeof rootPath !== 'string') throw new Error('PathWizard constructor only accepts undefined or a string-typed project directory.');
  const _PathWizard = new PathWizard(rootPath, { cache, ignored });
  if (!!cache) {
    _PathWizard.traverse();
    prependRoot.call(_PathWizard);
  }
  return _PathWizard;
}

module.exports = PathWizardModule;

if (require.cache && __filename) delete require.cache[__filename];
