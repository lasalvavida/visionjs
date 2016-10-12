'use strict';
var Matrix2d = require('../../lib/Matrix2d');
var SURF = require('../../lib/SURF');

describe('SURF', function() {
  describe('filterSize', function() {
    it('produces the correct filter size for given octaves and levels', function() {
      expect(SURF.filterSize(0,0)).toEqual(9);
      expect(SURF.filterSize(0,1)).toEqual(15);
      expect(SURF.filterSize(0,2)).toEqual(21);
      expect(SURF.filterSize(0,3)).toEqual(27);

      expect(SURF.filterSize(1,0)).toEqual(15);
      expect(SURF.filterSize(1,1)).toEqual(27);
      expect(SURF.filterSize(1,2)).toEqual(39);
      expect(SURF.filterSize(1,3)).toEqual(51);

      expect(SURF.filterSize(2,0)).toEqual(27);
      expect(SURF.filterSize(2,1)).toEqual(51);
      expect(SURF.filterSize(2,2)).toEqual(75);
      expect(SURF.filterSize(2,3)).toEqual(99);
    });
  });

  describe('discreteLoGYY', function() {
    it('produces a 9x9 discrete Laplacian of Gaussian Y kernel', function() {
      var kernel = SURF.discreteLoGYY(9);
      var expected = new Matrix2d(9, 9, [
        0, 0,  1,  1,  1,  1,  1, 0, 0,
        0, 0,  1,  1,  1,  1,  1, 0, 0,
        0, 0,  1,  1,  1,  1,  1, 0, 0,
        0, 0, -2, -2, -2, -2, -2, 0, 0,
        0, 0, -2, -2, -2, -2, -2, 0, 0,
        0, 0, -2, -2, -2, -2, -2, 0, 0,
        0, 0,  1,  1,  1,  1,  1, 0, 0,
        0, 0,  1,  1,  1,  1,  1, 0, 0,
        0, 0,  1,  1,  1,  1,  1, 0, 0
      ]);
      expect(kernel).toEqual(expected);
    });

    it('produces a 15x15 discrete Laplacian of Gaussian Y kernel', function() {
      var kernel = SURF.discreteLoGYY(15);
      var expected = new Matrix2d(15, 15, [
        0, 0, 0,  1,  1,  1,  1,  1,  1,  1,  1,  1, 0, 0, 0,
        0, 0, 0,  1,  1,  1,  1,  1,  1,  1,  1,  1, 0, 0, 0,
        0, 0, 0,  1,  1,  1,  1,  1,  1,  1,  1,  1, 0, 0, 0,
        0, 0, 0,  1,  1,  1,  1,  1,  1,  1,  1,  1, 0, 0, 0,
        0, 0, 0,  1,  1,  1,  1,  1,  1,  1,  1,  1, 0, 0, 0,
        0, 0, 0, -2, -2, -2, -2, -2, -2, -2, -2, -2, 0, 0, 0,
        0, 0, 0, -2, -2, -2, -2, -2, -2, -2, -2, -2, 0, 0, 0,
        0, 0, 0, -2, -2, -2, -2, -2, -2, -2, -2, -2, 0, 0, 0,
        0, 0, 0, -2, -2, -2, -2, -2, -2, -2, -2, -2, 0, 0, 0,
        0, 0, 0, -2, -2, -2, -2, -2, -2, -2, -2, -2, 0, 0, 0,
        0, 0, 0,  1,  1,  1,  1,  1,  1,  1,  1,  1, 0, 0, 0,
        0, 0, 0,  1,  1,  1,  1,  1,  1,  1,  1,  1, 0, 0, 0,
        0, 0, 0,  1,  1,  1,  1,  1,  1,  1,  1,  1, 0, 0, 0,
        0, 0, 0,  1,  1,  1,  1,  1,  1,  1,  1,  1, 0, 0, 0,
        0, 0, 0,  1,  1,  1,  1,  1,  1,  1,  1,  1, 0, 0, 0
      ]);
      expect(kernel).toEqual(expected);
    });
  });

  describe('discreteLoGXX', function() {
    it('produces a 9x9 discrete Laplacian of Gaussian X kernel', function() {
      var kernel = SURF.discreteLoGXX(9);
      var expected = SURF.discreteLoGYY(9);
      expected.transpose(expected);
      expect(kernel).toEqual(expected);
    });

    it('produces a 15x15 discrete Laplacian of Gaussian X kernel', function() {
      var kernel = SURF.discreteLoGXX(15);
      var expected = SURF.discreteLoGYY(15);
      expected.transpose(expected);
      expect(kernel).toEqual(expected);
    });
  });

  describe('discreteLoGXY', function() {
    it('produces a 9x9 discrete Laplacian of Gaussian XY Kernel', function() {
      var kernel = SURF.discreteLoGXY(9);
      var expected = new Matrix2d(9, 9, [
        0,  0,  0,  0, 0,  0,  0,  0, 0,
        0,  1,  1,  1, 0, -1, -1, -1, 0,
        0,  1,  1,  1, 0, -1, -1, -1, 0,
        0,  1,  1,  1, 0, -1, -1, -1, 0,
        0,  0,  0,  0, 0,  0,  0,  0, 0,
        0, -1, -1, -1, 0,  1,  1,  1, 0,
        0, -1, -1, -1, 0,  1,  1,  1, 0,
        0, -1, -1, -1, 0,  1,  1,  1, 0,
        0,  0,  0,  0, 0,  0,  0,  0, 0
      ]);
      expect(kernel).toEqual(expected);
    });

    it('produces a 15x15 discrete Laplacian of Gaussian XY Kernel', function() {
      var kernel = SURF.discreteLoGXY(15);
      var expected = new Matrix2d(15, 15, [
        0, 0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0, 0, 0,
        0, 0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0, 0, 0,
        0, 0,  1,  1,  1,  1,  1, 0, -1, -1, -1, -1, -1, 0, 0,
        0, 0,  1,  1,  1,  1,  1, 0, -1, -1, -1, -1, -1, 0, 0,
        0, 0,  1,  1,  1,  1,  1, 0, -1, -1, -1, -1, -1, 0, 0,
        0, 0,  1,  1,  1,  1,  1, 0, -1, -1, -1, -1, -1, 0, 0,
        0, 0,  1,  1,  1,  1,  1, 0, -1, -1, -1, -1, -1, 0, 0,
        0, 0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0, 0, 0,
        0, 0, -1, -1, -1, -1, -1, 0,  1,  1,  1,  1,  1, 0, 0,
        0, 0, -1, -1, -1, -1, -1, 0,  1,  1,  1,  1,  1, 0, 0,
        0, 0, -1, -1, -1, -1, -1, 0,  1,  1,  1,  1,  1, 0, 0,
        0, 0, -1, -1, -1, -1, -1, 0,  1,  1,  1,  1,  1, 0, 0,
        0, 0, -1, -1, -1, -1, -1, 0,  1,  1,  1,  1,  1, 0, 0,
        0, 0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0, 0, 0,
        0, 0,  0,  0,  0,  0,  0, 0,  0,  0,  0,  0,  0, 0, 0
      ]);
      expect(kernel).toEqual(expected);
    });
  });

  describe('fastLoGYY', function() {
    it('computes the same result as kernel convolution', function() {
      var matrix = new Matrix2d(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
      var kernel = SURF.discreteLoGYY(9);
      var expected = matrix.convolve(kernel, {
        edge : 'zero'
      });
      var integral = matrix.integral();
      var result = SURF.fastLoGYY(integral, 9);
      expect(result).toEqual(expected);
    });
  });

  describe('fastLoGXX', function() {
    it('computes the same result as kernel convolution', function() {
      var matrix = new Matrix2d(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
      var kernel = SURF.discreteLoGXX(9);
      var expected = matrix.convolve(kernel, {
        edge : 'zero'
      });
      var integral = matrix.integral();
      var result = SURF.fastLoGXX(integral, 9);
      expect(result).toEqual(expected);
    });
  });

  describe('fastLoGXY', function() {
    it('computes the same result as kernel convolution', function() {
      var matrix = new Matrix2d(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
      var kernel = SURF.discreteLoGXY(9);
      var expected = matrix.convolve(kernel, {
        edge : 'zero'
      });
      var integral = matrix.integral();
      var result = SURF.fastLoGXY(integral, 9);
      expect(result).toEqual(expected);
    });
  });

  describe('hessianDeterminant', function() {
    it('computes the hessian determinant of the matrix', function() {
      var matrix = new Matrix2d(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
      var integral = matrix.integral();
      var loGXX = SURF.fastLoGXX(integral, 15);
      var loGXY = SURF.fastLoGXY(integral, 15);
      var loGYY = SURF.fastLoGYY(integral, 15);
      var expected = new Matrix2d(matrix.rows, matrix.columns);
      for (var row = 0; row < expected.rows; row++) {
        for (var column = 0; column < expected.columns; column++) {
          var xx = loGXX.get(row, column);
          var xy = loGXY.get(row, column);
          var yy = loGYY.get(row, column);
          expected.set(row, column, xx * yy - xy * xy);
        }
      }
      var result = SURF.hessianDeterminant(integral, 0, 1);
      expect(result).toEqual(expected);
    });

    it('computes the hessian determinant of the matrix with chunking', function(done) {
      var matrix = new Matrix2d(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
      var integral = matrix.integral();
      var loGXX = SURF.fastLoGXX(integral, 15);
      var loGXY = SURF.fastLoGXY(integral, 15);
      var loGYY = SURF.fastLoGYY(integral, 15);
      var expected = new Matrix2d(matrix.rows, matrix.columns);
      for (var row = 0; row < expected.rows; row++) {
        for (var column = 0; column < expected.columns; column++) {
          var xx = loGXX.get(row, column);
          var xy = loGXY.get(row, column);
          var yy = loGYY.get(row, column);
          expected.set(row, column, xx * yy - xy * xy);
        }
      }
      SURF.hessianDeterminantAsync(integral, 0, 1, {
        chunk : true,
        iterations : 3,
        duration : 2
      }).then(function(result) {
        expect(result).toEqual(expected);
        done();
      });
    });
  });
});
