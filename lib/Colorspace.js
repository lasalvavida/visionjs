'use strict';
module.exports = Colorspace;

function Colorspace(channels, name) {
  this.channels = channels;
  this.name = name;
}

Colorspace.GRAYSCALE = new Colorspace(1, 'GRAYSCALE');
Colorspace.RGB = new Colorspace(3, 'RGB');
Colorspace.RGBA = new Colorspace(4, 'RGBA');
