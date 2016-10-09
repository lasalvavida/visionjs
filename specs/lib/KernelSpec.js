'use strict';
var Kernel = require('../../lib/Kernel');
var Matrix2d = require('../../lib/Matrix2d');

describe('Kernel', function() {
  describe('identity', function() {
    it('produces an identity kernel of the designated size', function() {
      var identity2x2 = Kernel.identity(2, 2);
      var compare = Matrix2d.fromArray(2, 2, [0, 0, 0, 1]);
      expect(identity2x2.equals(compare)).toBe(true)();

      var identity3x3 = Kernel.identity(3, 3);
      compare = Matrix2d.fromArray(3, 3, [0, 0, 0, 0, 1, 0, 0, 0, 0]);
      expect(identity3x3.equals(compare)).toBe(true)();
    });
  });

  describe('average', function() {
    it('produces a scaled kernel of all ones', function() {
      var average2x3 = Kernel.average(2, 3);
      average2x3.scale(6, average2x3);
      average2x3.apply(Math.round, average2x3);
      for (var i = 0; i < average2x3.length; i++) {
        expect(average2x3[i]).toEqual(1);
      }
    });
  });

  describe('gaussian', function() {
    it('produces the discrete gaussian 3x3 by default', function() {
      var gaussian3x3 = Kernel.gaussian(3, 3);
      gaussian3x3.scale(16, gaussian3x3);
      gaussian3x3.apply(Math.round, gaussian3x3);
      var compare = Matrix2d.fromArray(3, 3, [1, 2, 1, 2, 4, 2, 1, 2, 1]);
      expect(gaussian3x3.equals(compare)).toBe(true)();
    });
  });

  describe('sobelX', function() {
    it('produces a 3x3 sobel filter with a gradient in the x-direction', function() {
      var sobelX = Kernel.sobelX(3, 3);
      var compare = Matrix2d.fromArray(3, 3, [
        1, 0, -1,
        2, 0, -2,
        1, 0, -1
      ]);
      expect(sobelX.equals(compare)).toBe(true)();
    });

    it('produces a 5x5 sobel filter with a gradient in the x-direction', function() {
      var sobelX = Kernel.sobelX(5, 5);
      var compare = Matrix2d.fromArray(5, 5, [
        2, 1, 0, -1, -2,
        3, 2, 0, -2, -3,
        4, 3, 0, -3, -4,
        3, 2, 0, -2, -3,
        2, 1, 0, -1, -2
      ]);
      expect(sobelX.equals(compare)).toBe(true)();
    });
  });

  describe('sobelY', function() {
    it('produces a 3x3 sobel filter with a gradient in the y-direction', function() {
      var sobelY = Kernel.sobelY(3, 3);
      var compare = Matrix2d.fromArray(3, 3, [
        1, 2, 1,
        0, 0, 0,
        -1, -2, -1
      ]);
      expect(sobelY.equals(compare)).toBe(true)();
    });

    it('produces a 5x5 sobel filter with a gradient in the y-direction', function() {
      var sobelY = Kernel.sobelY(5, 5);
      var compare = Matrix2d.fromArray(5, 5, [
        2, 3, 4, 3, 2,
        1, 2, 3, 2, 1,
        0, 0, 0, 0, 0,
        -1, -2, -3, -2, -1,
        -2, -3, -4, -3, -2
      ]);
      expect(sobelY.equals(compare)).toBe(true)();
    });
  });

  describe('laplacian', function() {
    it('produces a discrete 3x3 laplacian filter', function() {
      var laplacian3x3 = Kernel.laplacian(3, 3);
      var compare = Matrix2d.fromArray(3, 3, [
        1, 1, 1,
        1, -8, 1,
        1, 1, 1
      ]);
      expect(laplacian3x3.equals(compare)).toBe(true)();
    });

    it('produces a discrete 5x5 laplacian filter', function() {
      var laplacian5x5 = Kernel.laplacian(5, 5);
      var compare = Matrix2d.fromArray(5, 5, [
        1, 1, 1, 1, 1,
        1, 1, 1, 1, 1,
        1, 1, -24, 1, 1,
        1, 1, 1, 1, 1,
        1, 1, 1, 1, 1
      ]);
      expect(laplacian5x5.equals(compare)).toBe(true)();
    });
  });

  describe('laplacianOfGaussian', function() {
    it('produces a discrete 5x5 laplacian filter', function() {
      var laplacianOfGaussian5x5 = Kernel.laplacianOfGaussian(5, 5);
      laplacianOfGaussian5x5.apply(Math.round, laplacianOfGaussian5x5);
      var compare = Matrix2d.fromArray(5, 5, [
        0, -1, -1, -1, 0,
        -1, -1, 2, -1, -1,
        -1, 2, 10, 2, -1,
        -1, -1, 2, -1, -1,
        0, -1, -1, -1, 0
      ]);
      expect(laplacianOfGaussian5x5.equals(compare)).toBe(true)();
    });
  });

  describe('combine', function() {
    it('combines two kernels through convolution', function(done) {
      var average = Kernel.average(3, 3);
      average.scale(9, average);
      average.apply(Math.round, average);
      var secondPass = average.clone();
      var expected = Matrix2d.fromArray(5, 5, [
        1, 2, 3, 2, 1,
        2, 4, 6, 4, 2,
        3, 6, 9, 6, 3,
        2, 4, 6, 4, 2,
        1, 2, 3, 2, 1
      ]);
      Kernel.combine(average, secondPass)
        .then(function(result) {
          expect(result.equals(expected)).toBe(true)();
          done();
        })
    });
  });

  describe('fromName', function() {
    it('calls kernel generation functions by name', function() {
      spyOn(Kernel, 'identity');
      var identityKernel = Kernel.fromName('identity', 3, 3);
      expect(Kernel.identity).toHaveBeenCalled();

      spyOn(Kernel, 'average');
      var averageKernel = Kernel.fromName('average', 3, 3);
      expect(Kernel.average).toHaveBeenCalled();

      spyOn(Kernel, 'gaussian');
      var gaussianKernel = Kernel.fromName('gaussian', 3, 3);
      expect(Kernel.gaussian).toHaveBeenCalled();
    });
  });
});
