'use strict';
var defaults = require('defaults');

var Matrix2d = require('./Matrix2d');
var defined = require('./defined');

var Kernel = {};

module.exports = Kernel;

Kernel.identity = function(rows, columns) {
  var kernel = new Matrix2d(rows, columns);
  var centerRow = Math.floor(kernel.rows / 2);
  var centerColumn = Math.floor(kernel.columns / 2);
  kernel.set(centerRow, centerColumn, 1);
  return kernel;
};

Kernel.average = function(rows, columns) {
  var kernel = new Matrix2d(rows, columns);
  kernel.fill(1 / kernel.length);
  return kernel;
};

Kernel.gaussian = function(rows, columns, options) {
  options = defaults(options, {
    sigma : 0.85
  });
  var sigma = options.sigma;
  var kernel = new Matrix2d(rows, columns);
  var w = Math.floor(rows / 2);
  var h = Math.floor(columns / 2);
  var total = 0;
  var value;
  for (var i = -w; i <= w; i++) {
    for (var j = -h; j <= h; j++) {
      value = (1 / (2 * Math.PI * sigma * sigma)) * Math.exp(-(i * i + j * j)/(2 * sigma * sigma));
      kernel.set(i + w, j + h, value);
      total += value;
    }
  }
  if (total !== 0) {
    kernel.scale(1 / total, kernel);
  }
  return kernel;
};

Kernel.sobelX = function(rows, columns) {
  var kernel = new Matrix2d(rows, columns);
  var halfRows = Math.floor(rows / 2);
  var halfColumns = Math.floor(columns / 2);
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < columns; j++) {
      if (j === halfColumns) {
        kernel.set(i, j, 0);
      } else {
        kernel.set(i, j, halfColumns - j +
          ((j > halfColumns ? -1: 1) *
          (i + (i > halfRows ? 2 * (halfRows - i) : 0))));
      }
    }
  }
  return kernel;
};

Kernel.sobelY = function(rows, columns) {
  var kernel = new Matrix2d(rows, columns);
  var halfRows = Math.floor(rows / 2);
  var halfColumns = Math.floor(columns / 2);
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < columns; j++) {
      if (i === halfRows) {
        kernel.set(i, j, 0);
      } else {
        kernel.set(i, j, halfRows - i +
          ((i > halfRows ? -1: 1) *
          (j + (j > halfColumns ? 2 * (halfColumns - j) : 0))));
      }
    }
  }
  return kernel;
};

Kernel.combine = function(source, kernel, result) {
  var options = {
    edge : 'zero'
  };
  var halfRows = Math.floor(kernel.rows / 2);
  var halfColumns = Math.floor(kernel.columns / 2);
  var resultRows = source.rows + halfRows * 2;
  var resultColumns = source.columns + halfColumns * 2;
  if (!defined(result)) {
    result = new Matrix2d(resultRows, resultColumns);
  }
  if (result.rows !== resultRows || result.columns !== resultColumns) {
    throw new Error('`result.rows` and `result.columns` must be the size of the combined convolution kernel.');
  }
  for (var i = 0; i < source.rows; i++) {
    for (var j = 0; j < source.columns; j++) {
      result.set(i + halfRows, j + halfColumns, source.get(i, j));
    }
  }
  return result.convolve(kernel, options, result);
};

Kernel.fromName = function(name, width, height, options) {
  return Kernel[name](width, height, options);
};
