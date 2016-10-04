'use strict';
var defaults = require('defaults');
var defined = require('defined');

var Point2d = require('./Point2d');

module.exports = Matrix2d;

function Matrix2d(rows, columns) {
  if (!defined(rows)) {
    throw new Error('Argument: `rows` must be defined.');
  }
  if (!defined(columns)) {
    throw new Error('Argument: `columns` must be defined.');
  }
  this.rows = rows;
  this.columns = columns;
  this.length = rows * columns;
  for (var i = 0; i < this.length; i++) {
    this[i] = 0;
  }
}

Matrix2d.fromArray = function(rows, columns, array) {
  if (!defined(rows)) {
    throw new Error('Argument: `rows` must be defined.');
  }
  if (!defined(columns)) {
    throw new Error('Argument: `columns` must be defined.');
  }
  var matrix = new Matrix2d(rows, columns);
  for (var i = 0; i < array.length; i++) {
    matrix[i] = array[i];
  }
  return matrix;
}

Matrix2d.prototype.clone = function() {
  var clone = new Matrix2d(this.rows, this.columns);
  for (var i = 0; i < this.length; i++) {
    clone[i] = this[i];
  }
  return clone;
}

Matrix2d.prototype.max = function() {
  if (this.length > 0) {
    var max = this[0];
    for (var i = 1; i < this.length; i++) {
      max = Math.max(max, this[i]);
    }
    return max;
  }
}

Matrix2d.prototype.min = function() {
  if (this.length > 0) {
    var min = this[0];
    for (var i = 1; i < this.length; i++) {
      min = Math.min(min, this[i])
    }
    return min;
  }
}

Matrix2d.prototype.fill = function(value) {
  for (var i = 0; i < this.length; i++) {
    this[i] = value;
  }
}

Matrix2d.prototype.getIndex = function(row, column, options) {
  options = defaults(options, {
    edge : 'none'
  });
  switch(options.edge) {
    case 'extend':
      if (row < 0) {
        row = 0;
      } else if (row >= this.rows) {
        row = this.rows - 1;
      }
      if (column < 0) {
        column = 0;
      } else if (column >= this.columns) {
        column = this.columns - 1;
      }
      break;
    case 'wrap':
      row = ((row % this.rows) + this.rows) % this.rows;
      column = ((column % this.columns) + this.columns) % this.columns;
      break;
  }
  if (row < 0) {
    throw new Error('`row` must be greater than or equal to zero.');
  } else if (row >= this.rows) {
    throw new Error('`row` must be less than `this.rows`');
  }
  if (column < 0) {
    throw new Error('`column` must be greater than or equal zero.');
  } else if (column >= this.columns) {
    throw new Error('`column` must be less than `this.columns`');
  }
  return row * this.columns + column;
}

Matrix2d.prototype.get = function(row, column, options) {
  return this[this.getIndex(row, column, options)];
}

Matrix2d.prototype.set = function(row, column, value, options) {
  var index = this.getIndex(row, column, options);
  var old = this[index];
  this[index] = value;
  return old;
}

Matrix2d.prototype.add = function(matrix, result) {
  if (!defined(matrix)) {
    throw new Error('Argument: `matrix` must be defined.');
  }
  if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
    throw new Error('Matrix dimensions must match.');
  }
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns);
  } else if (result.rows !== this.rows || result.columns !== this.columns){
    throw new Error('Result matrix dimensions must match.');
  }
  for (var i = 0; i < this.length; i++) {
    result[i] = this[i] + matrix[i];
  }
  return result;
}

Matrix2d.prototype.subtract = function(matrix, result) {
  if (!defined(matrix)) {
    throw new Error('Argument: `matrix` must be defined.');
  }
  if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
    throw new Error('Matrix dimensions must match.');
  }
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns);
  } else if (result.rows !== this.rows || result.columns !== this.columns){
    throw new Error('Result matrix dimensions must match.');
  }
  for (var i = 0; i < this.length; i++) {
    result[i] = this[i] - matrix[i];
  }
  return result;
}

Matrix2d.prototype.scale = function(matrix, scale, result) {
  if (!defined(matrix)) {
    throw new Error('Argument: `matrix` must be defined.');
  }
  if (!defined(matrix)) {
    throw new Error('Argument: `scale` must be defined.');
  }
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns)
  }
  for (var i = 0; i < this.length; i++) {
    result[i] = this[i] * scale;
  }
  return result;
}

Matrix2d.prototype.equals = function(matrix) {
  if (!defined(matrix)) {
    throw new Error('Argument: `matrix` must be defined.');
  }
  if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
    return false;
  }
  for (var i = 0; i < this.length; i++) {
    if (this[i] !== matrix[i]) {
      return false;
    }
  }
  return true;
}

Matrix2d.prototype.convolve = function(kernel, options, result) {
  if (!defined(kernel)) {
    throw new Error('Argument: `kernel` must be defined.');
  }
  options = defaults(options, {
    edge : 'extend'
  });
  var matrix = this;
  if (!defined(result)) {
    result = new Matrix2d(matrix.rows, matrix.columns);
  }
  if (result === matrix) {
    matrix = matrix.clone();
  }
  var centerRow = Math.floor(kernel.rows / 2);
  var centerColumn = Math.floor(kernel.columns / 2);
  for (var i = 0; i < matrix.rows; i++) {
    for (var j = 0; j < matrix.columns; j++) {
      var value = 0.0;
      for (var m = 0; m < kernel.rows; m++) {
        for (var n = 0; n < kernel.columns; n++) {
          var p = i + m - centerRow;
          var q = j + n - centerColumn;
          value += matrix.get(p, q, options) * kernel.get(m, n);
        }
      }
      result.set(i, j, value);
    }
  }
  return result;
}
