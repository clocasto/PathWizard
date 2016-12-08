function checkSearchTerm(filePath, method) {
  if (!filePath) throw new Error(`A search expression must be provided to the '${method}' method.`);
  if (!filePath.length) throw new Error(`The '${method}' method requires a non-empty string.`);
}

function err(rootPath, filePath, matches) {
  if (!matches.length)
    throw `No files in ${rootPath} matched ${filePath}${'\n'}`;
  else
    throw `The path did not uniquely resolve! ${'\n\n'}${matches.map (match => path.join(...match)).join('\n')}${'\n'}`;
}

/**
 * Searches through a list of directories and finds matches with the search expression
 * @param  {Array[Array[String]]} nodeArray [List of all project directories, broken into arrays segments]
 * @param  {Array[String]}        _filePath [Search Expression - Array of path segments]
 * @return {Array[Array[String]]}           [Array of all matching directory paths]
 */
function findMatchingDirectories(nodeArray, _filePath) {
  const matches = [];
  nodeArray.forEach(node => {
    const _path = _filePath.slice();
    const _node = node.slice();
    while (_path.length) {
      if (_path.pop() !== _node.pop()) return;
    }
    matches.push(node);
  })
  return matches;
}

function formatPathArray(pathArray) {
  pathArray.forEach((element, index) => {
    if (element.indexOf('/') >= 0) pathArray[index] = pathArray[index].replace('/', '');
  })
  formatTrailingDirectory(pathArray);
  if (isRootSegment(pathArray[0])) pathArray[0] = '~';
}


function formatTrailingDirectory(pathArray) {
  const lastElement = pathArray[pathArray.length - 1];
  if (lastElement === '' || lastElement === '/') pathArray.pop();
}

/**
 * Takes a path segment (directory name) and adds it to a blacklist of directories
 * @param  {String, Array[String]} pathSegment [Directory Name(s) (to ignore)]
 * @param  {Array[String]}         ignored     [List of directory names to ignore when searching]
 * @return {undefined}                         [Side-effects only (mutates `ignored` argument)]
 */
function ignorePath(pathSegment, ignored) {
  if (Array.isArray(pathSegment)) {
    pathSegment.forEach(expression => {
      if (typeof expression !== 'string') throw `Ignored files and directories must be strings.${'\n'}`;
      if (!isPathIgnored(expression, ignored) && expression.length) ignored.push(expression);
    })
  } else if (typeof pathSegment === 'string') {
    if (!isPathIgnored(pathSegment, ignored) && pathSegment.length) ignored.push(pathSegment);
  } else throw `Invalid argument type provided to 'ignore' method. Ignore expressions must be a string or an array of strings!`;
}

function isPathIgnored(pathSegment, ignored) {
  if (pathSegment[0] === '.') return true; //The traverse method won't look at hidden directories.
  return ignored.some(element => element === pathSegment);
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
 * @return {Boolean}             [Determines if the pathSegment string is a reference to the root]
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
 * @return {Array[String]}      [A project-root-relative path split on the system-separator]
 */
function prependRoot(node) {
  if (node[0] !== '~') node.unshift('~');
  return node;
}

/**
 * Returns a proxy of the parent module's `module.require` function
 * @param  {PathWizard (Object)} wizard [PathWizard instance for proxy-ing]
 * @return {Proxy (Object)}             [A proxy of the invoking module's `module.require`]
 */
function proxifyPathWizard(wizard) {
  return new Proxy(module.parent.require, {
    apply: (target, thisArg, argumentList) => requireModule(wizard.abs.bind(wizard), ...argumentList),
    get: (target, property, receiver) => {
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
  })
}

/**
 * Used to traverse the file system and gather a list of directories
 * @param  {String}               rootPath     [Absolute path to the project's root directory]
 * @param  {Array[Array[String]]} ignoredArray [Directory names to ignore]
 * @param  {String}               directory    [Current directory name to process]
 * @param  {Array[Array[String]]} nodesArray   [Accumulator of directories found during traversal]
 * @return {Array[Array[String]]}              [Array of directories in the PathWizard's root directory]
 */
function traverse(rootPath = process.cwd(), ignoredArray, directory = '', nodesArray = []) {
  const nodes = fs.readdirSync(path.join(rootPath, directory))
    .filter(n => {
      const name = n.split(path.sep)
        .pop();
      return !isPathIgnored(name, ignoredArray);
    });

  nodes.forEach(node => {
    if (fs.statSync(path.join(rootPath, directory, node)).isDirectory()) {
      traverse(rootPath, ignoredArray, path.join(directory, node), nodesArray);
    }
    nodesArray.push(path.join(directory, node)
      .split(path.sep));
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
 * @return {Variable (Module)}                     [Module.exports of matched module]
 */
function requireModule(findingFunction, filePath) {
  checkSearchTerm(filePath, 'requireModule');

  let mod;
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
 * @return {undefined}                         [Side-effects only (mutates `ignored` argument)]
 */
function unignorePath(pathSegment, ignored) {
  if (Array.isArray(pathSegment)) {
    pathSegment.forEach(expression => {
      if (typeof expression !== 'string') throw `Ignored files and directories must be strings.${'\n'}`;
      const pathIndex = ignored.indexOf(expression);
      if (pathIndex >= 0 && pathSegment.length > 0) ignored.splice(pathIndex, 1);
    })
  } else if (typeof pathSegment === 'string') {
    const pathIndex = ignored.indexOf(pathSegment);
    if (pathIndex >= 0 && pathSegment.length > 0) ignored.splice(pathIndex, 1);
  } else throw `Invalid argument type provided to 'ignore' method. Ignore expressions must be a string or an array of strings!`;
}

