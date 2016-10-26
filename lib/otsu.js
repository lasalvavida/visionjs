'use strict';
module.exports = otsu;

/**
 * Computes an optimal threshold from histogram data using Otsu's Method.
 * Adapted from: https://en.wikipedia.org/wiki/Otsu%27s_method#Algorithm
 *
 * @param {Number[]} histogram - The histogram to use for the computation.
 * @param {Number} total - The number of sample points used to create the histogram.
 *
 * @returns {Number} An optimal threshold for the provided data.
 */
function otsu(histogram, total) {
  var i;
  var sum = 0;
  for (i = 1; i < histogram.length; i++) {
    sum += i * histogram[i];
  }
  var sumB = 0;
  var wB = 0;
  var wF = 0;
  var mB;
  var mF;
  var max = 0.0;
  var between = 0.0;
  var threshold1 = 0.0;
  var threshold2 = 0.0;
  for (i = 0; i < histogram.length; ++i) {
    wB += histogram[i];
    if (wB === 0) {
      continue;
    }
    wF = total - wB;
    if (wF === 0) {
      break;
    }
    sumB += i * histogram[i];
    mB = sumB / wB;
    mF = (sum - sumB) / wF;
    between = wB * wF * (mB - mF) * (mB - mF);
    if (between >= max) {
      threshold1 = i;
      if (between > max) {
        threshold2 = i;
      }
      max = between;
    }
  }
  return (threshold1 + threshold2) / 2.0;
}
