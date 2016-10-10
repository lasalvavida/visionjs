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

Image.prototype.apply = function(functionName, args, result) {
  if (!defined(result)) {
    result = new Image(this.width, this.height, {
      colorspace : this.colorspace
    });
  }
  if (!defined(args)) {
    args = [];
  }
  if (this.colorspace.name !== result.colorspace.name) {
    throw new Error('`result` colorspace must match image colorspace.');
  }
  if (this.width !== result.width || this.height !== result.height) {
    throw new Error('`result` dimensions must match.');
  }
  var channels = this.channels;
  var resultChannels = result.channels;
  var colorspace = this.colorspace;
  args.push(undefined);
  for (var n = 0; n < channels.length; n++) {
    var channel = channels[n];
    var resultChannel = resultChannels[n];
    args[args.length - 1] = resultChannel;
    if (colorspace.name === 'RGBA' && n === 3) {
      channel.clone(resultChannel);
    } else {
      channel[functionName].apply(channel, args);
    }
  }
  return result;
};

Image.prototype.applyAsync = function(functionName, args, options, result) {
  if (!defined(result)) {
    result = new Image(this.width, this.height, {
      colorspace : this.colorspace
    });
  }
  if (this.colorspace.name !== result.colorspace.name) {
    throw new Error('`result` colorspace must match image colorspace.');
  }
  if (this.width !== result.width || this.height !== result.height) {
    throw new Error('`result` dimensions must match.');
  }
  var channels = this.channels;
  var resultChannels = result.channels;
  var colorspace = this.colorspace;
  args.push(undefined);
  return Promise.map(channels, function(channel, n) {
    var resultChannel = resultChannels[n];
    args[args.length - 1] = resultChannel;
    if (colorspace.name === 'RGBA' && n === 3) {
      channel.clone(resultChannel);
    } else {
      return channel[functionName].apply(channel, args);
    }
  }).then(function() {
    return result;
  });
};

Image.prototype.convolve = function(kernel, options, result) {
  return this.apply('convolve', [kernel, options], result);
};

Image.prototype.convolveAsync = function(kernel, options, result) {
  return this.applyAsync('convolveAsync', [kernel, options], options, result);
};

Image.prototype.integral = function(result) {
  return this.apply('integral', [], result);
};

Image.prototype.integralAsync = function(options, result) {
  return this.applyAsync('integralAsync', [options], options, result);
};
