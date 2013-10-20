
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;

mongoose.connect('mongodb://localhost/mydev_notes');

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
   delete transformed.user;
   delete transformed._id;
   delete transformed.__v;
}};

module.exports = mongoose.model('Note', Note);
