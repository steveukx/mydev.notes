'use strict';

const Commands = require('commands');
const express = require('express');
const passport = require('passport');
const subApp = require('express-subapp')();
const MongooseStore = require('mongoose-express-session')(require('express-session').Store);

// add the names of any keys in the locals of the main application that should be added to the sub apps
subApp.locals.push('version', 'i18n');

// add the names of any 'app.get' properties in the main application to be set on the sub apps
subApp.merged.push('properties', 'database');

const app = express();

require('../properties').bindToExpress(app, __dirname, true);

(require('properties-reader')('src/properties/i18n.properties')).each(function (key, value) {
   key = 'i18n-' + key;
   app.set(key, app.locals[key] = value);
});

app.use(require('express-session')({
   secret: 'keyboard cat',
   resave: false,
   rolling: false,
   saveUninitialized: true,
   store: new MongooseStore
}));

app.locals.prod = process.env.NODE_ENV !== 'development';
if (!app.locals.prod) {
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

subApp.create(app);
subApp.route('/', require('./routes/statics'));
subApp.route('/auth', require('./routes/auth'));
subApp.route('/notes', require('./routes/notes'));

app.listen(Commands.get('port', Commands.get('port', app.get('server.port'))));
