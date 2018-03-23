const {createCipher, createDecipher} = require('crypto');
const hashSalt = require('commands').get('salt', process.env.sessionKey || 'encrypt-me');
const mongoose = require('mongoose');
const properties = require('../properties');

const Note = new mongoose.Schema({
   user: {type: String},
   id: {type: String},
   content: {type: String},
   date: {type: Date}
});

Note.options.toObject = {
   transform (doc, transformed, options) {
      delete transformed._id;
      delete transformed.__v;
   }
};

Note.options.toJSON = {
   transform(doc, transformed, options) {
      transformed.content = doc.text();
      delete transformed.user;
      delete transformed._id;
      delete transformed.__v;
   }
};

Note.method('text', function () {
   if (!arguments.length) {
      return createDecipher('rc4', hashSalt).update(this.content, 'hex', 'utf8');
   }

   this.content = createCipher('rc4', hashSalt).update(arguments[0], 'utf8', 'hex');
   return this;
});

module.exports = mongoose.createConnection(properties['db.connection']).model('Note', Note);
