//var request = require('request');
var express = require('express');
//var socket = require('socket.io');

var app = express();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))



// board stuff
var boards=["v","pone", "boatdev"]
var board_handler = require('./routes/api.js');

/*
for (var i = boards.length - 1; i >= 0; i--) {
	//app.get(boards[i]+'./', board_handler.index)
	console.log(boards[i])
};
*/

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/json/threadlist.json', board_handler.threadlist)
app.get('/json/thread.:thread_id?', board_handler.thread)
app.get('/json/posts.:thread_id?.preview', board_handler.preview)
app.get('/json/posts.:thread_id?.posts', board_handler.posts)

app.get('/json/updated_threads_since.:date?', board_handler.posts)

app.post('/json/post_thread', board_handler.post_thread)
app.post('/json/post_reply', board_handler.post_reply)

app.post('/json/del_thread.:thread_id?', board_handler.del_thread)
app.post('/json/del_reply.:post_id?', board_handler.del_reply)

app.post('/json/mod_thread.:thread_id?', board_handler.mod_thread)
app.post('/json/mod_reply.:post_id?', board_handler.mod_reply)

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


