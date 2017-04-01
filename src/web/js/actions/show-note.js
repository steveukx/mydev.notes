define([
   'jquery',
   '../constants/css-selectors',
   '../constants/note-events'
], function (
   jQuery,
   cssSelectors,
   noteEvents
) {

   return function showNote (note) {
      jQuery(cssSelectors.EDITOR).val(note ? note.content : '');

      document.body.className = 'showing-form';

      if (note) {
         jQuery(note).trigger(noteEvents.SHOWING);
      }
   };

});
