
var Crypto = require('crypto');
var Commands = require('commands');
var hashSalt = Commands.get('salt', process.env.sessionKey || 'encrypt-me');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;

var Note = new Schema({
   user: { type: String },
   id: { type: String },
   content:  { type: String },
   date: { type: Date }
});

Note.options.toObject = { transform: function(doc, transformed, options) {
   delete transformed._id;
   delete transformed.__v;
}};

Note.options.toJSON = { transform: function(doc, transformed, options) {
   transformed.content = doc.text();
   delete transformed.user;
   delete transformed._id;
   delete transformed.__v;
}};

Note.method('text', function() {
   if(!arguments.length) {
      return Crypto.createDecipher('rc4', hashSalt).update(this.content, 'hex', 'utf8');
   }
   else {
      this.content = Crypto.createCipher('rc4', hashSalt).update(arguments[0], 'utf8', 'hex');
      return this;
   }
});

module.exports = mongoose.createConnection('mongodb://localhost/mydev_notes').model('Note', Note);
