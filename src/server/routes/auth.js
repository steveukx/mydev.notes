
module.exports = routing;

var Crypto = require('crypto');
var Commands = require('commands');
var hashSalt = Commands.get('salt', process.env.sessionKey);

var properties = require('properties-reader')('src/properties/auth.properties');
var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

function User (profile) {
    var email = (Array.isArray(profile.emails) ? profile.emails[0] : profile.emails || profile.email) || null;
    var id = email || profile.id;

    if (typeof id === "object" && id && id.value) {
        id = id.value;
    }

    this.id = typeof profile === "string" ? profile : Crypto.createHash('sha1')
        .update(id + hashSalt, 'utf8')
        .digest('base64');
}

// converts the complete user to just the detail that will be saved to the user session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// converts the session stored value back into a complete user object
passport.deserializeUser(function(id, done) {
    done(null, new User(id));
});

// Facebook strategy
passport.use(new FacebookStrategy({
    clientID: properties.get('facebook.client.id'),
    clientSecret: properties.get('facebook.client.secret'),
    callbackURL: properties.get('auth.host') + '/facebook/callback'
}, function (accessToken, refreshToken, profile, done) {
    done(null, new User(profile));
}));

// Google oAuth2 strategy
passport.use(new GoogleStrategy({
        clientID: properties.get('google.client.id'),
        clientSecret: properties.get('google.client.secret'),
        callbackURL: properties.get('auth.host') + '/google/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        done(null, new User(profile));
    }
));

var authenticatedRequestHandler = function (req, res) {
    res.redirect(req.session.loginRedirect || '/');
};

function routing (render) {
   const app = express();

   app.get('/facebook', passport.authenticate('facebook', { scope: [] }));
   app.get('/facebook/callback',
      passport.authenticate('facebook', { failureRedirect: '/login' }), authenticatedRequestHandler);

   app.get('/google', passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/userinfo.email' }));
   app.get('/google/callback',
      passport.authenticate('google', { failureRedirect: '/login' }), authenticatedRequestHandler);

   app.get('/', function (req, res) {
      render(res, 'login');
   });

   return app;
}


