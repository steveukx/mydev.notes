define(['jquery', 'domain/note', 'domain/notesmodel'], function(jQuery, Note, NotesModel) {

   "use strict";

   function Notes(notesModel) {
      Notes.instance = this;
      this._model = notesModel;
      this.init = this._init.bind(this);
   }

   /**
    * Shows the editor for the note with the supplied note ID
    * @param noteId
    */
   Notes.prototype.showNote = function(noteId) {
      var note = this._editingNote = this._model.notesById[noteId];
      jQuery('textarea').val(note ? note.content : '');

      document.body.className = 'showing-form';
   };

   /**
    * Draws the notes list
    */
   Notes.prototype.showList = function() {
      var notes = this._model.getSorted(NotesModel.sortByModifiedDate);

      var ul = jQuery('#notes-list ul').detach().empty();

      ul.append(
          jQuery('<li />')
              .append('<a class="button" href="#new">Create New</a>')
              .append('<a class="button" href="#sync">Synchronise</a>')
      );

      for (var i = 0, l = notes.length; i < l; i++) {
         ul.append(
             jQuery('<li><a href="#"></a></li>')
                 .find('a')
                 .attr('href', '#' + notes[i].id)
                 .text(notes[i].content)
                 .end()
         );
      }

      ul.appendTo('#notes-list');

      document.body.className = 'showing-notes';
   };

   /**
    * Attaches any application-life level events as delegates on the DOM or window
    */
   Notes.prototype._initEvents = function() {
      jQuery('#editor .button.cancel').on('click', this.showList.bind(this, false));
      jQuery('#editor .button.save').on('click', this._handleSaveClicked.bind(this));
      jQuery(window).on('hashchange', this._handleHashChange.bind(this));

      jQuery('#doSync').on('click', this._doSync.bind(this));
   };

   /**
    * Sets up any content in the DOM
    */
   Notes.prototype._initDom = function() {
   };

   /**
    * Run the various initialisation methods
    */
   Notes.prototype._init = function() {
      this._initDom();
      this._initEvents();
      this._handleHashChange();
   };

   Notes.prototype._handleSaveClicked = function() {
      var newVal = jQuery('textarea').val();

      // editing an existing note - decide whether to update or delete it
      if (this._editingNote) {
         if (newVal) {
            this._model.saveNote(newVal, this._editingNote.id);
         }
         else if (confirm('Are you sure you want to delete this item?')) {
            this._model.removeNote(this._editingNote.id);
         }
      }

      else if (newVal) {
         this._model.addNote(newVal);
      }

      this.showList();
   };

   Notes.prototype._doSync = function(e) {
      e.preventDefault();
      var notesModel = this._model;

      jQuery.ajax('/user/ping', { error: Notes.login })
          .then(
             function() {
                jQuery.ajax('/user/notes', {
                   type: 'POST',
                   contentType: 'application/json',
                   data: JSON.stringify({ notes: notesModel.notes }),
                   success: function(data) {
                      notesModel.clear(true); // kill any existing notes
                      for(var noteId in data) {
                         var note = data[noteId];
                         notesModel.addNote(new Note(note.content, noteId).withDate(note.date));
                      }
                      location.hash = '#list';
                   }
                });
             },
            function() {
               location.href = '/user/';
            }
         );
   };

   Notes.prototype._handleHashChange = function() {
      this.revealAllSections();

      var hash = ('' + location.hash).replace(/^.*#/, '');
      if (this._model.keyRegex.test(hash) || hash == 'new') {
         this.showNote(hash);
      }
      else if (document.getElementById(hash)) {
         var contentElement = document.getElementById(hash);
         document.body.className = contentElement.getAttribute('data-body-class');
      }
      else {
         this.showList();
      }

      this.delayTidyUpSections();
   };

   Notes.prototype.revealAllSections = function() {
      jQuery('section').css('display', '');
   };

   Notes.prototype.delayTidyUpSections = function() {
      setTimeout(function() {
         var bodyClass = document.body.className;
         jQuery('section').each(function() {
            var requiredClass = this.getAttribute('data-body-class');
            if (requiredClass && bodyClass.indexOf(requiredClass) < 0) {
               this.style.display = 'none';
            }
         })
      }, 350);
   };

   Notes.login = function() {
      location.href = '/user/login?next=' + encodeURIComponent(location.href);
   };

   return Notes;

});
