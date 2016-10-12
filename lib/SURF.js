'use strict';
var defaults = require('defaults');
var defined = require('defined');

var Matrix2d = require('./Matrix2d');

var SURF = {};

module.exports = SURF;

SURF.filterSize = function(octave, level) {
  return (9 + 3 * octave * (octave+1)) + 6 * Math.pow(2, octave) * level;
};

SURF.discreteLoGYY = function(size) {
  var zeroBandWidth = Math.round(size * 0.2);
  var positiveBandWidth = Math.round((size - Math.round(size / 3)) / 2);
  var kernel = new Matrix2d(size, size);
  var value;
  for (var row = 0; row < size; row++) {
    for (var column = 0; column < size; column++) {
      if (column < zeroBandWidth || column >= size - zeroBandWidth) {
        value = 0;
      } else if (row < positiveBandWidth || row >= size - positiveBandWidth) {
        value = 1;
      } else {
        value = -2;
      }
      kernel.set(row, column, value);
    }
  }
  return kernel;
};

SURF.discreteLoGXX = function(size) {
  var zeroBandWidth = Math.round(size * 0.2);
  var positiveBandWidth = Math.round(size / 3);
  var kernel = new Matrix2d(size, size);
  var value;
  for (var row = 0; row < size; row++) {
    for (var column = 0; column < size; column++) {
      if (column < zeroBandWidth || column >= size - zeroBandWidth) {
        value = 0;
      } else if (row < positiveBandWidth || row >= size - positiveBandWidth) {
        value = 1;
      } else {
        value = -2;
      }
      kernel.set(column, row, value);
    }
  }
  return kernel;
};

SURF.discreteLoGXY = function(size) {
  var lobeWidth = Math.round(size / 3);
  var zeroBandWidth = Math.round((size - lobeWidth * 2 - 1)/2);
  var center = Math.floor(size / 2);
  var kernel = new Matrix2d(size, size);
  var value;
  for (var row = 0; row < size; row++) {
    for (var column = 0; column < size; column++) {
      if (column < zeroBandWidth || column >= size - zeroBandWidth ||
          row < zeroBandWidth || row >= size - zeroBandWidth ||
          row === center || column === center) {
        value = 0;
      } else if ((row < center && column < center) ||
          (row > center && column > center)) {
        value = 1;
      } else {
        value = -1;
      }
      kernel.set(row, column, value);
    }
  }
  return kernel;
};

SURF.fastLoGYYCell = function(row, column, size, options, result) {
  var zeroBandWidth = Math.round(size * 0.2);
  var positiveBandWidth = Math.round(size / 3);
  var halfSize = Math.floor(size / 2);

  var bottomColumn = column + halfSize - zeroBandWidth;
  if (bottomColumn >= this.columns) {
    bottomColumn = this.columns - 1;
  }
  var topColumn = column - halfSize + zeroBandWidth - 1;
  if (topColumn >= this.columns) {
    topColumn = this.columns - 1;
  }

  var topBottomRow = row - halfSize + positiveBandWidth - 1;
  if (topBottomRow >= this.rows) {
    topBottomRow = this.rows - 1;
  }
  var topTopRow = row - halfSize - 1;
  if (topTopRow >= this.rows) {
    topTopRow = this.rows - 1;
  }

  var middleBottomRow = topBottomRow + positiveBandWidth;
  if (middleBottomRow >= this.rows) {
    middleBottomRow = this.rows - 1;
  }
  var middleTopRow = topTopRow + positiveBandWidth;
  if (middleTopRow >= this.rows) {
    middleTopRow = this.rows - 1;
  }

  var bottomBottomRow = middleBottomRow + positiveBandWidth;
  if (bottomBottomRow >= this.rows) {
    bottomBottomRow = this.rows - 1;
  }
  var bottomTopRow = middleTopRow + positiveBandWidth;
  if (bottomTopRow >= this.rows) {
    bottomTopRow = this.rows - 1;
  }

  var topSum = this.get(topBottomRow, bottomColumn, options) -
    this.get(topBottomRow, topColumn, options) -
    this.get(topTopRow, bottomColumn, options) +
    this.get(topTopRow, topColumn, options);
  var middleSum = this.get(middleBottomRow, bottomColumn, options) -
    this.get(middleBottomRow, topColumn, options) -
    this.get(middleTopRow, bottomColumn, options) +
    this.get(middleTopRow, topColumn, options);
  var bottomSum = this.get(bottomBottomRow, bottomColumn, options) -
    this.get(bottomBottomRow, topColumn, options) -
    this.get(bottomTopRow, bottomColumn, options) +
    this.get(bottomTopRow, topColumn, options);

  result.set(row, column, topSum + bottomSum - 2 * middleSum);
};

SURF.fastLoGYY = function(integral, size, result) {
  if (!defined(result)) {
    result = new Matrix2d(integral.rows, integral.columns);
  }
  var options = {
    edge : 'zero'
  };
  integral.apply(SURF.fastLoGYYCell, [size, options, result]);
  return result;
};

SURF.fastLoGXXCell = function(row, column, size, options, result) {
  var zeroBandWidth = Math.round(size * 0.2);
  var positiveBandWidth = Math.round(size / 3);
  var halfSize = Math.floor(size / 2);

  var bottomRow = row + halfSize - zeroBandWidth;
  if (bottomRow >= this.rows) {
    bottomRow = this.rows - 1;
  }
  var topRow = row - halfSize + zeroBandWidth - 1;
  if (topRow >= this.rows) {
    topRow = this.rows - 1;
  }

  var topBottomColumn = column - halfSize + positiveBandWidth - 1;
  if (topBottomColumn >= this.columns) {
    topBottomColumn = this.columns - 1;
  }
  var topTopColumn = column - halfSize - 1;
  if (topTopColumn >= this.columns) {
    topTopColumn = this.columns - 1;
  }

  var middleBottomColumn = topBottomColumn + positiveBandWidth;
  if (middleBottomColumn >= this.columns) {
    middleBottomColumn = this.columns - 1;
  }
  var middleTopColumn = topTopColumn + positiveBandWidth;
  if (middleTopColumn >= this.columns) {
    middleTopColumn = this.columns - 1;
  }

  var bottomBottomColumn = middleBottomColumn + positiveBandWidth;
  if (bottomBottomColumn >= this.columns) {
    bottomBottomColumn = this.columns - 1;
  }
  var bottomTopColumn = middleTopColumn + positiveBandWidth;
  if (bottomTopColumn >= this.columns) {
    bottomTopColumn = this.columns - 1;
  }

  var topSum = this.get(bottomRow, topBottomColumn, options) -
    this.get(bottomRow, topTopColumn, options) -
    this.get(topRow, topBottomColumn, options) +
    this.get(topRow, topTopColumn, options);
  var middleSum = this.get(bottomRow, middleBottomColumn, options) -
    this.get(bottomRow, middleTopColumn, options) -
    this.get(topRow, middleBottomColumn, options) +
    this.get(topRow, middleTopColumn, options);
  var bottomSum = this.get(bottomRow, bottomBottomColumn, options) -
    this.get(bottomRow, bottomTopColumn, options) -
    this.get(topRow, bottomBottomColumn, options) +
    this.get(topRow, bottomTopColumn, options);

  result.set(row, column, topSum + bottomSum - 2 * middleSum);
};

SURF.fastLoGXX = function(integral, size, result) {
  if (!defined(result)) {
    result = new Matrix2d(integral.rows, integral.columns);
  }
  var options = {
    edge : 'zero'
  };
  integral.apply(SURF.fastLoGXXCell, [size, options, result]);
  return result;
};

SURF.fastLoGXYCell = function(row, column, size, options, result)  {
  var lobeWidth = Math.round(size / 3);
  var zeroBandWidth = Math.round((size - lobeWidth * 2 - 1)/2);
  var halfSize = Math.floor(size / 2);

  var oneBottomRow = row - 1;
  var oneTopRow = oneBottomRow - lobeWidth;
  var oneBottomColumn = column - 1;
  var oneTopColumn = oneBottomColumn - lobeWidth;
  if (oneBottomRow >= this.rows) {
    oneBottomRow = this.rows - 1;
  }
  if (oneTopRow >= this.rows) {
    oneTopRow = this.rows - 1;
  }
  if (oneBottomColumn >= this.columns) {
    oneBottomColumn = this.columns - 1;
  }
  if (oneTopColumn >= this.columns) {
    oneTopColumn = this.columns - 1;
  }

  var twoBottomRow = oneBottomRow;
  var twoTopRow = oneTopRow;
  var twoBottomColumn = column + halfSize - zeroBandWidth;
  var twoTopColumn = twoBottomColumn - lobeWidth;
  if (twoBottomColumn >= this.columns) {
    twoBottomColumn = this.columns - 1;
  }
  if (twoTopColumn >= this.columns) {
    twoTopColumn = this.columns - 1;
  }

  var threeBottomRow = row + halfSize - zeroBandWidth;
  var threeTopRow = threeBottomRow - lobeWidth;
  var threeBottomColumn = oneBottomColumn;
  var threeTopColumn = oneTopColumn;
  if (threeBottomRow >= this.rows) {
    threeBottomRow = this.rows - 1;
  }
  if (threeTopRow >= this.rows) {
    threeTopRow = this.rows - 1;
  }

  var fourBottomRow = threeBottomRow;
  var fourTopRow = threeTopRow;
  var fourBottomColumn = twoBottomColumn;
  var fourTopColumn = twoTopColumn;

  var oneSum = this.get(oneBottomRow, oneBottomColumn, options) -
    this.get(oneBottomRow, oneTopColumn, options) -
    this.get(oneTopRow, oneBottomColumn, options) +
    this.get(oneTopRow, oneTopColumn, options);

  var twoSum = this.get(twoBottomRow, twoBottomColumn, options) -
    this.get(twoBottomRow, twoTopColumn, options) -
    this.get(twoTopRow, twoBottomColumn, options) +
    this.get(twoTopRow, twoTopColumn, options);

  var threeSum = this.get(threeBottomRow, threeBottomColumn, options) -
    this.get(threeBottomRow, threeTopColumn, options) -
    this.get(threeTopRow, threeBottomColumn, options) +
    this.get(threeTopRow, threeTopColumn, options);

  var fourSum = this.get(fourBottomRow, fourBottomColumn, options) -
    this.get(fourBottomRow, fourTopColumn, options) -
    this.get(fourTopRow, fourBottomColumn, options) +
    this.get(fourTopRow, fourTopColumn, options);

  result.set(row, column, oneSum - twoSum - threeSum + fourSum);
};

SURF.fastLoGXY = function(integral, size, result) {
  if (!defined(result)) {
    result = new Matrix2d(integral.rows, integral.columns);
  }
  var options = {
    edge : 'zero'
  };
  integral.apply(SURF.fastLoGXYCell, [size, options, result]);
  return result;
};

SURF.hessianDeterminantCell = function(row, column, size, options, result) {
  SURF.fastLoGXXCell.call(this, row, column, size, options, result);
  var xx = result.get(row, column);
  SURF.fastLoGXYCell.call(this, row, column, size, options, result);
  var xy = result.get(row, column);
  SURF.fastLoGYYCell.call(this, row, column, size, options, result);
  var yy = result.get(row, column);
  result.set(row, column, xx * yy - xy * xy);
};

SURF.hessianDeterminant = function(integral, octave, level, result) {
  if (!defined(result)) {
    result = new Matrix2d(integral.rows, integral.columns);
  }
  var options = {
    edge : 'zero'
  };
  var size = SURF.filterSize(octave, level);
  integral.apply(SURF.hessianDeterminantCell, [size, options, result]);
  return result;
};

SURF.hessianDeterminantAsync = function(integral, octave, level, options, result) {
  options = defaults(options, {
    edge : 'zero'
  });
  if (!defined(result)) {
    result = new Matrix2d(integral.rows, integral.columns);
  }
  var size = SURF.filterSize(octave, level);
  return integral.applyAsync(SURF.hessianDeterminantCell, [size, options, result], options)
    .then(function() {
      return result;
    });
};
