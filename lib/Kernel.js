'use strict';
var defaults = require('defaults');
var defined = require('defined');

var Matrix2d = require('./Matrix2d');

var Kernel = {};

module.exports = Kernel;

Kernel.identity = function(rows, columns) {
  var kernel = new Matrix2d(rows, columns);
  var centerRow = Math.floor(kernel.rows / 2);
  var centerColumn = Math.floor(kernel.columns / 2);
  kernel.set(centerRow, centerColumn, 1);
  return kernel;
}

Kernel.average = function(rows, columns) {
  var kernel = new Matrix2d(rows, columns);
  kernel.fill(1 / kernel.length);
  return kernel;
}

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
}

Kernel.fromName = function(name, width, height, options) {
  return Kernel[name](width, height, options);
}
