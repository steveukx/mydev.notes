
var Commands = require('commands');
var express = require('express');
var app = express();

app.set('database', require('./database'));

app.use(express.static(require('path').join(__dirname, '../web'),
    {maxAge: process.env.NODE_ENV === 'development' ? 0 : 86400000}));

app.use('/user', require('./routes/user'));

app.listen(Commands.get('port', 9874));
