define(function () {

   'use strict';

   return function navigateToNote (note) {
      location.hash = note.id;
   };

});
