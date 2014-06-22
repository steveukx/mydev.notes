
var Crypto = require('crypto');
var Commands = require('commands');
var hashSalt = Commands.get('salt', process.env.sessionKey);
var Session = require('session-middleware');
var GoogleAuth = require('gauth');
var googleAuth = new GoogleAuth(
                        GoogleAuth.configure('base.url', Commands.get('base', 'http://localhost:9874/user/login')),
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

app.use(Session.middleware("encrypt-me-" + hashSalt));
app.use(express.bodyParser());
app.param('note', function(req, res, next, note) {
   req.app.get('database').findOne({ user: req.session.user.id, id: note }, function(err, doc) {
      req.note = doc || null;
      next();
   })
});

app.use('/ping', function(req, res) {
   var loggedIn = !!req.session.user;
   res.send({ result: loggedIn }, loggedIn ? 200 : 401);
});

app.use(function(req, res, next) {
   req.user = req.session.user;
   console.log(req.method, req.url, req.session.user);

   if(!req.user && req.url.indexOf('/login') !== 0) {
      res.redirect(req.app.path() + '/login');
   }

   next();
});

app.use('/login', googleAuth.middleware(function(userJson, next) {
      next(null, {
         id: Crypto.createHash('sha1').update(userJson.email + hashSalt, 'utf8').digest('base64')
      });
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
   res.redirect('../');
});

app.get('/notes/:note', function(req, res) {
   res.send(req.note || null, req.note ? 200 : 404);
});

app.delete('/notes/:note', function(req, res) {
   req.note && req.note.delete();
   res.send( { result: true });
});

app.put('/notes/:note', function(req, res) {
   var note = req.note || req.app.get('database')( { user: req.user, id: req.params.note });
   note.text(req.body.content).date = new Date(req.body.date);

   note.save(function(err) {
      res.send(err ? { result: false, error: err.toString() } : note, err ? 400 : 200);
   });
});

app.post('/notes', function(req, res) {
   var clientNotes = req.body.notes;
   var user = req.user.id;
   var Note = req.app.get('database');

   Note.find({ user: user }, function(err, serverNotes) {
      var notes = (serverNotes || []).reduce(function(notes, note) {
         notes[note.id] = note;
         return notes;
      }, {});

      if(Array.isArray(clientNotes)) {
         clientNotes.forEach(function(clientNote) {
            var clientId = clientNote.id;
            var serverNote = notes[clientNote.id];
            var clientDate = new Date(clientNote.date);
            var invalidDate = isNaN(+clientDate);
            var isDeleted = clientNote.removed;

            if (isDeleted) {
                if (serverNote) {
                    serverNote.remove();
                    delete notes[clientId];
                }
            }

            else if(invalidDate || !notes[clientId] || notes[clientId].date < clientDate) {
               var note = notes[clientId] = notes[ clientId] || Note({ user: user, id: clientId });
               note.date = invalidDate ? new Date() : clientDate;
               note.text(clientNote.content).save();
            }
         });
      }

      res.send(notes);
   });
});

module.exports = app;
