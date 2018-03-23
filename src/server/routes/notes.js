'use strict';

const express = require('express');
const noteModel = require('../database');

const REQUEST_MAX_SIZE = require('../../properties')['request.max.size'];

module.exports = function () {

   const app = express();

   app.param('note', function (req, res, next, note) {
      noteModel.findOne({user: req.session.user.id, id: note}, function (err, doc) {
         req.note = doc || null;
         next();
      })
   });

   app.get('/:note', function (req, res) {
      res.send(req.note || null, req.note ? 200 : 404);
   });

   app.delete('/:note', function (req, res) {
      req.note && req.note.delete();
      res.send({result: true});
   });

   app.put('/:note', function (req, res) {
      let note = req.note || noteModel({user: req.user, id: req.params.note});
      note.text(req.body.content).date = new Date(req.body.date);

      note.save(function (err) {
         res.send(err ? {result: false, error: err.toString()} : note, err ? 400 : 200);
      });
   });

   app.post('/', require('body-parser').json({limit: REQUEST_MAX_SIZE}), function (req, res) {
      const clientNotes = req.body.notes;
      const user = req.user.id;

      noteModel.find({user: user}, function (err, serverNotes) {
         let notes = (serverNotes || []).reduce(function (notes, note) {
            notes[note.id] = note;
            return notes;
         }, {});

         if (Array.isArray(clientNotes)) {
            clientNotes.forEach(function (clientNote) {
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

               else if (invalidDate || !notes[clientId] || notes[clientId].date < clientDate) {
                  let note = notes[clientId] = notes[clientId] || noteModel({user: user, id: clientId});
                  note.date = invalidDate ? new Date() : clientDate;
                  note.text(clientNote.content).save();
               }
            });
         }

         res.send(notes);
      });
   });

   return app;

};
