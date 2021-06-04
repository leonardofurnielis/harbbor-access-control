'use strict';

const unless = require('../../lib/unless');

const next = () => {};
const testMiddleware = (req) => {
  req.called = true;
};

testMiddleware.unless = unless;

describe('PATH and method exception', () => {
  const authorize = testMiddleware.unless({
    paths: [
      {
        path: '/test',
        methods: ['POST', 'GET'],
      },
      {
        path: '/bar',
        methods: 'PUT',
      },
      '/foo',
    ],
  });

  test('When PATH and method match, should not call the middleware', () => {
    let req = {
      originalUrl: '/test',
      method: 'POST',
    };

    authorize(req, {}, next);
    expect(req.called).toBeUndefined();

    req = {
      originalUrl: '/test',
      method: 'GET',
    };

    authorize(req, {}, next);
    expect(req.called).toBeUndefined();

    req = {
      originalUrl: '/bar',
      method: 'PUT',
    };

    authorize(req, {}, next);
    expect(req.called).toBeUndefined();

    req = {
      originalUrl: '/foo',
      method: 'PUT',
    };

    authorize(req, {}, next);
    expect(req.called).toBeUndefined();
  });

  test('When PATH and method doesnt match, should call the middleware', () => {
    let req = {
      originalUrl: '/test?test=123',
      method: 'PUT',
    };

    authorize(req, {}, next);
    expect(req.called).toBeTruthy();

    req = {
      originalUrl: '/bar?test=123',
      method: 'GET',
    };

    authorize(req, {}, next);
    expect(req.called).toBeTruthy();

    req = {
      originalUrl: '/unless?test=123',
      method: 'PUT',
    };

    authorize(req, {}, next);
    expect(req.called).toBeTruthy();
  });
});

describe('PATH exception', () => {
  const authorize = testMiddleware.unless({
    paths: ['/test', '/foo'],
  });

  test('When PATH match, should not call the middleware', () => {
    let req = {
      originalUrl: '/test',
    };

    authorize(req, {}, next);

    expect(req.called).toBeUndefined();

    req = {
      originalUrl: '/foo',
    };

    authorize(req, {}, next);

    expect(req.called).toBeUndefined();
  });

  test('When PATH doesnt match, should call the middleware', () => {
    const req = {
      originalUrl: '/foobar/test=123',
    };

    authorize(req, {}, next);

    expect(req.called).toBeTruthy();
  });
});

describe('PATH (useOriginalUrl) exception', () => {
  const authorize = testMiddleware.unless({
    paths: ['/test', '/foo'],
    useOriginalUrl: false,
  });

  test('When PATH match req.url instead of req.originalUrl, should not call the middleware', () => {
    let req = {
      originalUrl: '/orig/test',
      url: '/test',
    };

    authorize(req, {}, next);

    expect(req.called).toBeUndefined();

    req = {
      originalUrl: '/orig/foo',
      url: '/foo',
    };

    authorize(req, {}, next);

    expect(req.called).toBeUndefined();
  });

  test('When PATH doesnt match req.url even if path matches req.originalUrl, should call the middleware', () => {
    const req = {
      originalUrl: '/test/test',
      url: '/foobar/test',
    };

    authorize(req, {}, next);

    expect(req.called).toBeTruthy();
  });
});

describe('METHOD exception', () => {
  const authorize = testMiddleware.unless({
    methods: ['OPTIONS', 'DELETE'],
  });

  test('When method match, should not call the middleware', () => {
    const req = {
      originalUrl: '/foo',
      method: 'OPTIONS',
    };

    authorize(req, {}, next);

    expect(req.called).toBeUndefined();
  });

  test('When method doesnt match, should call the middleware', () => {
    const req = {
      originalUrl: '/foobar/test',
      method: 'PUT',
    };

    authorize(req, {}, next);

    expect(req.called).toBeTruthy();
  });
});

describe('Without originalUrl', () => {
  const authorize = testMiddleware.unless({
    paths: ['/test'],
  });

  test('When PATH match, should not call the middleware', () => {
    const req = {
      url: '/test',
    };

    authorize(req, {}, next);

    expect(req.called).toBeUndefined();
  });

  test('When PATH doesnt match, should call the middleware', () => {
    const req = {
      url: '/foobar/test',
    };

    authorize(req, {}, next);

    expect(req.called).toBeTruthy();
  });
});

describe('Chaining', () => {
  const authorize = testMiddleware.unless({ paths: '/test' }).unless({ methods: 'GET' });

  test('When first unless match, should not call the middleware', () => {
    const req = {
      url: '/test',
    };

    authorize(req, {}, next);

    expect(req.called).toBeUndefined();
  });

  test('When second unless match, should not call the middleware', () => {
    const req = {
      url: '/foo',
      method: 'GET',
    };

    authorize(req, {}, next);

    expect(req.called).toBeUndefined();
  });

  test('When none of conditions met, should call the middleware', () => {
    const req = {
      url: '/foobar/test',
    };

    authorize(req, {}, next);

    expect(req.called).toBeTruthy();
  });
});
