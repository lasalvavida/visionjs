'use strict';
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
});
