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
      var compareRed = Matrix2d.fromArray(1, 4, [0, 255, 0, 0]);
      expect(red.equals(compareRed)).toBeTruthy();

      var green = image.channels[1];
      var compareGreen = Matrix2d.fromArray(1, 4, [0, 0, 255, 0]);
      expect(green.equals(compareGreen)).toBeTruthy();

      var blue = image.channels[2];
      var compareBlue = Matrix2d.fromArray(1, 4, [0, 0, 0, 255]);
      expect(blue.equals(compareBlue)).toBeTruthy();

      var alpha = image.channels[3];
      var compareAlpha = Matrix2d.fromArray(1, 4, [255, 255, 255, 255]);
      expect(alpha.equals(compareAlpha)).toBeTruthy();
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

  describe('convolve', function() {
    it('convolves an image using a kernel with chunking', function(done) {
      var image = new Image(3, 3, {
        colorspace : Colorspace.RGB
      });
      var matrix = Matrix2d.fromArray(3, 3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
      image.channels[0] = matrix;
      image.channels[1] = matrix.clone();
      image.channels[2] = matrix.clone();
      var kernel = Matrix2d.fromArray(3, 3, [1, 1, 1, 1, 1, 1, 1, 1, 1]);
      var expected = Matrix2d.fromArray(3, 3, [12, 18, 24, 30, 36, 42 ,48, 54, 60]);
      image.convolve(kernel, {
        chunk : {
          iterations : 2,
          duration : 4
        }
      }).then(function(result) {
        expect(result.channels[0].equals(expected)).toBeTruthy();
        expect(result.channels[1].equals(expected)).toBeTruthy();
        expect(result.channels[2].equals(expected)).toBeTruthy();
        done();
      });
    });
  });
});
