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
    * @type {boolean} Flag showing whether the local data has been changed
    */
   Note.prototype.dirty = false;

   /**
    * @type {boolean} Flag showing whether the local instance has attempted to delete the Note
    */
   Note.prototype.removed = false;

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
    * Chainable date setter
    * @param {Date|Number|String} date
    */
   Note.prototype.withDate = function(date) {
      this.date = date instanceof Date ? date : new Date(date);
      return this;
   };

   /**
    * Removes any note content and sets flags appropriate to say that this note should be removed
    * @returns {Note}
    */
   Note.prototype.setRemoved = function() {
      delete this.content;
      this.removed = this.dirty = true;
      return this;
   };

   /**
    * Updates the content of the note and sets flags appropriate for a note having been modified
    * @returns {Note}
    */
   Note.prototype.setContent = function (content) {
      this.content = content;
      this.date = new Date();
      this.dirty = true;

      return this;
   };

   /**
    * Create a note from some arbitrary object.
    *
    * @param {Object} json
    * @return Note
    */
   Note.build = function(json) {
      var note = new Note(json.content, json.id);
      note.date = new Date(json.date || json.updated);

      json.dirty && (note.dirty = true);
      json.removed && (note.removed = true);

      return note;
   };

   return Note;

});
