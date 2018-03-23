'use strict';

const express = require('express');

module.exports = function (render) {

   const app = express();

   app.get('/', (req, res) => {
      render(res, 'index');
   });

   app.get('/ping', (req, res) => {
      res.send({
         loggedIn: !!req.user
      });
   });

   return app;

};
