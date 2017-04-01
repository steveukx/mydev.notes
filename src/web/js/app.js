define([
   './notes',
   './domain/notes-model'
], function (
   Notes,
   NotesModel
) {

   new Notes(new NotesModel).init();

});
