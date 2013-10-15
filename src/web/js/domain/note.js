define(function () {

   "use strict";

   /**
    *
    * @constructor
    * @name Note
    */
   function Note(content, id) {
      this.content = content || '';
      this.id = id;
      this.date = new Date();
   }

   /**
    * The content of the note
    * @type {String}
    */
   Note.prototype.content = '';

   /**
    * Date last updated
    * @type {Date}
    */
   Note.prototype.date = null;

   /**
    * ID of the note
    * @type {String}
    */
   Note.prototype.id = null;

   /**
    * Create a note from some arbitrary object.
    *
    * @param {Object} json
    * @return Note
    */
   Note.build = function(json) {
      var note = new Note(json.content, json.id);
      note.date = new Date(json.date || json.updated);

      return note;
   };

   return Note;

});
