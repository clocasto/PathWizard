const expect = require('chai')
  .expect;
const fse = require('fs-extra');
const path = require('path');
const PathWizard = require('../src');

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
  _root_c_c_cjs,
  _root_c_c_indexjs;

describe('PathWizard Testing', function() {

  before('Assemble a test file tree', function() {
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

    _root_b_bjs = path.join(_root_b, 'b.js');
    fse.writeFileSync(_root_b_bjs, `${_root_b_bjs}`)

    _root_c_c_cjs = path.join(_root_c_c, 'c.js');
    fse.writeFileSync(_root_c_c_cjs, `${_root_c_c_cjs}`)

  })

  describe('Module Methods and Functionality', function() {

    it(`PathWizard should only have 'abs', 'absDir', 'rel', 'relDir', 'req', and 'ignore' methods`, function() {
      const pw = PathWizard();
      expect(pw.abs)
        .to.be.an.instanceof(Function);
      expect(pw.absDir)
        .to.be.an.instanceof(Function);
      expect(pw.rel)
        .to.be.an.instanceof(Function);
      expect(pw.relDir)
        .to.be.an.instanceof(Function);
      expect(pw.req)
        .to.be.an.instanceof(Function);
      expect(pw.ignore)
        .to.be.an.instanceof(Function);
    })

    it(`When PathWizard is invoked with no argument, the current root is the process' CWD`, function() {
      const pw = PathWizard();
      expect(path.normalize(pw.root))
        .to.eql(path.normalize(path.join(__dirname, '..')))
    })

    it('When PathWizard is invoked with a string-typed path, the current root is adjusted', function() {
      const pw = PathWizard(_root_c_c);
      expect(path.normalize(pw.root))
        .to.eql(path.normalize(_root_c_c));
    })

    it('When PathWizard is invoked with a non-string typed path, an Error is thrown', function() {
      expect(PathWizard.bind(null, ([__dirname, 'test-folder'])))
        .to.throw('PathWizard constructor only accepts undefined or a string-typed project directory.');
    })

  })

  describe('Absolute Path Finding', function() {

    const pw = PathWizard(path.join(__dirname, 'test-folder'));

    describe('File matching', function() {

      describe('Root directory', function() {

        it(`Finds './index.js' from various search expressions`, function() {
          expect(pw.abs('index.js'))
            .to.eql(_root_indexjs);
          expect(pw.abs('index'))
            .to.eql(_root_indexjs);
          expect(pw.abs('/'))
            .to.eql(_root_indexjs);
          expect(pw.abs('./index'))
            .to.eql(_root_indexjs);
          expect(pw.abs('./index.js'))
            .to.eql(_root_indexjs);
        })

        it(`Finds './app.js' from various search expressions`, function() {
          expect(pw.abs('app.js'))
            .to.eql(_root_appjs);
          expect(pw.abs('app'))
            .to.eql(_root_appjs);
          expect(pw.abs('./app'))
            .to.eql(_root_appjs);
          expect(pw.abs('./app.js'))
            .to.eql(_root_appjs);
        })

      })

      describe('Nested directories', function() {

        it(`Finds './a/test.js' from various search expressions`, function() {
          expect(pw.abs('a/test.js'))
            .to.eql(_root_a_testjs);
          expect(pw.abs('./a/test.js'))
            .to.eql(_root_a_testjs);
          expect(pw.abs('a/test'))
            .to.eql(_root_a_testjs);
          expect(pw.abs('a/test.js'))
            .to.eql(_root_a_testjs);
          expect(pw.abs('./a/test'))
            .to.eql(_root_a_testjs);
          expect(pw.abs('./a/test.js'))
            .to.eql(_root_a_testjs);
        })

        it(`Finds './b/b.js' from various search expressions`, function() {
          // expect(pw.abs('app.js'))
          //   .to.eql(_root_appjs);
          // expect(pw.abs('app'))
          //   .to.eql(_root_appjs);
          // expect(pw.abs('./app'))
          //   .to.eql(_root_appjs);
          // expect(pw.abs('./app.js'))
          //   .to.eql(_root_appjs);
        })

        it(`Finds './c/c/c.js' from various search expressions`, function() {
          // expect(pw.abs('index.js'))
          //   .to.eql(_root_indexjs);
          // expect(pw.abs('index'))
          //   .to.eql(_root_indexjs);
          // expect(pw.abs('/'))
          //   .to.eql(_root_indexjs);
          // expect(pw.abs('./index'))
          //   .to.eql(_root_indexjs);
          // expect(pw.abs('./index.js'))
          //   .to.eql(_root_indexjs);
        })

        it(`Finds './c/c/index.js' from various search expressions`, function() {
          fse.removeSync(_root_indexjs);

          _root_c_c_indexjs = path.join(_root_c_c, 'index.js');
          fse.writeFileSync(_root_c_c_indexjs, `${_root_c_c_indexjs}`)

          // expect(pw.abs('index.js'))
          //   .to.eql(_root_indexjs);
          // expect(pw.abs('index'))
          //   .to.eql(_root_indexjs);
          // expect(pw.abs('/'))
          //   .to.eql(_root_indexjs);
          // expect(pw.abs('./index'))
          //   .to.eql(_root_indexjs);
          // expect(pw.abs('./index.js'))
          //   .to.eql(_root_indexjs);
        })

      })

    })

    describe('Folder matching', function() {

      it(`Finds 'test-folder/a', in the same directory, searching for 'index.js'`, function() {

      })

      it(`Finds 'test-folder/a/a', in the same directory, searching for 'index'`, function() {

      })

      it(`Finds 'test-folder/a', in the same directory, searching for '/'`, function() {

      })

    })

  })

  describe('Relative Path Finding', function() {

  })

  describe('Require Functionality', function() {

  })

  describe('Ignoring Directories', function() {

  })

  after('Deletes the test folder', function() {
    const _root = path.join(__dirname, './test-folder');
    fse.removeSync(_root);
  })

})

