
var app = module.exports = require('express')();

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/ping', function (req, res) {
    res.send({
        loggedIn: !!req.user
    });
});
