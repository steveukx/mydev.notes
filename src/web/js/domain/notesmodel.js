define(['domain/note'], function (Note) {

   "use strict";

   /**
    *
    * @constructor
    * @name NotesModel
    */
   function NotesModel() {
      this.notes = [];
      this.notesById = {};

      this.reload();
   }

   /**
    * Utility RegExp used to determine which of the items in localStorage are actually notes - protects against
    * other apps on the same domain also using localStorage.
    * @type {RegExp}
    */
   NotesModel.prototype.keyRegex = /^note\-(\d+)$/;

   /**
    * Cache of all notes in an array
    * @type {Note[]}
    */
   NotesModel.prototype.notes = null;

   /**
    * Cache of all notes as a map with the ID of the note as the key
    * @type {Object}
    */
   NotesModel.prototype.notesById = null;

   /**
    * Used to read the localStorage database and populate the model caches
    */
   NotesModel.prototype.reload = function() {
      var key, i, l, note;

      this.notes.length = 0;
      this.notesById = {};

      for(i = 0, l = localStorage.length; i < l; i++) {
         key = localStorage.key(i);
         if(this.keyRegex.test(key)) {
            try {
               note = Note.build(JSON.parse(localStorage.getItem(key)));
               this.notes.push(note);
               this.notesById[note.id] = note;
            }
            catch (e) {}
         }
      }
   };

   NotesModel.prototype.clear = function(clearPersistence) {
      this.notes.length = 0;
      this.notesById = {};

      if(clearPersistence) {
         for(var key, note, i = localStorage.length - 1; i >= 0; i--) {
            key = localStorage.key(i);
            if(this.keyRegex.test(key)) {
               localStorage.removeItem(key);
            }
         }
      }

      return this;
   };

   /**
    * Saves the supplied content to the note with the supplied id.
    *
    * @param {String} noteContent
    * @param {String} noteId
    * @return {NotesModel} this instance for chaining
    */
   NotesModel.prototype.saveNote = function(noteContent, noteId) {
      var note = this.notesById[noteId];
      if(note) {
         note.content = noteContent;
         note.date = new Date();

         localStorage.setItem(note.id, JSON.stringify(note));
      }
      return this;
   };

   /**
    * Creates a new note with the supplied content.
    *
    * @param {String} noteContent
    * @return {NotesModel} this instance for chaining
    */
   NotesModel.prototype.addNote = function(noteContent) {
      var note;
      if(!(noteContent instanceof Note)) {
         note = new Note(noteContent, 'note-' + Date.now());
      }
      else {
         note = noteContent;
      }
      localStorage.setItem(note.id, JSON.stringify(note));

      this.notes.push(note);
      this.notesById[note.id] = note;

      return this;
   };

   /**
    * Removes a note with the supplied ID.
    *
    * TODO: save a reference to the ID being deleted in the localStorage so that the removal can be synchronised to other devices
    *
    * @param {String} noteId
    * @return {NotesModel} this instance for chaining
    */
   NotesModel.prototype.removeNote  = function(noteId) {
      var note = this.notesById[noteId];
      if(note) {
         var indexOf = this.notes.indexOf(note);
         if(indexOf >= 0) {
            this.notes.splice(indexOf, 1);
         }
         delete this.notesById[noteId];

         localStorage.removeItem(noteId);
      }

      return this;
   };

   /**
    *
    * @param {Function} sorterFn
    * @return
    */
   NotesModel.prototype.getSorted = function(sorterFn) {
      return this.notes.sort(sorterFn);
   };

   /**
    * Utility method for applying sorting in the notes array.
    *
    * @param {Note} noteA
    * @param {Note} noteB
    * @return {Number}
    */
   NotesModel.sortByCreatedDate = function(noteA, noteB) {
      var createdA = +noteA.id.replace(/\D/g, ''),
          createdB = +noteB.id.replace(/\D/g, '');

      return createdA > createdB ? -1 : createdA < createdB ? 1 : 0;
   };

   /**
    * Utility method for applying sorting in the notes array.
    *
    * @param {Note} noteA
    * @param {Note} noteB
    * @return {Number}
    */
   NotesModel.sortByModifiedDate = function(noteA, noteB) {
      var modifiedA = +noteA.date,
          modifiedB = +noteB.date;

      return modifiedA > modifiedB ? -1 : modifiedA < modifiedB ? 1 : 0;
   };

   return NotesModel;

});
