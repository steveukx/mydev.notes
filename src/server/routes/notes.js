
var app = module.exports = require('express')();

app.use(function (req, res, next) {
    if (!req.user) {
        req.session.loginRedirect = req.originalUrl;
        res.redirect('/auth');
    }
    else {
        next();
    }
});

app.param('note', function(req, res, next, note) {
    req.app.get('database').findOne({ user: req.session.user.id, id: note }, function(err, doc) {
        req.note = doc || null;
        next();
    })
});

app.get('/:note', function(req, res) {
    res.send(req.note || null, req.note ? 200 : 404);
});

app.delete('/:note', function(req, res) {
    req.note && req.note.delete();
    res.send({ result: true });
});

app.put('/:note', function(req, res) {
    var note = req.note || req.app.get('database')({ user: req.user, id: req.params.note });
    note.text(req.body.content).date = new Date(req.body.date);

    note.save(function(err) {
        res.send(err ? { result: false, error: err.toString() } : note, err ? 400 : 200);
    });
});

app.post('/', function(req, res) {
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
