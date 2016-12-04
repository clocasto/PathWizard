const chai = require('chai');
const spies = require('chai-spies');
const fse = require('fs-extra');
const path = require('path');
const PathWizard = require('../dist');
const expect = chai.expect;

chai.use(spies);

let _root,
  _root_a,
  _root_b,
  _root_c,
  _root_chaijs,
  _root_sinonjs,
  _root_a_a,
  _root_b_b,
  _root_c_c,
  _root_a_ajs,
  _root_indexjs,
  _root_appjs,
  _root_a_testjs,
  _root_b_bjs,
  _root_b_indexjs,
  _root_c_c_cjs,
  _root_c_c_indexjs;

describe('PathWizard', function() {

  before('Assemble a test file tree', function() {

    _root = path.join(__dirname, './test-folder');
    fse.removeSync(_root);
    fse.mkdirSync(_root);

    _root_a = path.join(_root, 'a');
    fse.mkdirSync(_root_a);
    _root_b = path.join(_root, 'b');
    fse.mkdirSync(_root_b);
    _root_c = path.join(_root, 'c');
    fse.mkdirSync(_root_c);

    _root_chaijs = path.join(_root, 'chai.js');
    _root_sinonjs = path.join(_root, 'sinon.js');

    _root_a_a = path.join(_root_a, 'a');
    fse.mkdirSync(_root_a_a);
    _root_b_b = path.join(_root_b, 'b');
    fse.mkdirSync(_root_b_b);
    _root_c_c = path.join(_root_c, 'c');
    fse.mkdirSync(_root_c_c);

    _root_a_ajs = path.join(_root_a_a, 'a.js');

    _root_indexjs = path.join(_root, 'index.js');
    fse.writeFileSync(_root_indexjs, `${_root_indexjs}`);

    _root_appjs = path.join(_root, 'app.js');
    fse.writeFileSync(_root_appjs, `${_root_appjs}`)

    _root_a_testjs = path.join(_root_a, 'test.js');
    fse.writeFileSync(_root_a_testjs, `module.exports = '${_root_a_testjs}'`)

    _root_b_indexjs = path.join(_root_b, 'index.js');
    _root_b_bjs = path.join(_root_b, 'b.js');
    fse.writeFileSync(_root_b_bjs, `${_root_b_bjs}`)

    _root_c_c_indexjs = path.join(_root_c_c, 'index.js');

    _root_c_c_cjs = path.join(_root_c_c, 'c.js');
    fse.writeFileSync(_root_c_c_cjs, `${_root_c_c_cjs}`)

    _root_c_c_djs = path.join(_root_c_c, 'd.js');
    fse.writeFileSync(_root_c_c_djs,
      `const path = require('path');
      const pw = require('../../../../dist/index.js')(require, path.join(__dirname, '../../'));
      const answer = pw.rel('c.js');
      module.exports = answer;`
    )

    _root_c_c_fjs = path.join(_root_c_c, 'f.js');
    fse.writeFileSync(_root_c_c_fjs,
      `const path = require('path');
      const pw = require('../../../../dist/index.js')(require, path.join(__dirname, '../../'));
      const answer = pw.rel('b.js');
      module.exports = answer;`
    )

    _root_c_c_gjs = path.join(_root_c_c, 'g.js');
    fse.writeFileSync(_root_c_c_gjs,
      `const path = require('path');
      const pw = require('../../../../dist/index.js')(require, path.join(__dirname, '../../'));
      const answer = pw.rel('b.js');
      module.exports = answer;`
    )

  })

  describe('Has Certain Module Methods and Functionality', function() {
    let pw;

    beforeEach(() => {
      pw = PathWizard({ cache: false });
    });

    it(`PathWizard should have 'abs', 'absDir', 'rel', 'relDir', 'req', and 'ignore' methods`, function() {
      expect(pw.abs).to.be.an.instanceof(Function);
      expect(pw.absDir).to.be.an.instanceof(Function);
      expect(pw.rel).to.be.an.instanceof(Function);
      expect(pw.relDir).to.be.an.instanceof(Function);
      expect(pw.ignore).to.be.an.instanceof(Function);
    })

    it(`When PathWizard is invoked with no argument, the current root is the process' CWD`, function() {
      expect(path.normalize(pw.root)).to.eql(path.normalize(path.join(__dirname, '..')))
    })

    it('When PathWizard is invoked with a string-typed path, the current root is adjusted', function() {
      const pw2 = PathWizard({ root: _root_c_c });
      expect(path.normalize(pw2.root)).to.eql(path.normalize(_root_c_c));
    })

    it('When PathWizard is invoked with a non-string typed path, an Error is thrown', function() {
      expect(PathWizard.bind(null, { root: [__dirname, 'test-folder'] }))
        .to.throw('PathWizard constructor only accepts undefined or a string-typed project directory.');
    })

    it('PathWizard caches the file structure by default, with an option to disable', function() {
      const pwCache = PathWizard();
      expect(pwCache.cache).to.eql(true);

      const pwNoCache = PathWizard({ cache: false });
      expect(pwNoCache.cache).to.eql(false);

      pwCache.abs('b');
      pwNoCache.abs('b');

      const cachedNodes = pwCache.nodes;
      const nonCachedNodes = pwNoCache.nodes;

      pwCache.abs('b');
      pwNoCache.abs('b');

      expect(cachedNodes).to.equal(pwCache.nodes);
      expect(nonCachedNodes).to.not.equal(pwNoCache.nodes);
    })

    it('PathWizard Proxy will allow access to origin require properties', function() {
      pw.testProp = 123;
      pw.testFunc = () => 456;
      expect(pw.testProp).to.eql(123);
      expect(pw.testFunc()).to.eql(456);
    })

    describe(`PathWizard Will Ignore & Unignore Certain Directories`, function() {

      it(`Using the 'ignore' method`, function() {
        expect(pw.ignore).to.be.an.instanceof(Function);

        const ignoredPaths = pw.ignored;
        const referenceIngoredPaths = ignoredPaths.slice();
        expect(ignoredPaths).to.eql(['node_modules', 'bower_components']);

        referenceIngoredPaths.slice().forEach(pw.unignore);
        expect(ignoredPaths).to.eql([]);
        referenceIngoredPaths.slice().forEach(pw.unignore);
        expect(ignoredPaths).to.eql([]);
      })

      it(`Using the 'unignore' method`, function() {
        expect(pw.unignore).to.be.an.instanceof(Function);

        const ignoredPaths = pw.ignored;
        expect(ignoredPaths).to.eql(['node_modules', 'bower_components']);

        pw.unignore('node_modules');

        expect(ignoredPaths.includes('node_modules')).to.be.false;
      })

      it(`Without Error if No Results are Found or if the Ignored State is Empty`, function() {
        const ignoredPaths = pw.ignored;
        const referenceIngoredPaths = ignoredPaths.slice();
        expect(ignoredPaths).to.eql(['node_modules', 'bower_components']);

        referenceIngoredPaths.forEach(pw.unignore);
        expect(ignoredPaths).to.eql([]);
        referenceIngoredPaths.forEach(pw.unignore);
        expect(ignoredPaths).to.eql([]);
      })

      it(`Won't add duplicates to its ignored list`, function() {
        const ignoredPaths = pw.ignored;
        const referenceIngoredPaths = ignoredPaths.slice();
        expect(ignoredPaths).to.eql(['node_modules', 'bower_components']);

        referenceIngoredPaths.forEach(pw.ignore);
        expect(ignoredPaths).to.eql(referenceIngoredPaths);
        referenceIngoredPaths.forEach(pw.ignore);
        expect(ignoredPaths).to.eql(referenceIngoredPaths);
        referenceIngoredPaths.forEach(pw.ignore);
        expect(ignoredPaths).to.eql(referenceIngoredPaths);
      })

      it(`Using the 'ignore' option in the PathWizard constructor`, function() {
        pw = PathWizard({ cache: false, ignored: [] });
        expect(pw.ignored).to.eql([]);

        pw.ignore('node_modules');
        expect(pw.ignored).to.eql(['node_modules']);
        pw.unignore('node_modules');
        expect(pw.ignored).to.eql([]);
      })

      it(`from arrays of ignore terms`, function() {
        pw = PathWizard({ cache: false, ignored: [] });

        pw.ignore(['node_modules']);
        expect(pw.ignored).to.eql(['node_modules']);

        pw.unignore(['node_modules']);
        expect(pw.ignored).to.eql([]);

        pw.ignore(['a', 'b', 'c', 'node_modules']);
        expect(pw.ignored).to.eql(['a', 'b', 'c', 'node_modules']);

        pw.unignore(['a']);
        expect(pw.ignored).to.eql(['b', 'c', 'node_modules']);

        pw.unignore(['a']);
        expect(pw.ignored).to.eql(['b', 'c', 'node_modules']);

        pw.unignore(['a', 'b', 'c']);
        expect(pw.ignored).to.eql(['node_modules']);
      })

      it(`won't search in ignored directories`, function() {
        pw = PathWizard({ cache: false });

        pw.ignore(['a', 'b', 'c']);
        expect(pw.ignored).to.eql(['node_modules', 'bower_components', 'a', 'b', 'c']);
        expect(pw.bind(null, 'test.js')).to.throw;
        pw.unignore(['a']);
        expect(pw('test.js')).to.eql(_root_a_testjs);
      })

      it(`and can handle incorrect search term types`, function() {
        pw = PathWizard({ cache: false, ignored: [] });

        pw.ignore('');
        pw.ignore(['']);
        pw.ignore(['', 'a']);

        expect(pw.ignored).to.eql(['a']);

        pw.unignore('');
        pw.unignore(['']);
        expect(pw.ignored).to.eql(['a']);

        pw.unignore(['', 'a']);
        expect(pw.ignored).to.eql([]);

        expect(pw.ignore.bind(null, [123]))
          .to.throw('Ignored files and directories must be strings.\n');
        expect(pw.ignore.bind(null, 123))
          .to.throw('Invalid argument type provided to \'ignore\' method. Ignore expressions must be a string or an array of strings!');
        expect(pw.ignore.bind(null, [{ term: 123 }]))
          .to.throw('Ignored files and directories must be strings.\n');
        expect(pw.ignore.bind(null, [
            [123, 456],
            [789], 101112
          ]))
          .to.throw('Ignored files and directories must be strings.\n');

        expect(pw.unignore.bind(null, [123]))
          .to.throw('Ignored files and directories must be strings.\n');
        expect(pw.unignore.bind(null, 123))
          .to.throw(`Invalid argument type provided to 'ignore' method. Ignore expressions must be a string or an array of strings!`);
        expect(pw.unignore.bind(null, [{ term: 123 }]))
          .to.throw('Ignored files and directories must be strings.\n');
        expect(pw.unignore.bind(null, [
            [123, 456],
            [789], 101112
          ]))
          .to.throw('Ignored files and directories must be strings.\n');
      })

    })

  })

  describe('Can, For Absolute Paths,', function() {

    const pw = PathWizard({ cache: false, root: path.join(__dirname, 'test-folder') });

    describe('Handle Invalid Arguments', function() {

      it('Throws an error when an invalid argument is provided to `abs`', function() {
        expect(pw.abs.bind(null, '')).to.throw;
        expect(pw.abs.bind(null)).to.throw;
        expect(pw.abs.bind(null, '{path: `${_root_indexjs}`}')).to.throw;
        expect(pw.abs.bind(null, '[`${_root_indexjs}`]')).to.throw;
      })

      it('Throws an error when an invalid argument is provided to `absDir`', function() {
        expect(pw.absDir.bind(null, '')).to.throw(Error);
        expect(pw.absDir.bind(null)).to.throw(Error);
        expect(pw.absDir.bind(null, '{path: `${_root_indexjs}`}')).to.throw;
        expect(pw.absDir.bind(null, '[`${_root_indexjs}`]')).to.throw;
      })

    })

    describe('Find and Match Files', function() {

      describe('From A Root Directory', function() {

        it(`Finds './index.js' from various string search expressions`, function() {
          expect(pw.abs('index.js')).to.eql(_root_indexjs);
          expect(pw.abs('index')).to.eql(_root_indexjs);
          expect(pw.abs('/')).to.eql(_root_indexjs);
          expect(pw.abs('./')).to.eql(_root_indexjs);
          expect(pw.abs('./index')).to.eql(_root_indexjs);
          expect(pw.abs('./index.js')).to.eql(_root_indexjs);
        })

        it(`Finds './index.js' from various array search expressions`, function() {
          expect(pw.abs(['index.js'])).to.eql(_root_indexjs);
          expect(pw.abs(['index'])).to.eql(_root_indexjs);
          expect(pw.abs(['/'])).to.eql(_root_indexjs);
          expect(pw.abs(['./'])).to.eql(_root_indexjs);
          expect(pw.abs(['./', 'index'])).to.eql(_root_indexjs);
          expect(pw.abs(['./', 'index.js'])).to.eql(_root_indexjs);
        })

        it(`Finds './app.js' from various string search expressions`, function() {
          expect(pw.abs('app.js')).to.eql(_root_appjs);
          expect(pw.abs('app')).to.eql(_root_appjs);
          expect(pw.abs('./app')).to.eql(_root_appjs);
          expect(pw.abs('./app.js')).to.eql(_root_appjs);
        })

        it(`Finds './app.js' from various string search expressions`, function() {
          expect(pw.abs(['app.js'])).to.eql(_root_appjs);
          expect(pw.abs(['app'])).to.eql(_root_appjs);
          expect(pw.abs(['./', 'app'])).to.eql(_root_appjs);
          expect(pw.abs(['./', 'app.js'])).to.eql(_root_appjs);
          expect(pw.abs.bind(null, ['./', 'app', '.js'])).to.throw;
        })

      })

      describe('In And From Nested directories', function() {

        it(`Finds './a/test.js' from various search expressions`, function() {
          expect(pw.abs('a/test.js')).to.eql(_root_a_testjs);
          expect(pw.abs('./a/test.js')).to.eql(_root_a_testjs);
          expect(pw.abs('a/test')).to.eql(_root_a_testjs);
          expect(pw.abs('a/test.js')).to.eql(_root_a_testjs);
          expect(pw.abs('./a/test')).to.eql(_root_a_testjs);
          expect(pw.abs('./a/test.js')).to.eql(_root_a_testjs);
        })

        it(`Finds './b/b.js' from various search expressions`, function() {
          expect(pw.abs('b')).to.eql(_root_b_bjs);
          expect(pw.abs('b.js')).to.eql(_root_b_bjs);
          expect(pw.abs('b/b')).to.eql(_root_b_bjs);
          expect(pw.abs('b/b.js')).to.eql(_root_b_bjs);
          expect(pw.abs('./b/b')).to.eql(_root_b_bjs);
          expect(pw.abs('./b/b.js')).to.eql(_root_b_bjs);
        })

        it(`Finds './c/c/c.js' from various search expressions`, function() {
          expect(pw.abs('c')).to.eql(_root_c_c_cjs);
          expect(pw.abs('c.js')).to.eql(_root_c_c_cjs);
          expect(pw.abs('c/c')).to.eql(_root_c_c_cjs);
          expect(pw.abs('c/c.js')).to.eql(_root_c_c_cjs);
          expect(pw.abs('c/c/c')).to.eql(_root_c_c_cjs);
          expect(pw.abs('c/c/c.js')).to.eql(_root_c_c_cjs);
          expect(pw.abs('./c/c/c.js')).to.eql(_root_c_c_cjs);
          expect(pw.abs('./c/c/c')).to.eql(_root_c_c_cjs);
        })

        it(`Chooses '{{directory}}.js' over '{{directory}}/index.js'`, function() {
          expect(pw.abs('c')).to.eql(_root_c_c_cjs);
        })

        it(`Throws an error when non-unique search expressions are given'`, function() {
          const _root_b_b_indexjs = path.join(_root_b_b, 'index.js');
          fse.writeFileSync(_root_b_b_indexjs, `${_root_b_b_indexjs}`)

          expect(pw.abs.bind(null, 'index')).to.throw;

          fse.removeSync(_root_b_b_indexjs);
        })

        it(`Finds './c/c/index.js' from various string search expressions`, function() {

          fse.removeSync(_root_indexjs);
          fse.removeSync(_root_c_c_cjs);

          fse.writeFileSync(_root_c_c_indexjs, `${_root_c_c_indexjs}`)

          expect(pw.abs('index.js')).to.eql(_root_c_c_indexjs);
          expect(pw.abs('index')).to.eql(_root_c_c_indexjs);
          expect(pw.abs('/')).to.eql(_root_c_c_indexjs);
          expect(pw.abs('index.js')).to.eql(_root_c_c_indexjs);
          expect(pw.abs('c/index')).to.eql(_root_c_c_indexjs);
          expect(pw.abs('c/index.js')).to.eql(_root_c_c_indexjs);
          expect(pw.abs('c/c')).to.eql(_root_c_c_indexjs);
          expect(pw.abs('c/c/index')).to.eql(_root_c_c_indexjs);
          expect(pw.abs('c/c/index.js')).to.eql(_root_c_c_indexjs);
          expect(pw.abs('./c/c')).to.eql(_root_c_c_indexjs);
          expect(pw.abs('./c/c/index')).to.eql(_root_c_c_indexjs);
          expect(pw.abs('./c/c/index.js')).to.eql(_root_c_c_indexjs);
        })

        it(`Finds './c/c/index.js' from various array search expressions`, function() {

          fse.removeSync(_root_indexjs);
          fse.removeSync(_root_c_c_cjs);

          fse.writeFileSync(_root_c_c_indexjs, `${_root_c_c_indexjs}`)

          expect(pw.abs(['index.js'])).to.eql(_root_c_c_indexjs);
          expect(pw.abs(['index'])).to.eql(_root_c_c_indexjs);
          expect(pw.abs(['/'])).to.eql(_root_c_c_indexjs);
          expect(pw.abs(['index.js'])).to.eql(_root_c_c_indexjs);
          expect(pw.abs(['c', 'index'])).to.eql(_root_c_c_indexjs);
          expect(pw.abs(['c', 'index.js'])).to.eql(_root_c_c_indexjs);
          expect(pw.abs(['c', 'c'])).to.eql(_root_c_c_indexjs);
          expect(pw.abs(['c', 'c', 'index'])).to.eql(_root_c_c_indexjs);
          expect(pw.abs(['c', 'c', 'index.js'])).to.eql(_root_c_c_indexjs);
          expect(pw.abs(['/', 'c', 'c'])).to.eql(_root_c_c_indexjs);
          expect(pw.abs(['.', 'c', 'c', 'index'])).to.eql(_root_c_c_indexjs);
          expect(pw.abs(['./', 'c', 'c', 'index.js'])).to.eql(_root_c_c_indexjs);
        })

      })

    })

    describe('Folder matching', function() {

      it(`Finds './test-folder/a' from various string search expressions`, function() {
        fse.removeSync(_root_a_ajs);
        fse.writeFileSync(_root_a_ajs, `'${_root_a_ajs}'`);

        expect(pw.absDir('./a')).to.eql(_root_a);
        expect(pw.absDir('./a/')).to.eql(_root_a);
        expect(pw.absDir('/a/')).to.eql(_root_a);
        expect(pw.absDir('a/a')).to.eql(_root_a_a);
        expect(pw.absDir('a/a/')).to.eql(_root_a_a);
        expect(pw.absDir('./a/a')).to.eql(_root_a_a);
        expect(pw.absDir('./a/a/')).to.eql(_root_a_a);
        expect(pw.absDir.bind(null, 'a')).to.throw(`The path did not uniquely resolve! \n\n~/a/a\n~/a\n`);
        expect(pw.absDir.bind(null, 'a/')).to.throw(`The path did not uniquely resolve! \n\n~/a/a\n~/a\n`);

        fse.removeSync(_root_a_ajs);
      })

      it(`Finds './test-folder/a' from various array search expressions`, function() {
        fse.removeSync(_root_a_ajs);
        fse.writeFileSync(_root_a_ajs, `'${_root_a_ajs}'`);

        expect(pw.absDir(['./', 'a'])).to.eql(_root_a);
        expect(pw.absDir(['./', 'a', '/'])).to.eql(_root_a);
        expect(pw.absDir(['/', 'a', '/'])).to.eql(_root_a);
        expect(pw.absDir(['a', 'a'])).to.eql(_root_a_a);
        expect(pw.absDir(['a', 'a'])).to.eql(_root_a_a);
        expect(pw.absDir(['./', 'a', 'a'])).to.eql(_root_a_a);
        expect(pw.absDir(['.', 'a', 'a', '/'])).to.eql(_root_a_a);
        expect(pw.absDir.bind(null, ['a'])).to.throw(`The path did not uniquely resolve! \n\n~/a/a\n~/a\n`);
        expect(pw.absDir.bind(null, ['a', '/'])).to.throw(`The path did not uniquely resolve! \n\n~/a/a\n~/a\n`);

        fse.removeSync(_root_a_ajs);
      })

      it(`Finds the root directory from various string search expressions`, function() {
        expect(pw.absDir('./')).to.eql(_root);
        expect(pw.absDir('/')).to.eql(_root);
        expect(pw.absDir('.')).to.eql(_root);
      })

      it(`Finds the root directory from various array search expressions`, function() {
        expect(pw.absDir(['./'])).to.eql(_root);
        expect(pw.absDir(['/'])).to.eql(_root);
        expect(pw.absDir(['.'])).to.eql(_root);
        expect(pw.absDir.bind(null, ['.', '/'])).to.throw;
      })

    })

  })

  describe('Relative Path', function() {
    const pw = PathWizard({ cache: false, root: path.join(__dirname, 'test-folder') });

    const format = pathStr => `./${path.relative(__dirname, pathStr)}`;

    describe('Invalid Arguments', function() {

      it('Throws an error when an invalid argument is provided to `rel`', function() {
        expect(pw.rel.bind(null, '')).to.throw(Error);
        expect(pw.rel.bind(null)).to.throw(Error);
        expect(pw.rel.bind(null, '{path: `${_root_indexjs}`}')).to.throw;
        expect(pw.rel.bind(null, '[`${_root_indexjs}`]')).to.throw;
      })

      it('Throws an error when an invalid argument is provided to `relDir`', function() {
        expect(pw.relDir.bind(null, '')).to.throw(Error);
        expect(pw.relDir.bind(null)).to.throw(Error);
        expect(pw.relDir.bind(null, '{path: `${_root_indexjs}`}')).to.throw;
        expect(pw.relDir.bind(null, '[`${_root_indexjs}`]')).to.throw;
      })

    })

    describe('File matching', function() {

      it(`Returns a path preceded by './' or '../'`, function() {
        fse.writeFileSync(_root_c_c_cjs, `${_root_c_c_cjs}`);

        expect(require('./test-folder/c/c/d.js')).to.eql('./c.js');
        expect(require('./test-folder/c/c/f.js')).to.eql('../../b/b.js');
        expect(require('./test-folder/c/c/f.js')).to.eql('../../b/b.js');
      })

    })

    describe('Folder matching', function() {

      it(`Finds './test-folder/a' and './test-folder/a/a' from various string search expressions`, function() {
        fse.removeSync(_root_a_ajs);
        fse.writeFileSync(_root_a_ajs, `'${_root_a_ajs}'`);

        expect(pw.relDir('./a')).to.eql('./a');
        expect(pw.relDir('./a/')).to.eql('./a');
        expect(pw.relDir('/a/')).to.eql('./a');
        expect(pw.relDir('a/a')).to.eql('./a/a');
        expect(pw.relDir('a/a/')).to.eql('./a/a');
        expect(pw.relDir('./a/a')).to.eql('./a/a');
        expect(pw.relDir('./a/a/')).to.eql('./a/a');
        expect(pw.relDir.bind(null, 'a')).to.throw(`The path did not uniquely resolve! \n\n~/a/a\n~/a\n`);
        expect(pw.relDir.bind(null, 'a/')).to.throw(`The path did not uniquely resolve! \n\n~/a/a\n~/a\n`);

        fse.removeSync(_root_a_ajs);
      })

      it(`Finds './test-folder/a' and './test-folder/a/a' from various array search expressions`, function() {
        fse.removeSync(_root_a_ajs);
        fse.writeFileSync(_root_a_ajs, `'${_root_a_ajs}'`);

        expect(pw.relDir(['./', 'a'])).to.eql('./a');
        expect(pw.relDir(['./', 'a', '/'])).to.eql('./a');
        expect(pw.relDir(['/', 'a', '/'])).to.eql('./a');
        expect(pw.relDir(['a', 'a'])).to.eql('./a/a');
        expect(pw.relDir(['a', 'a'])).to.eql('./a/a');
        expect(pw.relDir(['./', 'a', 'a'])).to.eql('./a/a');
        expect(pw.relDir(['.', 'a', 'a', '/'])).to.eql('./a/a');
        expect(pw.relDir.bind(null, ['a'])).to.throw('The path did not uniquely resolve! \n\n~/a/a\n~/a\n');
        expect(pw.relDir.bind(null, ['a/'])).to.throw('The path did not uniquely resolve! \n\n~/a/a\n~/a\n');

        fse.removeSync(_root_a_ajs);
      })

      it(`Finds the root directory from various search expressions`, function() {
        expect(pw.relDir('./')).to.eql('./');
        expect(pw.relDir('/')).to.eql('./');
        expect(pw.relDir('.')).to.eql('./');
      })

    })

  })

  describe('Require Functionality', function() {

    it('Throws an error when an invalid argument is provided', function() {
      const pw = PathWizard({ cache: false, root: path.join(__dirname, 'test-folder') });

      expect(pw.rel.bind(null, '')).to.throw;
      expect(pw.rel.bind(null)).to.throw;
      expect(pw.rel.bind(null, '{path: `${_root_indexjs}`}')).to.throw;
      expect(pw.rel.bind(null, '[`${_root_indexjs}`]')).to.throw;
    })

    it(`Will require an installed module, prior to looking in its own cache`, function() {
      const pw = PathWizard({ cache: false });

      _root_chaijs = path.join(_root, 'chai.js');
      fse.writeFileSync(_root_chaijs, `'${_root_chaijs}'`);

      const chaiModule = pw('chai');

      expect(chaiModule).to.equal(require('chai'));
      expect(chaiModule.expect).to.be.an.instanceof(Function);

      fse.writeFileSync(_root_chaijs, `'${_root_chaijs}'`);
      fse.removeSync(_root_chaijs);

    })

    it('Will require a project file if a named module was not found', function() {
      const pw = PathWizard({ cache: false, root: path.join(__dirname, 'test-folder') });

      fse.removeSync(_root_c_c_cjs);
      fse.removeSync(_root_c_c_indexjs);
      fse.writeFileSync(_root_sinonjs, `module.exports = '${_root_sinonjs}'`);
      fse.writeFileSync(_root_indexjs, `'${_root_indexjs}'`);
      fse.writeFileSync(_root_c_c_cjs, `module.exports = '${_root_c_c_cjs}'`)
      fse.writeFileSync(_root_c_c_indexjs, `${_root_c_c_indexjs}`)

      const sinonFile = pw('sinon');

      expect(sinonFile).to.equal(`${_root_sinonjs}`);

      fse.removeSync(_root_chaijs);
    })

  })

  after('Deletes the test folder', function() {
    fse.removeSync(_root);
  })

})

