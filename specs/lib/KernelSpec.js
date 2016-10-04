'use strict';
var Kernel = require('../../lib/Kernel');
var Matrix2d = require('../../lib/Matrix2d');

describe('Kernel', function() {
  describe('identity', function() {
    it('produces an identity kernel of the designated size', function() {
      var identity2x2 = Kernel.identity(2, 2);
      var compare = Matrix2d.fromArray(2, 2, [0, 0, 0, 1]);
      expect(identity2x2.equals(compare)).toBeTruthy();

      var identity3x3 = Kernel.identity(3, 3);
      compare = Matrix2d.fromArray(3, 3, [0, 0, 0, 0, 1, 0, 0, 0, 0]);
      expect(identity3x3.equals(compare)).toBeTruthy();
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
      expect(gaussian3x3.equals(compare)).toBeTruthy();
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
