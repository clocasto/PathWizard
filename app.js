const fs = require('fs');
const path = require('path');

function PathWizard(rootPath) {
  this.root = rootPath || process.cwd();
  this.nodes = [];
  this.ignored = ['node_modules', 'bower_components'];
}

PathWizard.prototype.abs = function(filePath) {
  const _filePath = filePath.split(path.sep);
  if (_filePath[_filePath.length - 1] === '') _filePath.pop();
  const matches = [];

  if (!this.nodes.length) this.traverse();

  this.nodes.forEach(node => {
    const _path = _filePath.slice();
    const _node = node.slice();
    while (_path.length) {
      if (_path.pop() !== _node.pop()) return;
    }
    matches.push(node);
  })


  if (matches.length === 1) return path.join(this.root, ...matches.pop());
  else this.err(filePath, matches);
}

PathWizard.prototype.rel = function(filePath) {
  const fileName = filePath.slice().split(path.sep).pop();
  const to = path.normalize(this.abs(filePath));
  const rel = path.relative('', to);
  if (rel === fileName) return '';
  return /\.\./.test(rel) ? rel : `./${rel}`;
}

PathWizard.prototype.traverse = function(directory = '') {
  const nodes = fs.readdirSync(path.join(this.root, directory))
    .filter(n => {
      const name = n.split(path.sep)
        .pop();
      return !this.isPathIgnored(name);
    });

  nodes.forEach(node => {
    if (fs.statSync(path.join(this.root, directory, node))
      .isDirectory()) {
      this.traverse(path.join(directory, node));
    }
    this.nodes.push(path.join(directory, node)
      .split(path.sep));
  });
  return this.nodes;
}

PathWizard.prototype.isPathIgnored = function(pathSegment) {
  if (pathSegment[0] === '.') return true;
  return this.ignored.some(element => element === pathSegment);
}

PathWizard.prototype.ignorePath = function(pathSegment) {
  if (Array.isArray(pathSegment)) this.ignored = this.ignored.concat(pathSegment);
  this.ignored.push(pathSegment);
}

PathWizard.prototype.err = function(filePath, matches) {
  if (!matches.length)
    throw `No files in ${this.root} matched ${filePath}${'\n'}`;
  else
    throw `The path did not uniquely resolve! ${'\n\n'}${matches.map (match => path.join(...match)).join('\n')}${'\n'}`;
}

function PathWizardModule(rootPath) {
  return new PathWizard(rootPath);
}

module.exports = PathWizardModule;
