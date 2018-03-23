'use strict';

const reader = require('properties-reader');

const properties = reader(`${__dirname}/${process.env.NODE_ENV}.properties`);

module.exports = properties.getAllProperties();

Object.keys(module.exports).forEach(function (key) {
   const value = this[key];
   if (/^(true|false)$/.test(value)) {
      this[key] = value === 'true';
   }
}, module.exports);

module.exports.bindToExpress = properties.bindToExpress.bind(properties);
