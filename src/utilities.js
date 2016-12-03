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

function formatPathArray(pathArray) {
  if (pathArray[pathArray.length - 1] === '') pathArray.pop();
  if (isRootSegment(pathArray[0])) pathArray[0] = '~';
}

function isRootSegment(pathSegment) {
  if (pathSegment === '') return true;
  if (pathSegment === '.') return true;
  if (pathSegment === '/') return true;
  if (pathSegment === './') return true;
  return false;
}

function isRootPath(filePath) {
  if (Array.isArray(filePath) && filePath.length === 1) {
    return isRootSegment(filePath[0]);
  } else if (typeof filePath === 'string') {
    return isRootSegment(filePath);
  }
  return false;
}

function findMatchingDirectories(nodeArray, _filePath) {
  const matches = [];
  nodeArray.forEach(node => {
    const _path = _filePath.slice();
    const _node = node.slice();
    // console.log('comparing', _path, 'with', _node);
    while (_path.length) {
      if (_path.pop() !== _node.pop()) return;
    }
    matches.push(node);
  })
  return matches;
}

function ignorePath(pathSegment, ignored) {
  if (Array.isArray(pathSegment)) {
    pathSegment.forEach(expression => {
      if (typeof expression !== 'string') throw `Ignored files and directories must be strings.${'\n'}`;
      if (!isPathIgnored(expression, ignored)) ignored.push(expression);
    })
  } else if (typeof pathSegment === 'string') {
    if (!isPathIgnored(pathSegment, ignored)) ignored.push(pathSegment);
  } else throw `Invalid argument type provided to 'ignore' method. Ignore expressions must be a string or an array of strings!`;
  return null;
}

function isPathIgnored(pathSegment, ignored) {
  if (pathSegment[0] === '.') return true;
  return ignored.some(element => element === pathSegment);
}

function prependRoot(node) {
  if (node[0] !== '~') node.unshift('~');
  return node;
}

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

function requireModule(target, findingFunction, filePath) {
  checkSearchTerm(filePath, 'requireModule');

  let mod;
  try {
    mod = target(filePath);
  } catch (e) {
    mod = target(findingFunction(filePath));
  }
  return mod;
};

function unignorePath(pathSegment, ignored) {
  if (Array.isArray(pathSegment)) {
    pathSegment.forEach(expression => {
      if (typeof expression !== 'string') throw `Ignored files and directories must be strings.${'\n'}`;
      const pathIndex = ignored.indexOf(expression);
      if (pathIndex >= 0) ignored.splice(pathIndex, 1);
    })
  } else if (typeof pathSegment === 'string') {
    const pathIndex = ignored.indexOf(pathSegment);
    if (pathIndex >= 0) ignored.splice(pathIndex, 1);
  } else `Invalid argument type provided to 'ignore' method. Ignore expressions must be a string or an array of strings!`;
  return null;
}

