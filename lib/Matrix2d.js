'use strict';
var Promise = require('bluebird');
var clone = require('clone');
var defaults = require('defaults');

var defined = require('./defined');

module.exports = Matrix2d;

/**
 * Create a new matrix of the specified size. The matrix can be optionally filled with a value or values.
 * If no values are specified, the matrix is filled with zeros.
 * @see Matrix2d.fill
 *
 * @constructor
 * @param {Number} rows - The number of rows in the matrix.
 * @param {Number} columns - The number of columns in the matrix.
 * @param {(Number|Number[]|Function)} [value] - Either a number, an array of numbers or a function used to fill the matrix.
 */
function Matrix2d(rows, columns, value) {
  if (!defined(rows)) {
    throw new Error('Argument: `rows` must be defined.');
  }
  if (!defined(columns)) {
    throw new Error('Argument: `columns` must be defined.');
  }
  this.rows = rows;
  this.columns = columns;
  this.length = rows * columns;
  if (!defined(value)) {
    value = 0;
  }
  this.fill(value);
}

/**
 * Clones the matrix into another matrix, creating
 * a new one if `result` is undefined.
 *
 * @param {Matrix2d} [result] - The matrix to copy into.
 *
 * @returns `result` if it is defined, otherwise a new cloned matrix.
 */
Matrix2d.prototype.clone = function(result) {
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns);
  }
  result.fill(this);
  return result;
};

/**
 * Fills the matrix with the provided value or values.
 *
 * @param {(Number|Number[]|Function)} value - Either a number, an array of numbers or a function used to fill the matrix.
 */
Matrix2d.prototype.fill = function(value) {
  if (!defined(value)) {
    throw new Error('Argument: `value` must be defined.');
  }
  for (var i = 0; i < this.length; i++) {
    if (typeof(value) === 'function') {
      this[i] = value();
    }
    else if (defined(value[0])) {
      this[i] = value[i];
    } else {
      this[i] = value;
    }
  }
};

/**
 * Get a flat index into the matrix using the row and column. Supports different edge modes if the coordinates are outside of the matrix bounds.
 * In 'extend' mode, the outermost cells of the matrix stretch infinitely outward. In 'wrap' mode, falling off one side of the matrix starts back
 * on the opposite side. In 'zero' mode, any values outside the matrix are considered to be zero and will return an index of -1.
 *
 * @param {Number} row - The row of the matrix to index into.
 * @param {Number} column - The column of the matrix to index into.
 * @param {Object} [options] - Optional parameters specifying edge mode.
 * @param {String} [options.edge] - Possible values: ['extend', 'wrap', 'zero'].
 *
 * @returns {Number} The flat index into the array corresponding to the requested row and column.
 */
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
    case 'zero':
      if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
        return -1;
      }
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

/**
 * Get a value from the matrix by row and column. Options can be used to specify
 * edge modes for `getIndex`.
 * @see getIndex
 *
 * @param {Number} row - The row of the matrix to index into.
 * @param {Number} column - The column of the matrix to index into.
 * @param {Object} [options] - Optional parameters specifying edge mode.
 * @param {String} [options.edge] - Possible values: ['extend', 'wrap', 'zero'].
 *
 * @returns {Number} The value at the specified row and column.
 */
Matrix2d.prototype.get = function(row, column, options) {
  var index = this.getIndex(row, column, options);
  if (index < 0) {
    return 0;
  }
  return this[index];
};

/**
 * Places a value into the matrix by row and column. Options can be used to specify
 * edge modes for `getIndex`.
 * @see getIndex
 *
 * @param {Number} row - The row of the matrix to index into.
 * @param {Number} column - The column of the matrix to index into.
 * @param {Number} value - The value to place into the matrix.
 * @param {Object} [options] - Optional parameters specifying edge mode.
 * @param {String} [options.edge] - Possible values: ['extend', 'wrap', 'zero'].
 *
 * @returns {Number} The old value at the specified row and column.
 */
Matrix2d.prototype.set = function(row, column, value, options) {
  var index = this.getIndex(row, column, options);
  if (index >= 0) {
    var old = this[index];
    this[index] = value;
    return old;
  }
  return 0;
};

/**
 * Apply a single cell operation to every cell of the matrix.
 * Provided arguments are shifted over by two making the first two parameters the
 * row and column of the current cell.
 *
 * @param {Function} func - The function to call with `arguments` for each cell.
 * @param {Array} args - The arguments passed into `func`.
 *
 * @example
 * // Find the sum of two matrices
 * var m1 = new Matrix2d(2, 2, [0, 1, 2, 3]);
 * var m2 = new Matrix2d(2, 2, [4, 5, 6, 7]);
 * var m3 = new Matrix2d(2, 2);
 *
 * m1.apply(function(row, column, matrix, result) {
 *   result.set(row, column, this.get(row, column) + matrix.get(row, column));
 * }, [m2, m3]);
 *
 * // m3 == [4, 6, 8, 10]
 */
Matrix2d.prototype.apply = function(func, args) {
  if (!defined(args)) {
    args = [];
  } else {
    args = clone(args, false, 1);
  }
  args.unshift(0);
  args.unshift(0);
  for (var i = 0; i < this.rows; i++) {
    args[0] = i;
    for (var j = 0; j < this.columns; j++) {
      args[1] = j;
      func.apply(this, args);
    }
  }
};

/**
 * Apply a single cell operation to every cell of the matrix.
 * Provided arguments are shifted over by two making the first two parameters the
 * row and column of the current cell.
 *
 * Operates in much the same way as `Matrix2d.apply`, except that it returns a Promise
 * that resolves on completion, and the operation can be chunked, allowing
 * long-running matrix operations to be performed without blocking all other tasks.
 *
 * @param {Function} func - The function to call with `arguments` for each cell.
 * @param {Array} args - The arguments passed into `func`.
 * @param {Object} [options] - Configure more specific async behavior.
 * @param {Boolean} [options.chunk=false] - This operation should be chunked. By default, no chunking is done.
 * @param {Number} [options.iterations=0] - If chunking is enabled, each chunk is composed of this many iterations.
 * @param {Number} [options.duration=0] - If chunking is enabled, the operation will wait for this duration between each chunk.
 *
 * @example
 * // Find the sum of two matrices
 * var m1 = new Matrix2d(2, 2, [0, 1, 2, 3]);
 * var m2 = new Matrix2d(2, 2, [4, 5, 6, 7]);
 * var m3 = new Matrix2d(2, 2);
 *
 * m1.applyAsync(function(row, column, matrix, result) {
 *   result.set(row, column, this.get(row, column) + matrix.get(row, column));
 * }, [m2, m3])
 *   .then(function() {
 *     // m3 == [4, 6, 8, 10]
 *   });
 */
Matrix2d.prototype.applyAsync = function(func, args, options) {
  if (!defined(options) || !defined(options.init)) {
    options = clone(options);
    options = defaults(options, {
      chunk : false,
      iterations : 0,
      duration : 0,
      startRow : 0,
      startColumn : 0,
      numChunks : 0
    });
    if (!defined(args)) {
      args = [];
    } else {
      args = clone(args, false, 1);
    }
    args.unshift(0);
    args.unshift(0);
    options.init = true;
  }

  var that = this;
  var chunkFunction = function() {
    return that.applyAsync(func, args, options);
  };
  var chunk = options.chunk;
  var iterations = options.iterations;
  var duration = options.duration;
  var startRow = options.startRow;
  var startColumn = options.startColumn;
  var count = 0;
  for (var i = startRow; i < this.rows; i++) {
    args[0] = i;
    for (var j = startColumn; j < this.columns; j++) {
      args[1] = j;
      func.apply(this, args);
      count++;
      if (count >= iterations) {
        options.startRow = i;
        options.startColumn = j+1;
        options.numChunks++;
        return Promise.delay(duration).then(chunkFunction);
      }
    }
    startColumn = 0;
  }
  return Promise.resolve(options.numChunks);
};

/**
 * Get the maximum value in the matrix.
 *
 * @returns The maximum value in the matrix, or undefined if the matrix has a length of zero.
 */
Matrix2d.prototype.max = function() {
  if (this.length > 0) {
    var globalMax = this[0];
    this.apply(function(row, column) {
      globalMax = Math.max(globalMax, this.get(row, column));
    });
    return globalMax;
  }
};

/**
 * Get the minimum value in the matrix.
 *
 * @returns The minimum value in the matrix, or undefined if the matrix has a length of zero.
 */
Matrix2d.prototype.min = function() {
  if (this.length > 0) {
    var globalMin = this[0];
    this.apply(function(row, column) {
      globalMin = Math.min(globalMin, this.get(row, column));
    });
    return globalMin;
  }
};

/**
 * Compute the sum of all values in the matrix.
 *
 * @returns The sum of all values in the matrix.
 */
Matrix2d.prototype.sum = function() {
  if (this.length > 0) {
    var sum = this[0];
    this.apply(function(row, column) {
      sum += this.get(row, column);
    });
    return sum;
  }
};

/**
 * Add this matrix and another one and place the output into `result`.
 * If `result` is undefined, a new matrix is created.
 *
 * @param {Matrix2d} matrix - The matrix to add to this one.
 * @param {Matrix2d} [result] - The matrix to store the result into.
 *
 * @returns `result`, the sum of the two matrices.
 */
Matrix2d.prototype.add = function(matrix, result) {
  if (!defined(matrix)) {
    throw new Error('Argument: `matrix` must be defined');
  }
  if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
    throw new Error('Matrix dimensions must match.');
  }
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns);
  } else if (result.rows !== this.rows || result.columns !== this.columns){
    throw new Error('`result` matrix dimensions must match.');
  }
  this.apply(function(row, column, matrix, result) {
    result.set(row, column, this.get(row, column) + matrix.get(row, column));
  }, [matrix, result]);
  return result;
};

/**
 * Subtract another matrix from this one and place the output into `result`.
 * If `result` is undefined, a new matrix is created.
 *
 * @param {Matrix2d} matrix - The matrix to subtract from this one.
 * @param {Matrix2d} [result] - The matrix to store the result into.
 *
 * @returns `result`, the difference of the two matrices.
 */
Matrix2d.prototype.subtract = function(matrix, result) {
  if (!defined(matrix)) {
    throw new Error('Argument: `matrix` must be defined');
  }
  if (this.rows !== matrix.rows || this.columns !== matrix.columns) {
    throw new Error('Matrix dimensions must match.');
  }
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns);
  } else if (result.rows !== this.rows || result.columns !== this.columns){
    throw new Error('`result` matrix dimensions must match.');
  }
  this.apply(function(row, column, matrix, result) {
    result.set(row, column, this.get(row, column) - matrix.get(row, column));
  }, [matrix, result]);
  return result;
};

/**
 * Multiply each element in this matrix by the provided scale and place
 * the output into `result`.
 * If `result` is undefined, a new matrix is created.
 *
 * @param {Number} scale - The scale to apply at each cell.
 * @param {Matrix2d} [result] - The matrix to store the result into.
 *
 * @returns `result`, the scaled matrix.
 */
Matrix2d.prototype.scale = function(scale, result) {
  if (!defined(scale)) {
    throw new Error('Argument: `scale` must be defined.');
  }
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns);
  } else if (result.rows !== this.rows || result.columns !== this.columns){
    throw new Error('`result` matrix dimensions must match.');
  }
  this.apply(function(row, column, scale, result) {
    result.set(row, column, this.get(row, column) * scale);
  }, [scale, result]);
  return result;
};

/**
 * Test for equality between this matrix and another.
 *
 * @param {Matrix2d} matrix - The matrix to compare against.
 *
 * @returns `true` if the matrices are equal, `false` if they are not.
 */
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

Matrix2d.prototype.convolveCell = function(row, column, kernel, options, result) {
  var centerRow = Math.floor(kernel.rows / 2);
  var centerColumn = Math.floor(kernel.columns / 2);
  var value = 0.0;
  for (var m = 0; m < kernel.rows; m++) {
    for (var n = 0; n < kernel.columns; n++) {
      var p = row + m - centerRow;
      var q = column + n - centerColumn;
      value += this.get(p, q, options) * kernel.get(m, n);
    }
  }
  result.set(row, column, value);
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
  var matrix = this;
  if (result === matrix) {
    matrix = matrix.clone();
  }
  matrix.apply(matrix.convolveCell, [kernel, options, result]);
  return result;
};

Matrix2d.prototype.convolveAsync = function(kernel, options, result) {
  if (!defined(kernel)) {
    throw new Error('Argument: `kernel` must be defined.');
  }
  options = defaults(options, {
    edge : 'extend',
  });
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns);
  }
  var matrix = this;
  if (result === matrix) {
    matrix = matrix.clone();
  }
  return matrix.applyAsync(matrix.convolveCell, [kernel, options, result], options)
    .then(function() {
      return result;
    });
};

Matrix2d.prototype.integralCell = function(row, column, options) {
  this.set(row, column, this.get(row, column) +
    this.get(row - 1, column, options) +
    this.get(row, column - 1, options) -
    this.get(row - 1, column - 1, options));
};

Matrix2d.prototype.integral = function(result) {
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns);
  } else if (result.rows !== this.rows || result.columns !== this.columns) {
    throw new Error('`result.rows` must be equal to `this.rows` and `result.columns` must be equal to `this.columns`.');
  }
  if (this !== result) {
    this.clone(result);
  }
  var options = {
    edge : 'zero'
  };
  result.apply(result.integralCell, [options]);
  return result;
};

Matrix2d.prototype.integralAsync = function(options, result) {
  if (!defined(result)) {
    result = new Matrix2d(this.rows, this.columns);
  } else if (result.rows !== this.rows || result.columns !== this.columns) {
    throw new Error('`result.rows` must be equal to `this.rows` and `result.columns` must be equal to `this.columns`.');
  }
  if (this !== result) {
    this.clone(result);
  }
  var integralOptions = {
    edge : 'zero'
  };
  return result.apply(result.integralCell, [integralOptions], options);
};

Matrix2d.prototype.transpose = function(result) {
  if (!defined(result)) {
    result = new Matrix2d(this.columns, this.rows);
  }
  if (result.rows !== this.columns || result.columns !== this.rows) {
    throw new Error('`result.rows` must be equal to `this.columns` and `result.columns` must be equal to `this.rows`.');
  }
  var matrix = this;
  if (result === this) {
    matrix = this.clone();
  }
  for (var i = 0; i < matrix.rows; i++) {
    for (var j = 0; j < matrix.columns; j++) {
      result.set(j, i, matrix.get(i, j));
    }
  }
  return result;
};
