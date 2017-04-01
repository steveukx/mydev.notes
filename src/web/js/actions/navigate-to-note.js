define(function () {

   'use strict';

   return function navigateToNote (note) {
      location.hash = typeof note === 'string' ? note : note.id;
   };

});
