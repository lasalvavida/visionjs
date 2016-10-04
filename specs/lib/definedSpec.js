'use strict';
var defined = require('../../lib/defined');

describe('defined', function() {
  it('returns false if `input` is undefined', function() {
    expect(defined(undefined)).toEqual(false);
  });

  it('returns false if `input` is null', function() {
    expect(defined(null)).toEqual(false);
  });

  it('returns true if `input` is anything else', function() {
    expect(defined('')).toEqual(true);
    expect(defined(0)).toEqual(true);
    expect(defined(false)).toEqual(true);
  })
});
