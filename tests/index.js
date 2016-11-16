const chai = require('chai');
const spies = require('chai-spies');
const fse = require('fs-extra');
const path = require('path');
const PathWizard = require('../src');
const expect = chai.expect;

chai.use(spies);

let _root,
  _root_a,
  _root_b,
  _root_c,
  _root_a_a,
  _root_b_b,
  _root_c_c,
  _root_indexjs,
  _root_appjs,
  _root_a_testjs,
  _root_b_bjs,
  _root_b_indexjs,
  _root_c_c_cjs,
  _root_c_c_indexjs;

describe('PathWizard', function () {

  before('Assemble a test file tree', function () {
    _root = path.join(__dirname, './test-folder');
    fse.mkdirSync(_root);

    _root_a = path.join(_root, 'a');
    fse.mkdirSync(_root_a);
    _root_b = path.join(_root, 'b');
    fse.mkdirSync(_root_b);
    _root_c = path.join(_root, 'c');
    fse.mkdirSync(_root_c);

    _root_a_a = path.join(_root_a, 'a');
    fse.mkdirSync(_root_a_a);
    _root_b_b = path.join(_root_b, 'b');
    fse.mkdirSync(_root_b_b);
    _root_c_c = path.join(_root_c, 'c');
    fse.mkdirSync(_root_c_c);

    _root_indexjs = path.join(_root, 'index.js');
    fse.writeFileSync(_root_indexjs, `${_root_indexjs}`)

    _root_appjs = path.join(_root, 'app.js');
    fse.writeFileSync(_root_appjs, `${_root_appjs}`)

    _root_a_testjs = path.join(_root_a, 'test.js');
    fse.writeFileSync(_root_a_testjs, `${_root_a_testjs}`)

    _root_b_indexjs = path.join(_root_b, 'index.js');
    _root_b_bjs = path.join(_root_b, 'b.js');
    fse.writeFileSync(_root_b_bjs, `${_root_b_bjs}`)

    _root_c_c_cjs = path.join(_root_c_c, 'c.js');
    fse.writeFileSync(_root_c_c_cjs, `${_root_c_c_cjs}`)

    _root_c_c_djs = path.join(_root_c_c, 'd.js');
    fse.writeFileSync(_root_c_c_djs,
      `
      const path = require('path');
      const pw = require('../../../../src/index.js')(path.join(__dirname, '../../'));
      const answer = pw.rel('c.js');
      module.exports = answer;
      `
    )

    _root_c_c_fjs = path.join(_root_c_c, 'f.js');
    fse.writeFileSync(_root_c_c_fjs,
      `
      const path = require('path');
      const pw = require('../../../../src/index.js')(path.join(__dirname, '../../'));
      const answer = pw.rel('b.js');
      module.exports = answer;
      `
    )

    _root_c_c_gjs = path.join(_root_c_c, 'g.js');
    fse.writeFileSync(_root_c_c_gjs,
      `
      const path = require('path');
      const pw = require('../../../../src/index.js')(path.join(__dirname, '../../'));
      const answer = pw.rel('b.js');
      module.exports = answer;
      `
    )

  })

  describe('Has Certain Module Methods and Functionality', function () {
    const pw = PathWizard(undefined, { cache: false });

    it(`PathWizard should have 'abs', 'absDir', 'rel', 'relDir', 'req', and 'ignore' methods`, function () {
      expect(pw.abs).to.be.an.instanceof(Function);
      expect(pw.absDir).to.be.an.instanceof(Function);
      expect(pw.rel).to.be.an.instanceof(Function);
      expect(pw.relDir).to.be.an.instanceof(Function);
      expect(pw.req).to.be.an.instanceof(Function);
      expect(pw.ignore).to.be.an.instanceof(Function);
    })

    it(`When PathWizard is invoked with no argument, the current root is the process' CWD`, function () {
      expect(path.normalize(pw.root))
        .to.eql(path.normalize(path.join(__dirname, '..')))
    })

    it('When PathWizard is invoked with a string-typed path, the current root is adjusted', function () {
      const pw2 = PathWizard(_root_c_c);
      expect(path.normalize(pw2.root))
        .to.eql(path.normalize(_root_c_c));
    })

    it('When PathWizard is invoked with a non-string typed path, an Error is thrown', function () {
      expect(PathWizard.bind(null, ([__dirname, 'test-folder'])))
        .to.throw('PathWizard constructor only accepts undefined or a string-typed project directory.');
    })

    it('PathWizard caches the file structure by default, with an option to disable', function () {
      const pwCache = PathWizard();
      expect(pwCache.cache).to.eql(true);

      const pwNoCache = PathWizard(undefined, { cache: false });
      expect(pwNoCache.cache).to.eql(false);

      const cacheSpy = chai.spy.on(pwCache, 'traverse');
      const noCacheSpy = chai.spy.on(pwNoCache, 'traverse');

      expect(cacheSpy).to.be.spy;
      expect(noCacheSpy).to.be.spy;

      pwCache.abs('b');
      pwCache.abs('b');
      pwCache.abs('b');
      pwCache.abs('b');

      pwNoCache.abs('b');
      pwNoCache.abs('b');
      pwNoCache.abs('b');
      pwNoCache.abs('b');

      expect(cacheSpy).to.have.been.called.exactly(10);
      expect(noCacheSpy).to.have.been.called.exactly(40);
    })

    describe(`PathWizard Will Ignore Certain Directories`, function () {

      it(`Using the 'ignore' method`, function() {

      })

      it(`Using the 'ignore' option in the PathWizard constructor`, function() {
        
      })

    })

  })

  describe('Can, For Absolute Paths,', function () {

    const pw = PathWizard(path.join(__dirname, 'test-folder'), { cache: false });

    describe('Handle Invalid Arguments', function () {

      it('Throws an error when an invalid argument is provided', function () {
        expect(pw.abs.bind(null, '')).to.throw(Error);
        expect(pw.abs.bind(null)).to.throw(Error);
        expect(pw.abs.bind(null, '{path: `${_root_indexjs}`}')).to.throw(Error);
        expect(pw.abs.bind(null, '[`${_root_indexjs}`]')).to.throw(Error);
      })

    })

    describe('Find and Match Files', function () {

      describe('From A Root Directory', function () {

        it(`Finds './index.js' from various search expressions`, function () {
          expect(pw.abs('index.js')).to.eql(_root_indexjs);
          expect(pw.abs('index')).to.eql(_root_indexjs);
          expect(pw.abs('/')).to.eql(_root_indexjs);
          expect(pw.abs('./index')).to.eql(_root_indexjs);
          expect(pw.abs('./index.js')).to.eql(_root_indexjs);
        })

        it(`Finds './app.js' from various search expressions`, function () {
          expect(pw.abs('app.js')).to.eql(_root_appjs);
          expect(pw.abs('app')).to.eql(_root_appjs);
          expect(pw.abs('./app')).to.eql(_root_appjs);
          expect(pw.abs('./app.js')).to.eql(_root_appjs);
        })

      })

      describe('In And From Nested directories', function () {

        it(`Finds './a/test.js' from various search expressions`, function () {
          expect(pw.abs('a/test.js')).to.eql(_root_a_testjs);
          expect(pw.abs('./a/test.js')).to.eql(_root_a_testjs);
          expect(pw.abs('a/test')).to.eql(_root_a_testjs);
          expect(pw.abs('a/test.js')).to.eql(_root_a_testjs);
          expect(pw.abs('./a/test')).to.eql(_root_a_testjs);
          expect(pw.abs('./a/test.js')).to.eql(_root_a_testjs);
        })

        it(`Finds './b/b.js' from various search expressions`, function () {
          expect(pw.abs('b')).to.eql(_root_b_bjs);
          expect(pw.abs('b.js')).to.eql(_root_b_bjs);
          expect(pw.abs('b/b')).to.eql(_root_b_bjs);
          expect(pw.abs('b/b.js')).to.eql(_root_b_bjs);
          expect(pw.abs('./b/b')).to.eql(_root_b_bjs);
          expect(pw.abs('./b/b.js')).to.eql(_root_b_bjs);
        })

        it(`Finds './c/c/c.js' from various search expressions`, function () {
          expect(pw.abs('c')).to.eql(_root_c_c_cjs);
          expect(pw.abs('c.js')).to.eql(_root_c_c_cjs);
          expect(pw.abs('c/c')).to.eql(_root_c_c_cjs);
          expect(pw.abs('c/c.js')).to.eql(_root_c_c_cjs);
          expect(pw.abs('c/c/c')).to.eql(_root_c_c_cjs);
          expect(pw.abs('c/c/c.js')).to.eql(_root_c_c_cjs);
          expect(pw.abs('./c/c/c.js')).to.eql(_root_c_c_cjs);
          expect(pw.abs('./c/c/c')).to.eql(_root_c_c_cjs);
        })

        it(`Chooses '{{directory}}.js' over '{{directory}}/index.js'`, function () {
          expect(pw.abs('c')).to.eql(_root_c_c_cjs);
        })

        it(`Throws an error when non-unique search expressions are given'`, function () {
          const _root_b_b_indexjs = path.join(_root_b_b, 'index.js');
          fse.writeFileSync(_root_b_b_indexjs, `${_root_b_b_indexjs}`)

          expect(pw.abs.bind(null, 'index')).to.throw(Error);

          fse.removeSync(_root_b_b_indexjs);
        })

        it(`Finds './c/c/index.js' from various search expressions`, function () {

          fse.removeSync(_root_indexjs);
          fse.removeSync(_root_c_c_cjs);

          _root_c_c_indexjs = path.join(_root_c_c, 'index.js');
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

      })

    })

    describe('Folder matching', function () {

      it(`Finds './test-folder/a' from various search expressions`, function () {
        expect(pw.absDir('./a')).to.eql(_root_a);
        expect(pw.absDir('a/a')).to.eql(_root_a_a);
        expect(pw.absDir.bind(null, 'a')).to.throw(Error);
      })

      it(`Finds './c/c/c.js' from various search expressions`, function () {
        fse.writeFileSync(_root_c_c_cjs, `${_root_c_c_cjs}`)

        expect(pw.absDir('c.js')).to.eql(_root_c_c_cjs);
        expect(pw.absDir('c/c.js')).to.eql(_root_c_c_cjs);
        expect(pw.absDir('./c/c')).to.eql(_root_c_c);
        expect(pw.absDir('c/c/c.js')).to.eql(_root_c_c_cjs);
        expect(pw.absDir('./c/c/c.js')).to.eql(_root_c_c_cjs);
        expect(pw.absDir.bind(null, 'c')).to.throw(Error);
        expect(pw.absDir.bind(null, 'c/c')).to.throw(Error);
      })

    })

  })

  describe('Relative Path', function () {
    const pw = PathWizard(path.join(__dirname, 'test-folder'), { cache: false });

    const format = pathStr => `./${path.relative(__dirname, pathStr)}`;

    describe('Invalid Arguments', function () {

      it('Throws an error when an invalid argument is provided', function () {
        expect(pw.rel.bind(null, '')).to.throw(Error);
        expect(pw.rel.bind(null)).to.throw(Error);
        expect(pw.rel.bind(null, '{path: `${_root_indexjs}`}')).to.throw(Error);
        expect(pw.rel.bind(null, '[`${_root_indexjs}`]')).to.throw(Error);
      })

    })

    describe('File matching', function () {

      it('Relies on PathWizard.abs to find absolute paths', function () {
        const absSpy = chai.spy.on(pw, 'abs');
        const absDirSpy = chai.spy.on(pw, 'absDir');

        expect(absSpy).to.be.spy;
        expect(absDirSpy).to.be.spy;

        pw.rel('c');

        expect(absSpy).to.have.been.called();
        expect(absDirSpy).to.not.have.been.called();
      })

      it(`Returns a path preceded by './' or '../'`, function () {
        fse.writeFileSync(_root_c_c_cjs, `${_root_c_c_cjs}`);

        expect(require('./test-folder/c/c/d.js')).to.eql('./c.js');
        expect(require('./test-folder/c/c/f.js')).to.eql('../../b/b.js');
        expect(require('./test-folder/c/c/f.js')).to.eql('../../b/b.js');
      })

    })

    describe('Folder matching', function () {

      it(`Finds './test-folder/a' from various search expressions`, function () {
        expect(pw.absDir('./a')).to.eql(_root_a);
        expect(pw.absDir('a/a')).to.eql(_root_a_a);
        expect(pw.absDir.bind(this, 'a')).to.throw(Error);
      })

      it(`Finds './c/c/c.js' from various search expressions`, function () {
        fse.removeSync(_root_c_c_cjs);
        fse.writeFileSync(_root_c_c_cjs, `module.exports = '${_root_c_c_cjs}'`)

        expect(pw.absDir('c.js')).to.eql(require(_root_c_c_cjs));
        expect(pw.absDir('c/c.js')).to.eql(require(_root_c_c_cjs));
        expect(pw.absDir('./c/c')).to.eql(_root_c_c);
        expect(pw.absDir('c/c/c.js')).to.eql(require(_root_c_c_cjs));
        expect(pw.absDir('./c/c/c.js')).to.eql(require(_root_c_c_cjs));
        expect(pw.absDir.bind(this, 'c')).to.throw(Error);
        expect(pw.absDir.bind(this, 'c/c')).to.throw(Error);
      })

    })

  })

  describe('Require Functionality', function () {

    it('Throws an error when an invalid argument is provided', function () {
      const pw = PathWizard(path.join(__dirname, 'test-folder'), { cache: false });

      expect(pw.rel.bind(null, '')).to.throw(Error);
      expect(pw.rel.bind(null)).to.throw(Error);
      expect(pw.rel.bind(null, '{path: `${_root_indexjs}`}')).to.throw(Error);
      expect(pw.rel.bind(null, '[`${_root_indexjs}`]')).to.throw(Error);
    })

    it(`Will require an installed module, prior to looking in its cache`, function () {
      const pw = PathWizard(path.join(__dirname, 'test-folder'), { cache: false });

      const absSpy = chai.spy.on(pw, 'abs');

      expect(absSpy).to.be.spy;

      const result = pw.req('chai');

      expect(absSpy).to.not.have.been.called();
      expect(result).to.eql(require('chai'));
    })

    xit('Will require a project file if a named module was not found', function () {
      const pw = PathWizard(path.join(__dirname, 'test-folder'), { cache: false });

      fse.writeFileSync(_root_indexjs, `${_root_indexjs}`);
      fse.writeFileSync(_root_b_indexjs, `${_root_b_indexjs}`);

      const result = pw.req('c');

      pw.req('index');

      expect(result).to.eql(`${_root_c_c_cjs}`);
      expect(pw.req.bind(pw,'index')).to.throw(`The path did not uniquely resolve! \n\n~/b/index.js\n~/c/c/index.js\n~/index.js\n`);
    })

  })

  after('Deletes the test folder', function () {
    fse.removeSync(_root);
  })

})

