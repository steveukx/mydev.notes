define([
   './notes',
   './domain/notesmodel'
], function (
   Notes,
   NotesModel
) {

   new Notes(new NotesModel).init();

});
