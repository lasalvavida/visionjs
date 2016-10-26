'use strict';
var Matrix2d = require('../../lib/Matrix2d');
var otsu = require('../../lib/otsu');

describe('otsu', function() {
  it('computes an automatic threshold from histogram data', function() {
    var matrix = new Matrix2d(3, 3, [0, 1, 2, 3, 4, 3, 2, 0, 0]);
    var histogram = matrix.histogram(5);
    var threshold = otsu(histogram, matrix.length);
    expect(threshold).toEqual(1);
  });
});
