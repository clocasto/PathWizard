const fs = require('fs');
const path = require('path');

module.exports = PathWizardModule;

//Prevents PathWizard from being cached in require.cache - enables `rel` method functionality
if (require.cache && __filename) delete require.cache[__filename];

function PathWizardModule(options = {}, func) {
  if (options.root && typeof options.root !== 'string') throw new Error('PathWizard constructor only accepts undefined or a string-typed project directory.');
  const _PathWizard = new PathWizard(options);
  return proxifyPathWizard(_PathWizard);
}

class PathWizard {
  constructor({ cache = true, ignored = ['node_modules', 'bower_components'], root: rootPath = process.cwd() } = {}) {
    this.root = rootPath;
    this.ignored = ignored;
    this.cache = !!cache;
    this.nodes = this.cache ? traverse(this.root, this.ignored) : null;
  }

  /**
   * Search Method - Finds absolute path to the file matching the search expression argument
   * @param  {String, Array[String]} filePath [shortest unique path (search expression)]
   * @return {String}                         [absolute path to the matching module]
   */
  abs(filePath) {
    checkSearchTerm(filePath, 'rel');

    let _filePath, _filePathWithIndex, matches;
    if (isRootPath(filePath)) {
      _filePath = ['index.js'];
    } else {
      _filePath = Array.isArray(filePath) ? filePath : filePath.split(path.sep);
      formatPathArray(_filePath);
    }

    if (!this.cache) {
      this.nodes = traverse(this.root, this.ignored);
    }

    let target = _filePath[_filePath.length - 1];
    if (target.indexOf('.js') < 0) {
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

  /**
   * Search Method - Finds relative path from invoking file to the file matching the 
   * search expression argument
   * @param  {String, Array[String]} filePath [shortest unique path (search expression)]
   * @return {String}                         [relative path to the matching module]
   */
  rel(filePath) {
    const _to = path.normalize(this.abs(filePath));
    const _from = module.parent.filename;
    const rel = path.relative(_from, _to).slice(3);

    return /\.\./.test(rel) ? rel : `./${rel}`;
  }

  /**
   * Search Method - Finds absolute path to the folder matching the search expression argument
   * @param  {String, Array[String]} filePath [shortest unique path (search expression)]
   * @return {String}                         [absolute path to the matching folder]
   */
  absDir(filePath) {
    checkSearchTerm(filePath, 'absDir');

    let _filePath, matches;
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
    if (matches.length === 1) return path.join(this.root, ...matches.pop().slice(1));
    else err(this.root, filePath, matches);
  }

  /**
   * Search Method - Finds relative path from invoking file to the folder matching the 
   * search expression argument
   * @param  {String, Array[String]} filePath [shortest unique path (search expression)]
   * @return {String}                         [relative path to the matching module]
   */
  relDir(filePath) {
    const to = path.normalize(this.absDir(filePath));
    const rel = path.relative(this.root, to);

    return /\.\./.test(rel) ? rel : `./${rel}`;
  }

  /**
   * Helper Method - Expression(s) passed to `ignore` won't be searched through
   * @param  {String, Array[String]} expressions [directory name(s) to ignore during searching]
   * @return {Object}                            [this (PathWizard instance)]
   */
  ignore(expressions) {
    ignorePath(expressions, this.ignored);
    return this;
  }

  /**
   * Helper Method - Expression(s) passed to `unignore` will be removed from the ignored 
   * directory names
   * @param  {String, Array[String]} expressions [directory name(s) to unignore]
   * @return {Object}                            [this (PathWizard instance)]
   */
  unignore(expressions) {
    unignorePath(expressions, this.ignored);
    return this;
  }
}

