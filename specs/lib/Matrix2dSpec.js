'use strict';
var Matrix2d = require('../../lib/Matrix2d');

describe('Matrix2d', function() {
  describe('constructor', function() {
    it('throws an error if `rows` is undefined', function() {
      expect(function() {
        var matrix = new Matrix2d(undefined, 2);
      }).toThrowError();
    });

    it('throws an error if `columns` is undefined', function() {
      expect(function() {
        var matrix = new Matrix2d(2, undefined);
      }).toThrowError();
    });

    it('creates a matrix of a given size filled with zeros', function() {
      var matrix = new Matrix2d(3, 5);
      expect(matrix.rows).toEqual(3);
      expect(matrix.columns).toEqual(5);
      expect(matrix.length).toEqual(15);
      for (var i = 0; i < matrix.length; i++) {
        expect(matrix[i]).toEqual(0);
      }
    });
  });

  describe('fromArray', function() {
    it('throws an error if `rows` is undefined', function() {
      expect(function() {
        var matrix = Matrix2d.fromArray(undefined, 2, [0, 1, 2, 3]);
      }).toThrowError();
    });

    it('throws an error if `columns` is undefined', function() {
      expect(function() {
        var matrix = Matrix2d.fromArray(2, undefined, [0, 1, 2, 3]);
      }).toThrowError();
    });

    it('creates a matrix from an array', function() {
      var matrix = Matrix2d.fromArray(2, 3, [0, 1, 2, 3, 4, 5]);
      expect(matrix.rows).toEqual(2);
      expect(matrix.columns).toEqual(3);
      for (var i = 0; i < matrix.length; i++) {
        expect(matrix[i]).toEqual(i);
      }
    });
  });

  describe('clone', function() {
    it('produces a copy of the matrix in new memory', function() {
      var matrix = Matrix2d.fromArray(2, 2, [0, 1, 2, 3]);
      var clone = matrix.clone();
      expect(clone.rows).toEqual(matrix.rows);
      expect(clone.columns).toEqual(matrix.columns);
      expect(clone.length).toEqual(matrix.length);
      expect(matrix.equals(clone)).toBeTruthy();

      matrix[0] = 5;
      expect(clone[0]).not.toEqual(5);
    });
  });

  describe('get', function() {
    it('retrieves elements from a matrix by row/column', function() {
      var matrix = Matrix2d.fromArray(2, 3, [0, 1, 2, 3, 4, 5]);
      expect(matrix.get(0, 0)).toEqual(0);
      expect(matrix.get(0, 1)).toEqual(1);
      expect(matrix.get(0, 2)).toEqual(2);
      expect(matrix.get(1, 0)).toEqual(3);
      expect(matrix.get(1, 1)).toEqual(4);
      expect(matrix.get(1, 2)).toEqual(5);
    });

    it('retrieves elements outside the matrix using extend mode', function() {
      var matrix = Matrix2d.fromArray(2, 2, [0, 1, 2, 3]);
      expect(matrix.get(-1, -1, {edge : 'extend'})).toEqual(0);
      expect(matrix.get(-1, 0, {edge : 'extend'})).toEqual(0);
      expect(matrix.get(-1, 1, {edge : 'extend'})).toEqual(1);
      expect(matrix.get(-1, 2, {edge : 'extend'})).toEqual(1);
      expect(matrix.get(0, -1, {edge : 'extend'})).toEqual(0);
      expect(matrix.get(0, 2, {edge : 'extend'})).toEqual(1);
      expect(matrix.get(1, -1, {edge : 'extend'})).toEqual(2);
      expect(matrix.get(1, 2, {edge : 'extend'})).toEqual(3);
      expect(matrix.get(2, -1, {edge : 'extend'})).toEqual(2);
      expect(matrix.get(2, 0, {edge : 'extend'})).toEqual(2);
      expect(matrix.get(2, 1, {edge : 'extend'})).toEqual(3);
      expect(matrix.get(2, 2, {edge : 'extend'})).toEqual(3);
    });

    it('retrieves elements outside the matrix using wrap', function() {
      var matrix = Matrix2d.fromArray(2, 2, [0, 1, 2, 3]);
      expect(matrix.get(-1, -1, {edge : 'wrap'})).toEqual(3);
      expect(matrix.get(-1, 0, {edge : 'wrap'})).toEqual(2);
      expect(matrix.get(-1, 1, {edge : 'wrap'})).toEqual(3);
      expect(matrix.get(-1, 2, {edge : 'wrap'})).toEqual(2);
      expect(matrix.get(0, -1, {edge : 'wrap'})).toEqual(1);
      expect(matrix.get(0, 2, {edge : 'wrap'})).toEqual(0);
      expect(matrix.get(1, -1, {edge : 'wrap'})).toEqual(3);
      expect(matrix.get(1, 2, {edge : 'wrap'})).toEqual(2);
      expect(matrix.get(2, -1, {edge : 'wrap'})).toEqual(1);
      expect(matrix.get(2, 0, {edge : 'wrap'})).toEqual(0);
      expect(matrix.get(2, 1, {edge : 'wrap'})).toEqual(1);
      expect(matrix.get(2, 2, {edge : 'wrap'})).toEqual(0);
    });
  });

  describe('set', function() {
    it('sets an element in a matrix by row/column and returns the old value', function() {
      var matrix = Matrix2d.fromArray(2, 3, [0, 1, 2, 3, 4, 5]);
      var old = matrix.set(0, 2, 10);
      expect(old).toEqual(2);
      expect(matrix.get(0, 2)).toEqual(10);
    });
  });

  describe('add', function() {
    it('throws an error if `matrix` is undefined', function() {
      var matrix = new Matrix2d(2, 2);
      expect(function() {
        matrix.add();
      }).toThrowError();
    });

    it('throws an error if matrix dimensions do not match', function() {
      var matrixOne = new Matrix2d(2, 2);
      var matrixTwo = new Matrix2d(3, 3);
      expect(function() {
        matrixOne.add(matrixTwo);
      }).toThrowError();
    });

    it('throws an error if the result matrix dimensions do not match', function() {
      var matrix = new Matrix2d(2, 2);
      var result = new Matrix2d(3, 3);
      expect(function() {
        matrix.add(matrix, result);
      }).toThrowError();
    });

    it('computes the sum of two matrices', function() {
      var matrixOne = Matrix2d.fromArray(2, 2, [0, 1, 2, 3]);
      var matrixTwo = matrixOne.clone();
      var matrixSum = matrixOne.add(matrixTwo);
      expect(matrixSum.rows).toEqual(matrixOne.rows);
      expect(matrixSum.columns).toEqual(matrixOne.columns);
      expect(matrixSum.length).toEqual(matrixOne.length);
      for (var i = 0; i < matrixSum.length; i++) {
        expect(matrixSum[i]).toEqual(2 * i);
      }
    });

    it('computes the sum of two matrices in place', function() {
      var matrixOne = Matrix2d.fromArray(2, 2, [0, 1, 2, 3]);
      var matrixTwo = matrixOne.clone();
      matrixOne.add(matrixTwo, matrixOne);
      for (var i = 0; i < matrixOne.length; i++) {
        expect(matrixOne[i]).toEqual(2 * i);
      }
    });
  });

  describe('convolve', function() {
    it('throws an error if `kernel` is not defined', function() {
      var matrix = new Matrix2d(2, 2);
      expect(function() {
        matrix.convolve();
      }).toThrowError();
    });

    it('convolves a matrix using a kernel', function() {
      var matrix = Matrix2d.fromArray(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
      var kernel = Matrix2d.fromArray(3, 3, [1, 1, 1, 1, 1, 1, 1, 1, 1]);
      var result = matrix.convolve(kernel);
      expect(result.get(0, 0)).toEqual(12);
      expect(result.get(0, 1)).toEqual(18);
      expect(result.get(0, 2)).toEqual(24);
      expect(result.get(1, 0)).toEqual(30);
      expect(result.get(1, 1)).toEqual(36);
      expect(result.get(1, 2)).toEqual(42);
      expect(result.get(2, 0)).toEqual(48);
      expect(result.get(2, 1)).toEqual(54);
      expect(result.get(2, 2)).toEqual(60);
    });
  });
});