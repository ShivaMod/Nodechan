var express = require('express');
//var socket = require('socket.io');
var mongoose = require('mongoose');

var app = express();
var db = mongoose.connection;

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

var boards=["v","pone", "boatdev"]


// Controllers
//var people = require('./routes/boards');
/*
for (var i = boards.length - 1; i >= 0; i--) {
	app.get(boards[i]+'.localhost:5000/', function (req, res) {
		res.send('Hello World!');
	})
};
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

var schema_thread_post = new mongoose.Schema({
	author: String,					// Poster IP
	date: { type: Date, default: Date.now },	// Post Date
	files: Array,					// Post Image
	id: Number,					// Post ID
	body: String					// Post body
});
var model_thread_post = mongoose.model('Post', schema_thread_post);

var schema_thread_op = new mongoose.Schema({
	author: String,					// Poster IP
	date: { type: Date, default: Date.now },	// Post Date
	img: String,					// Post Image
	id: Number,					// Post ID
	body: String					// Post body
});
var model_thread_op = mongoose.model('ThreadOP', schema_thread_post);
