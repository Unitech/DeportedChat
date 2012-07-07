
/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();

// Configuration
var RedisStore = require('connect-redis')(express);
var MemStore = express.session.MemoryStore;

ABSOLUTE_URL = 'http://localhost:3000'; 

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    app.use(express.cookieParser());
    app.use(express.session({ secret: "lolkeyboard cat", store: new RedisStore }));

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Routes

var index = 0;
var util = require('util');

app.get('/', function(req, res){
    if (!req.session.user) {
	req.session.user = 'FC' + index++;
    }
    res.render('index', { username : req.session.user })
});

app.get('/chat.js', function(req, res){
    if (!req.session.user) {
	req.session.user = 'FC' + index++;
    }

    res.render('chat', {layout : false,
			username : req.session.user,
			ABSOLUTE_URL : 'http://' + req.headers.host});
});


app.listen(3001);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// ------------------------------------------------------- //

var nowjs = require("now", {});

var everyone = nowjs.initialize(app);

everyone.now.distributeMessage = function(message){
    everyone.now.receiveMessage(this.now.name, message);
};
