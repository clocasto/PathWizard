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
      if (pathIndex >= 0 && pathSegment.length > 0) ignored.splice(pathIndex, 1);
    })
  } else if (typeof pathSegment === 'string') {
    const pathIndex = ignored.indexOf(pathSegment);
    if (pathIndex >= 0 && pathSegment.length > 0) ignored.splice(pathIndex, 1);
  } else throw `Invalid argument type provided to 'ignore' method. Ignore expressions must be a string or an array of strings!`;
}

