'use strict';
var Promise = require('bluebird');
var defaults = require('defaults');

var Colorspace = require('./Colorspace');
var Matrix2d = require('./Matrix2d');
var defined = require('./defined');

module.exports = Image;

function Image(width, height, options) {
  options = defaults(options, {
    colorspace : Colorspace.RGBA
  });
  this.width = width;
  this.height = height;
  this.length = width * height;
  this.colorspace = options.colorspace;
  this.channels = [];
  for (var i = 0; i < this.colorspace.channels; i++) {
    this.channels.push(new Matrix2d(height, width));
  }
}

Image.fromRawData = function(width, height, data, options) {
  var length = data.length;
  var image = new Image(width, height, options);
  var channels = image.channels;
  for (var i = 0; i < data.length; i+=channels.length) {
    for (var n = 0; n < channels.length; n++) {
      channels[n][i / channels.length] = data[i + n];
    }
  }
  return image;
};

Image.prototype.writeRawData = function(result) {
  if (!defined(result)) {
    result = [];
  }
  var channels = this.channels;
  var index = 0;
  for (var i = 0; i < this.length; i++) {
    for (var n = 0; n < channels.length; n++) {
      if (index < result.length) {
        result[index] = channels[n][i];
      } else {
        result.push(channels[n][i]);
      }
      index++;
    }
  }
  return result;
};

Image.prototype.apply = function(functionName, result) {
  if (!defined(result)) {
    result = new Image(this.width, this.height);
  }
  for (var n = 0; n < this.channels.length; n++) {
    var channel = this.channels[n];
    var resultChannel = result.channels[n];
    if (this.colorspace.name === 'RGBA' && n === 3) {
      channel.clone(resultChannel);
    } else {
      channel[functionName](resultChannel);
    }
  }
  return result;
};

Image.prototype.convolve = function(kernel, options, result) {
  if (!defined(result)) {
    result = new Image(this.width, this.height);
  }
  var promises = [];
  for (var n = 0; n < this.channels.length; n++) {
    var channel = this.channels[n];
    var resultChannel = result.channels[n];
    if (this.colorspace.name === 'RGBA' && n === 3) {
      channel.clone(resultChannel);
    } else {
      promises.push(channel.convolve(kernel, options, resultChannel));
    }
  }
  return Promise.all(promises)
    .then(function() {
      return result;
    });
};
