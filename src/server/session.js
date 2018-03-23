const properties = require('../properties');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
   uri: properties['db.connection'],
   databaseName: properties['db.database'],
   collection: properties['db.session.collection']
});

store.on('error', function (error) {
   console.error(error);
});

module.exports = store;
