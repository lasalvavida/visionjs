'use strict';
var Colorspace = require('../../lib/Colorspace');
var Image = require('../../lib/Image');
var Matrix2d = require('../../lib/Matrix2d');

describe('Image', function() {
  describe('fromRawData', function() {
    it('reads RGBA raw data by default', function() {
      var data = [
        0, 0, 0, 255,
        255, 0, 0, 255,
        0, 255, 0, 255,
        0, 0, 255, 255
      ];
      var image = Image.fromRawData(4, 1, data);
      expect(image.channels.length).toEqual(4);
      expect(image.width).toEqual(4);
      expect(image.height).toEqual(1);
      expect(image.length).toEqual(4);

      var red = image.channels[0];
      var compareRed = new Matrix2d(1, 4, [0, 255, 0, 0]);
      expect(red).toEqual(compareRed);

      var green = image.channels[1];
      var compareGreen = new Matrix2d(1, 4, [0, 0, 255, 0]);
      expect(green).toEqual(compareGreen);

      var blue = image.channels[2];
      var compareBlue = new Matrix2d(1, 4, [0, 0, 0, 255]);
      expect(blue).toEqual(compareBlue);

      var alpha = image.channels[3];
      var compareAlpha = new Matrix2d(1, 4, [255, 255, 255, 255]);
      expect(alpha).toEqual(compareAlpha);
    });
  });

  describe('writeRawData', function() {
    it('writes RGBA raw data out from matrix data', function() {
      var data = [
        0, 0, 0, 255,
        255, 0, 0, 255,
        0, 255, 0, 255,
        0, 0, 255, 255
      ];
      var image = Image.fromRawData(4, 1, data);
      var writeData = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ];
      image.writeRawData(writeData);
      expect(writeData).toEqual(data);
    });
  });

  describe('apply', function() {
    it('computes the integral image using apply', function() {
      var image = new Image(3, 3, {
        colorspace : Colorspace.RGBA
      });
      var matrix = new Matrix2d(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
      image.channels[0] = matrix;
      image.channels[1] = matrix.clone();
      image.channels[2] = matrix.clone();
      image.channels[3] = matrix.clone();
      var expected = new Matrix2d(3, 3, [0, 1, 3, 3, 8, 15, 9, 21, 36]);
      var result = image.apply('integral');
      expect(result.channels[0]).toEqual(expected);
      expect(result.channels[1]).toEqual(expected);
      expect(result.channels[2]).toEqual(expected);
      expect(result.channels[3]).toEqual(matrix);
    });
  });

  describe('convolve', function() {
    it('convolves an RGBA image', function() {
      var image = new Image(3, 3, {
        colorspace : Colorspace.RGBA
      });
      var matrix = new Matrix2d(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
      image.channels[0] = matrix;
      image.channels[1] = matrix.clone();
      image.channels[2] = matrix.clone();
      image.channels[3] = matrix.clone();
      var kernel = new Matrix2d(3, 3, [1, 1, 1, 1, 1, 1, 1, 1, 1]);
      var expected = new Matrix2d(3, 3, [12, 18, 24, 30, 36, 42 ,48, 54, 60]);
      var result = image.convolve(kernel);
      expect(result.channels[0]).toEqual(expected);
      expect(result.channels[1]).toEqual(expected);
      expect(result.channels[2]).toEqual(expected);
      expect(result.channels[3]).toEqual(matrix);
    });
  });
  describe('convolveAsync', function() {
    it('convolves an image using a kernel with chunking', function(done) {
      var image = new Image(3, 3, {
        colorspace : Colorspace.RGB
      });
      var matrix = new Matrix2d(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
      image.channels[0] = matrix;
      image.channels[1] = matrix.clone();
      image.channels[2] = matrix.clone();
      var kernel = new Matrix2d(3, 3, [1, 1, 1, 1, 1, 1, 1, 1, 1]);
      var expected = new Matrix2d(3, 3, [12, 18, 24, 30, 36, 42 ,48, 54, 60]);
      image.convolveAsync(kernel, {
        chunk : {
          iterations : 2,
          duration : 4
        }
      }).then(function(result) {
        expect(result.channels[0]).toEqual(expected);
        expect(result.channels[1]).toEqual(expected);
        expect(result.channels[2]).toEqual(expected);
        done();
      });
    });
  });
});
