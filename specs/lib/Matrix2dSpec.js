'use strict';
var Kernel = require('../../lib/Kernel');
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

    it('throws an error if `array` isn\'t long enough', function() {
      expect(function() {
        var matrix = Matrix2d.fromArray(2, 2, [0, 1, 2]);
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

  describe('max', function() {
    it('returns undefined if the matrix has size zero', function() {
      var matrix = new Matrix2d(0, 0);
      expect(matrix.max()).toEqual(undefined);
    });

    it('gets the highest value in the matrix', function() {
      var matrix = Matrix2d.fromArray(2, 2, [0, 3, 2, 1]);
      expect(matrix.max()).toEqual(3);
    });
  });

  describe('min', function() {
    it('returns undefined if the matrix has size zero', function() {
      var matrix = new Matrix2d(0, 0);
      expect(matrix.min()).toEqual(undefined);
    });

    it('gets the lowest value in the matrix', function() {
      var matrix = Matrix2d.fromArray(2, 2, [1, 3, 2, 0]);
      expect(matrix.min()).toEqual(0);
    });
  });

  describe('fill', function() {
    it('fills a matrix with a value', function() {
      var matrix = new Matrix2d(2, 2);
      matrix.fill(1);
      for (var i = 0; i < matrix.length; i++) {
        expect(matrix[i]).toBe(1);
      }
    });
  });

  describe('getIndex', function() {
    it('throws an error if `row` is undefined', function() {
      expect(function() {
        var matrix = new Matrix2d(2, 2);
        matrix.getIndex(undefined, 0);
      }).toThrowError();
    });

    it('throws an error if `column` is undefined', function() {
      expect(function() {
        var matrix = new Matrix2d(2, 2);
        matrix.getIndex(0, undefined);
      }).toThrowError();
    });

    it('throws an error if `row` or `column` are out of bounds', function() {
      var matrix = new Matrix2d(2, 2);
      expect(function() {
        matrix.getIndex(-1, 0);
      }).toThrowError();
      expect(function() {
        matrix.getIndex(0, -1);
      }).toThrowError();
      expect(function() {
        matrix.getIndex(2, 0);
      }).toThrowError();
      expect(function() {
        matrix.getIndex(0, 2);
      }).toThrowError();
    });

    it('gets a flat index into the array by row and column using extend mode', function() {
      var matrix = new Matrix2d(2, 2);
      var options = {edge : 'extend'};
      expect(matrix.getIndex(-1, 0, options)).toEqual(0);
      expect(matrix.getIndex(0, -1, options)).toEqual(0);
      expect(matrix.getIndex(-1, -1, options)).toEqual(0);
      expect(matrix.getIndex(-1, 1, options)).toEqual(1);
      expect(matrix.getIndex(-1, 2, options)).toEqual(1);
      expect(matrix.getIndex(0, 2, options)).toEqual(1);
      expect(matrix.getIndex(1, -1, options)).toEqual(2);
      expect(matrix.getIndex(2, -1, options)).toEqual(2);
      expect(matrix.getIndex(2, 0, options)).toEqual(2);
      expect(matrix.getIndex(1, 2, options)).toEqual(3);
      expect(matrix.getIndex(2, 1, options)).toEqual(3);
      expect(matrix.getIndex(2, 2, options)).toEqual(3);
    });

    it('gets a flat index into the array outside the matrix using wrap mode', function() {
      var matrix = new Matrix2d(2, 2);
      var options = {edge : 'wrap'};
      expect(matrix.getIndex(-1, 0, options)).toEqual(2);
      expect(matrix.getIndex(0, -1, options)).toEqual(1);
      expect(matrix.getIndex(-1, -1, options)).toEqual(3);
      expect(matrix.getIndex(-1, 1, options)).toEqual(3);
      expect(matrix.getIndex(-1, 2, options)).toEqual(2);
      expect(matrix.getIndex(0, 2, options)).toEqual(0);
      expect(matrix.getIndex(1, -1, options)).toEqual(3);
      expect(matrix.getIndex(2, -1, options)).toEqual(1);
      expect(matrix.getIndex(2, 0, options)).toEqual(0);
      expect(matrix.getIndex(1, 2, options)).toEqual(2);
      expect(matrix.getIndex(2, 1, options)).toEqual(1);
      expect(matrix.getIndex(2, 2, options)).toEqual(0);
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
      var options = {edge : 'extend'};
      expect(matrix.get(-1, -1, options)).toEqual(0);
      expect(matrix.get(-1, 0, options)).toEqual(0);
      expect(matrix.get(-1, 1, options)).toEqual(1);
      expect(matrix.get(-1, 2, options)).toEqual(1);
      expect(matrix.get(0, -1, options)).toEqual(0);
      expect(matrix.get(0, 2, options)).toEqual(1);
      expect(matrix.get(1, -1, options)).toEqual(2);
      expect(matrix.get(1, 2, options)).toEqual(3);
      expect(matrix.get(2, -1, options)).toEqual(2);
      expect(matrix.get(2, 0, options)).toEqual(2);
      expect(matrix.get(2, 1, options)).toEqual(3);
      expect(matrix.get(2, 2, options)).toEqual(3);
    });

    it('retrieves elements outside the matrix using wrap mode', function() {
      var matrix = Matrix2d.fromArray(2, 2, [0, 1, 2, 3]);
      var options = {edge : 'wrap'};
      expect(matrix.get(-1, -1, options)).toEqual(3);
      expect(matrix.get(-1, 0, options)).toEqual(2);
      expect(matrix.get(-1, 1, options)).toEqual(3);
      expect(matrix.get(-1, 2, options)).toEqual(2);
      expect(matrix.get(0, -1, options)).toEqual(1);
      expect(matrix.get(0, 2, options)).toEqual(0);
      expect(matrix.get(1, -1, options)).toEqual(3);
      expect(matrix.get(1, 2, options)).toEqual(2);
      expect(matrix.get(2, -1, options)).toEqual(1);
      expect(matrix.get(2, 0, options)).toEqual(0);
      expect(matrix.get(2, 1, options)).toEqual(1);
      expect(matrix.get(2, 2, options)).toEqual(0);
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

    it('convolves a matrix using a kernel', function(done) {
      var matrix = Matrix2d.fromArray(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
      var kernel = Matrix2d.fromArray(3, 3, [1, 1, 1, 1, 1, 1, 1, 1, 1]);
      var expected = Matrix2d.fromArray(3, 3, [12, 18, 24, 30, 36, 42 ,48, 54, 60]);
      matrix.convolve(kernel)
        .then(function(result) {
          expect(result.equals(expected)).toBeTruthy();
          done();
        });
    });

    it('convolves a matrix using a kernel with chunking', function(done) {
      var matrix = Matrix2d.fromArray(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
      var kernel = Matrix2d.fromArray(3, 3, [1, 1, 1, 1, 1, 1, 1, 1, 1]);
      var expected = Matrix2d.fromArray(3, 3, [12, 18, 24, 30, 36, 42 ,48, 54, 60]);
      matrix.convolve(kernel, {
        chunk : {
          iterations : 2,
          duration : 4
        }
      }).then(function(result) {
        expect(result.equals(expected)).toBeTruthy();
        done();
      });
    });
  });

  describe('transpose', function() {
    it('throws an error if `result` dimensions don\'t match', function() {
      var matrix = new Matrix2d(2, 2);
      var result = new Matrix2d(2, 3);
      expect(function() {
        matrix.transpose(result);
      }).toThrowError();
    });

    it('computes the transpose of a matrix', function() {
      var matrix = Matrix2d.fromArray(2, 2, [0, 1, 2, 3]);
      var transpose = Matrix2d.fromArray(2, 2, [0, 2, 1, 3]);
      matrix.transpose(matrix);
      expect(matrix.equals(transpose)).toBeTruthy();
    });

    it('computes the tranpose of an asymmetric matrix', function() {
      var matrix = Matrix2d.fromArray(2, 3, [0, 1, 2, 3, 4, 5]);
      var result = new Matrix2d(3, 2);
      var transpose = Matrix2d.fromArray(3, 2, [0, 3, 1, 4, 2, 5]);
      matrix.transpose(result);
      expect(result.equals(transpose)).toBeTruthy();
    });
  });
});
