/**
 * Test gulp-rev-delete-original
 * 
 * Copyright (c) 2025 Alex Grant <info@localnerve.com> (https://www.localnerve.com), LocalNerve LLC
 * Licensed under the MIT license.
 */
import assert from 'assert';
import File from 'vinyl';
import revDel from '../index.js';

describe('gulp-rev-delete-original', () => {

  it('should not remove the original file when it has not been rewritten', done => {
    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    const stream = revDel({ remove: async path => assert(false) });

    stream.on('data', () => {
      done();
    });

    stream.write(file);
  });

  it('should remove the original original file when it has been rewritten', done => {
    let removeWasCalled = false;

    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.abcd.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    const stream = revDel({remove: async path => {
      removeWasCalled = true;
      // Make sure we're removing the ORIGINAL file
      assert.equal(path, file.revOrigPath);
    }});

    stream.on('data', () => {
      // Make sure we removed a file
      assert(removeWasCalled);
      done();
    });

    stream.write(file);
  });

  it('should remove the original file when it has been rewritten and has not been excluded', done => {
    let removeWasCalled = false;

    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.abcd.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    const stream = revDel({
      exclude: () => false,
      remove: async path => {
        removeWasCalled = true;
        // Make sure we're removing the ORIGINAL file
        assert.equal(path, file.revOrigPath);
      }
    });

    stream.on('data', () => {
      // Make sure we removed a file
      assert(removeWasCalled);
      done();
    });

    stream.write(file);
  });

  it('should not remove the original file when it has been rewritten and has been excluded', done => {
    let removeWasCalled = false;

    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.abcd.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    const stream = revDel({
      exclude: () => true,
      remove: async path => {
        removeWasCalled = true;
        // Make sure we're removing the ORIGINAL file
        assert.equal(path, file.revOrigPath);
      }
    });

    stream.on('data', () => {
      // Make sure removed not called
      assert(!removeWasCalled);
      done();
    });

    stream.write(file);
  });

  it('should not remove the original file when it has been rewritten and has been excluded, regex', done => {
    let removeWasCalled = false;

    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.abcd.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    const stream = revDel({
      exclude: /\/dist\/index\.abcd\.js$/,
      remove: async path => {
        removeWasCalled = true;
        // Make sure we're removing the ORIGINAL file
        assert.equal(path, file.revOrigPath);
      }
    });

    stream.on('data', () => {
      // Make sure removed not called
      assert(!removeWasCalled);
      done();
    });

    stream.write(file);
  });

  it('should handle remove error as stream error', done => {
    const msg = 'Houston, we have a problem';
    const file = new File({
      cwd: '/',
      base: '/test/',
      path: '/dist/index.abcd.js',
      contents: Buffer('')
    });

    file.revOrigPath = '/dist/index.js';

    const stream = revDel({
      remove: async path => {
        throw new Error(msg);
      }
    });

    stream.on('error', error => {
      assert.equal(error.message, msg);
      done();
    });

    stream.write(file);
  });

  it('should passthru non revved files', done => {
    let excludeCalled = false;
    const path = '/dist/index.abcd.js';

    const file = new File({
      cwd: '/',
      base: '/test/',
      path,
      contents: Buffer('')
    });

    const stream = revDel({
      exclude: () => !(excludeCalled = true)
    });

    stream.on('data', file => {
      // Make sure exclude not called and its just the file
      assert(!excludeCalled);
      assert.equal(file.path, path);
      done();
    });

    stream.write(file);
  });
});