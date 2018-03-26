'use strict';

const Commands = require('commands');
const express = require('express');

const passport = require('passport');
const database = require('./database');

const app = express();

require('../properties').bindToExpress(app, __dirname, true);

(require('properties-reader')('src/properties/i18n.properties')).each(function (key, value) {
   key = 'i18n-' + key;
   app.set(key, app.locals[key] = value);
});

app.use(require('express-session')({
   secret: 'This is a secret',
   cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
   },
   store: require('./session'),
   resave: true,
   saveUninitialized: true
}));

app.set('production', app.locals.production = !/dev/i.test(process.env.NODE_ENV));
if (!app.get('production')) {
   app.set('version', app.locals.version = 'dev');
   app.use(require('morgan')('dev'));
   app.use(require('errorhandler')({log: true}));
   app.use('/dev', require('less-middleware')(app.get('static.content.dir')));
   app.use('/dev', express.static(app.get('static.content.dir'), {maxAge: app.get('static.content.cache')}));
}
else {
   app.use(require('morgan')('short'));
   app.set('version', app.locals.version = require('../../package.json').version);
}

app.use(passport.initialize());
app.use(passport.session());

app.set('views', require('path').join(__dirname, '../templates'));
app.set('view engine', 'mustache');
app.engine('mustache', require('hogan-middleware').__express);

app.locals.i18n = function (key) {
   var val = app.get('i18n-' + key);
   var args = arguments;

   if (/\{.+\}/.test(val)) {
      val = val.replace(/\{([^\}]+)\}/, function (_, key) {
         return this.hasOwnProperty(key) ? this[key] : '';
      }.bind(args.length === 2 && typeof args[1] === "object" ? args[1] : [].slice.call(args, 1)));
   }

   return val === undefined ? '' : val;
};

app.set('database', require('./database'));

app.use(function (req, res, next) {
   res.locals.user = req.user;
   next();
});

app.use('/', require('./routes/statics')(render));
app.use('/auth', require('./routes/auth')(render));
app.use('/notes', authorised, require('./routes/notes')(render));

app.listen(Commands.get('port', Commands.get('port', app.get('server.port'))));


function authorised (req, res, next) {
   if (!req.user) {
      req.session.loginRedirect = req.originalUrl;
      res.redirect('/auth');
   }
   else {
      next();
   }
}

function render (res, view, locals) {
   app.render(view, locals || {}, (err, html) => {
      res.send(html);
   });
}
