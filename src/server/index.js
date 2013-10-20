
var express = require('express');
var app = express();

app.set('database', require('./database'));

app.use(express.static(require('path').join(__dirname, '../web'), {maxAge: 0})); // 86400000

app.use('/user', require('./routes/user'));

app.listen(9874);
