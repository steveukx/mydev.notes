
var Session = require('session-middleware');
var GoogleAuth = require('gauth');
var googleAuth = new GoogleAuth(
                        GoogleAuth.configure('base.url', 'http://localhost:9874/user/login'),
                        GoogleAuth.filePersistence(__dirname + '/.googleauth'));

var express = require('express');
var app = express();

app.use(function(req, res, next) {
   if(req.app.path() === req.originalUrl) {
      res.redirect(req.app.path() + '/');
   }
   else {
      next();
   }
});

app.use(Session.middleware("encrypt-me" + process.env.sessionKey));

app.use('/ping', function(req, res) {
   var loggedIn = !!req.session.user;
   res.send({ result: loggedIn }, loggedIn ? 200 : 401);
});

app.use(function(req, res, next) {
   req.user = req.session.user;
   console.log(req.url, req.session.user);

   if(!req.user && req.url.indexOf('/login') !== 0) {
      res.redirect(req.app.path() + '/login');
   }

   next();
});

app.use('/login', googleAuth.middleware(function(userJson, next) {
      next(null, {email: userJson.email});
    }));

app.use('/login', function(req, res, next) {
   if(req.user = req.session.user) {
      res.redirect(req.app.path() + '/');
   }
   else {
      next();
   }
});

app.get('/', function(req, res) {
   res.send(req.user);
});

module.exports = app;
