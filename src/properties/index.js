'use strict';

const reader = require('properties-reader');

module.exports = reader(`${__dirname}/${process.env.NODE_ENV}.properties`);
