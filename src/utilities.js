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

function ignorePath(pathSegment, ignored) {
  if (Array.isArray(pathSegment)) {
    pathSegment.forEach(exp => {
      if (typeof exp !== 'string') `Ignored files and directories must be strings.${'\n'}`;
    })
    ignored.push(...pathSegment);
  }
  ignored.push(pathSegment);
}

function isPathIgnored(pathSegment, ignoredArray) {
  if (pathSegment[0] === '.') return true;
  return ignoredArray.some(element => element === pathSegment);
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

function req(target, findingFunction, filePath) {
  if (!filePath) throw new Error(`A search expression must be provided to the 'req' method.`);
  if (!filePath.length) throw new Error(`The 'req' method requires a non-empty string or array search expression.`);

  let mod;
  try {
    mod = target(filePath);
  } catch (e) {
    mod = target(findingFunction(filePath));
  }
  return mod;
};

