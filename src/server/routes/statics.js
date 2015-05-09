
var app = module.exports = require('express')();

app.use(require('cacheable-middleware')());

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/ping', function (req, res) {
    res.cacheFor(0).send({
        loggedIn: !!req.user
    });
});
