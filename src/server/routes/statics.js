'use strict';

const app = module.exports = require('express')();

app.use(require('cacheable-middleware')());

app.get('/', function (req, res) {
   res.render('index');
});

app.get('/service-worker.js', function (req, res) {
   const fs = require('fs');
   const readDir = require('readdir');
   const mustache = require('mustache');

   let pkg = require('../../../package.json');
   let javaScriptFiles = readDir.readSync(
      `${__dirname}/../../../dist/${pkg.version}`,
      ['**/*.js']
   );

   res.set('Content-Type', 'application/javascript');
   res.send(
      mustache.render(
         fs.readFileSync(`${__dirname}/../../web/js/worker/service-worker.js`, 'utf8'),
         Object.assign(
            {
               pkg: pkg,
               files: {
                  js: JSON.stringify(javaScriptFiles)
               }
            },
            res.locals,
            req.app.locals
         )
      ));
});

app.get('/ping', function (req, res) {
   res.cacheFor(0).send({
      loggedIn: !!req.user
   });
});
