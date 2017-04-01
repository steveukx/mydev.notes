define([
   'jquery',
   '../domain/note',
   './navigate-to-note',
   '../constants/note-events'
], function (
   jQuery,
   Note,
   navigateToNote,
   noteEvents
) {

   return function startNote (notesModel, noteContent) {
      var note = new Note(noteContent || '', 'new');

      if (notesModel) {
         notesModel.notesById[note.id] = note;

         jQuery(note).on(noteEvents.SHOWING, function (e) {
            if (notesModel.notesById[note.id] === note) {
               delete notesModel.notesById[note.id];
            }
         });
      }

      navigateToNote(note);
   };

});
