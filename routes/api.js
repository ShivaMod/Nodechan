
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');


var mongo_path =
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://localhost/HelloMongoose';

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function() {
});


/*
mongoose.connect(mongo_path, function (err, res) {
	if (err) {
		console.log ('ERROR connecting to: ' + mongo_path + '. ' + err);
	} else {
		console.log ('Succeeded connected to: ' + mongo_path);
	}
});
*/


var connection = mongoose.createConnection(mongo_path);
autoIncrement.initialize(connection);


var Schema_post = require('../models/thread_reply.js');
Schema_post.plugin(autoIncrement.plugin, 'Post');
var Model_post = connection.model('Post', Schema_post);

var Schema_thread_op = require('../models/thread_op.js');
Schema_thread_op.plugin(autoIncrement.plugin, 'Book');
var Model_thread_op = connection.model('ThreadOP', Schema_thread_op);
	
var done = function(req, res, doc) {
	res.format({
		json: function() {
			res.jsonp(doc);
		},
		html: function() {
			return res.redirect(req.body.redirect || config.signinDefaultRedirect);
		}
	});
};


/**
 * Create a log entry
 */

exports.threadlist = function(req, res, next) {

	//var thread_id=JSON.stringify(req.body)

	Model_thread_op.find().sort({date: 'desc'}).exec(function (err, db_threads) {
		if (err) {
			console.error(err);
			done(req, res, err);
		} else {
			console.log(db_threads);
			var new_board=[]
			for (var i=0; i<db_threads.length; i++){
				var curthread_id = db_threads[i]._id+"";
				console.log("curthread_id is:", curthread_id)
				//console.log("curt dbthread_id is:", db_threads[i])
				var query = Model_post.find({ 'thread_id': curthread_id }).sort({date: 'desc'}).exec(function(err_inner, db_posts){
					if (err) {
						console.error(err);
						done(req, res, err_inner);
					}
					console.log("querry result is:", db_posts)
					if (db_posts == []) return [];
					return db_posts;
				});
				var temp_thread = {"op":db_threads[i],"posts": query};
				//console.log("temp thread is:", temp_thread);
				new_board.push(temp_thread);
			}
			//console.log(new_board);
			done(req, res, new_board);
		}
	});
}

exports.thread = function(req, res, next) {
	
	var thread_id = req.params.id;

	var thread_op={};
	var posts=[];
	var requested_thread = {"op":thread_op, "posts":posts};

	res.send(requested_thread);
}

exports.posts = function(req, res, next) {
	
	var done = function(doc) {
		res.format({
			json: function() {
				res.jsonp(doc);
			},
			html: function() {
				return res.redirect(req.body.redirect || config.signinDefaultRedirect);
			}
		});
	};
}

exports.post_op = function(req, res, next) {

	//var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var ip = req.ip;

	console.log(req.query);

	//return;

	var instance_thread_op = new Model_thread_op({
		board: 'v',					// Board posted on
		date: new Date(),				// Post Date
		last_reply: new Date(),				// Last reply Date

		total_replies: 0,				// Total posts in thread
		total_files: req.query.files.length,		// Total media linked in thread

		author: req.ip,					// Author's IP TODO::consider checking against proxies
		name: req.query.name,				// Poster Name
		files: req.query.files,				// Post Media

		subject: req.query.subject,			// Poster IP
		body: req.query.body				// Post body
	}, function (err, small) {
		if (err) return handleError(err);
		// saved!
	})

	console.log(instance_thread_op);

	instance_thread_op.save(function (err, instance_thread_op) {
		if (err) {
			console.error(err);
			done(req, res, err);
		} else {
			done(req, res, instance_thread_op);
		}
	});

	/*
	*/
}

exports.post_reply = function(req, res, next) {

	//var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var ip = req.ip;

	console.log(req.query);

	//return;

	var instance_post = new Model_post({
		thread_id: req.query.thread_id,			// Board posted on
		date: new Date(),				// Post Date

		author: req.ip,					// Author's IP TODO::consider checking against proxies
		name: req.query.name,				// Poster Name
		files: req.query.files,				// Post Media

		subject: req.query.subject,			// Poster IP
		body: req.query.body				// Post body
	}, function (err, small) {
		if (err) return handleError(err);
		// saved!
	})

	console.log(instance_post);

	instance_post.save(function (err, instance_post) {
		if (err) {
			console.error(err);
			done(req, res, err);
		} else {
			done(req, res, instance_post);
		}
	});

	//TODO:: update thread's last reply date
	//TODO:: increment thread's total replies
	//TODO:: update thread's total media links
	var name = req.body.name,
		color = req.body.color;

	console.log(JSON.stringify(req.body));

	console.log('req.body.name', req.body['name']);
}
