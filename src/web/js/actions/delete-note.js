define(function () {

   return function deleteNote (model, noteId) {
      if (!confirm('Are you sure you want to delete this item?')) {
         return;
      }

      model.removeNote(noteId);
   };

});
