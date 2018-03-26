'use strict';

const reader = require('properties-reader');
const env = /dev/i.test(process.env.NODE_ENV) ? 'development' : 'production';

const properties = reader(`${ __dirname }/${ env }.properties`);

module.exports = properties.getAllProperties();

Object.keys(module.exports).forEach(function (key) {
   const value = this[key];
   if (/^(true|false)$/.test(value)) {
      this[key] = value === 'true';
   }
}, module.exports);

module.exports.bindToExpress = properties.bindToExpress.bind(properties);
