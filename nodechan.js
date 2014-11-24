//var request = require('request');
var express = require('express');
//var socket = require('socket.io');
var mongoose = require('mongoose');

var app = express();
var db = mongoose.connection;

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))



// board stuff
var boards=["v","pone", "boatdev"]
var board_handler = require('./routes/api.js');

for (var i = boards.length - 1; i >= 0; i--) {
	//app.get(boards[i]+'./', board_handler.index)
	console.log(boards[i])
};

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/json/threadlist.json', board_handler.threadlist)
app.get('/json/thread.:id?', board_handler.thread)
app.get('/json/posts.:id?', board_handler.posts)

app.post('/json/post_op', board_handler.post_op)
app.post('/json/post_reply', board_handler.post_reply)
/*
*/

//app.get('/people.:format?', tokenAuth, people.index);
/*
app.use(session({secret: 'pickle-juice'}))

var io = socket.listen(app);

io.sockets.on('connection', function(client) {
  client.on('answer', function(question, answer) {
	client.broadcast.emit('answer', question, answer);
  });

  client.on('question', function(question) {
	if(!client.question_asked) {
	  client.question_asked = true;
	  client.broadcast.emit('question', question);
	  // add the question to the list here
	  redisClient.lpush("questions", question);
	}
  });
});
*/
app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'))
})



var mongo_path =
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://localhost/HelloMongoose';

db.on('error', console.error);
db.once('open', function() {
});

mongoose.connect(mongo_path, function (err, res) {
	if (err) {
		console.log ('ERROR connecting to: ' + mongo_path + '. ' + err);
	} else {
		console.log ('Succeeded connected to: ' + mongo_path);
	}
});


var Model_post = require('./models/thread_reply.js');

var Model_thread_op = require('./models/thread_op.js');
