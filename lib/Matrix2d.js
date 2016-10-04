'use strict';
var Promise = require('bluebird');
var defaults = require('defaults');

var defined = require('./defined');

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
  if (array.length < rows * columns) {
    throw new Error('Provided array must be at least as long as the matrix area');
  }
  var matrix = new Matrix2d(rows, columns);
  for (var i = 0; i < array.length; i++) {
    matrix[i] = array[i];
  }
  return matrix;
};

Matrix2d.prototype.clone = function() {
  var clone = new Matrix2d(this.rows, this.columns);
  for (var i = 0; i < this.length; i++) {
    clone[i] = this[i];
  }
  return clone;
};

Matrix2d.prototype.max = function() {
  if (this.length > 0) {
    var max = this[0];
    for (var i = 1; i < this.length; i++) {
      max = Math.max(max, this[i]);
    }
    return max;
  }
};

Matrix2d.prototype.min = function() {
  if (this.length > 0) {
    var min = this[0];
    for (var i = 1; i < this.length; i++) {
      min = Math.min(min, this[i]);
    }
    return min;
  }
};

Matrix2d.prototype.sum = function() {
  if (this.length > 0) {
    var sum = 0;
    for (var i = 0; i < this.length; i++) {
      sum += this[i];
    }
    return sum;
  }
};

Matrix2d.prototype.apply = function(func, result) {
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns);
  }
  for (var i = 0; i < this.length; i++) {
    result[i] = func(this[i]);
  }
};

Matrix2d.prototype.fill = function(value) {
  for (var i = 0; i < this.length; i++) {
    this[i] = value;
  }
};

Matrix2d.prototype.getIndex = function(row, column, options) {
  if (!defined(row)) {
    throw new Error('Argument: `row` must be defined.');
  }
  if (!defined(column)) {
    throw new Error('Argument: `column` must be defined.');
  }
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
};

Matrix2d.prototype.get = function(row, column, options) {
  return this[this.getIndex(row, column, options)];
};

Matrix2d.prototype.set = function(row, column, value, options) {
  var index = this.getIndex(row, column, options);
  var old = this[index];
  this[index] = value;
  return old;
};

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
};

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
};

Matrix2d.prototype.scale = function(scale, result) {
  if (!defined(scale)) {
    throw new Error('Argument: `scale` must be defined.');
  }
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns);
  }
  for (var i = 0; i < this.length; i++) {
    result[i] = this[i] * scale;
  }
  return result;
};

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
};

Matrix2d.prototype.convolve = function(kernel, options, result) {
  if (!defined(kernel)) {
    throw new Error('Argument: `kernel` must be defined.');
  }
  options = defaults(options, {
    edge : 'extend'
  });
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns);
  }
  return this.convolveChunk(kernel, options, result, 0, 0);
};

Matrix2d.prototype.convolveChunk = function(kernel, options, result, startRow, startColumn) {
  var matrix = this;
  return new Promise(function(resolve) {
    var chunk = false;
    var iterations;
    var duration;
    var chunkFunction;
    var i, j;
    if (defined(options.chunk)) {
      chunk = true;
      iterations = options.chunk.iterations;
      duration = options.chunk.duration;
      chunkFunction = function() {
        var nextI = i;
        var nextJ = j+1;
        if (nextJ >= matrix.columns) {
          nextI = i+1;
          nextJ = 0;
        }
        return matrix.convolveChunk(kernel, options, result, nextI, nextJ);
      };
    }
    if (result === matrix) {
      matrix = matrix.clone();
    }
    var centerRow = Math.floor(kernel.rows / 2);
    var centerColumn = Math.floor(kernel.columns / 2);
    for (i = startRow; i < matrix.rows; i++) {
      for (j = startColumn; j < matrix.columns; j++) {
        var value = 0.0;
        for (var m = 0; m < kernel.rows; m++) {
          for (var n = 0; n < kernel.columns; n++) {
            var p = i + m - centerRow;
            var q = j + n - centerColumn;
            value += matrix.get(p, q, options) * kernel.get(m, n);
          }
        }
        result.set(i, j, value);
        if (chunk && matrix.getIndex(i, j) % iterations === 0) {
          resolve(Promise.delay(duration).then(chunkFunction));
          return;
        }
      }
    }
    resolve(result);
  });
};
