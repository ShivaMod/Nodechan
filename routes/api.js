
//var asynch = require('asynch');
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
Schema_thread_op.plugin(autoIncrement.plugin, 'ThreadOP');
var Model_thread_op = connection.model('ThreadOP', Schema_thread_op);

/*
connection.db.dropDatabase();
//Note: ^This didn't work


Model_post.remove({}, function(err) { 
   console.log('collection removed') 
});
Model_thread_op.remove({}, function(err) { 
   console.log('collection removed') 
});
*/

	
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
 * Nodechan API
 */

exports.threadlist = function(req, res, next) {

	Model_thread_op.find().sort({date: 'desc'}).exec(function (err, db_threads) {
		if (err) {
			console.error(err);
			done(req, res, err);
		} else {
			//console.log(db_threads);
			var new_board=[]
			for (var i=0; i<db_threads.length; i++){
				var temp_thread = {"op":db_threads[i],"posts": []};
				new_board.push(temp_thread);
			}
			console.log(new_board);
			done(req, res, new_board);
		}
	});
}

exports.thread = function(req, res, next) {

	console.error("request is:", req.params.thread_id);
	var curthread_id=req.params.thread_id;

	Model_thread_op.findOne({_id:curthread_id}).exec(function (err, db_thread) {
		if (err) {
			console.error(err);
			done(req, res, err);
		} else {
			console.log(db_thread);
			var new_board=[]
			
			var query = Model_post.find({ thread_id: curthread_id }).sort({date: 'desc'}).exec(function(err_inner, db_posts){
				if (err) {
					console.error(err);
					done(req, res, err_inner);
					return undefined;
				}
				console.log("query result is:", db_posts);
				if (db_posts == undefined){

					var temp_thread = {"op":db_thread,"posts": []};
				}else{

					var temp_thread = {"op":db_thread,"posts": db_posts};
				}
				//if (db_posts[0]== undefined) db_posts=[];
				console.log("new thread is:", temp_thread);
				done(req, res, temp_thread);
			});
		}
	});
}

exports.preview = function(req, res, next) {

	console.log("request is:", req.params.thread_id);
	var curthread_id=req.params.thread_id;

	var query = Model_post.find({ thread_id: curthread_id }).populate({ path:'_id thread_id date author name files subject body', options: { limit: 5 } }).sort({date: 'desc'}).exec(function(err_inner, db_posts){
		if (err_inner) {
			console.error(err_inner);
			done(req, res, err_inner);
			return;
		}
		if (db_posts == undefined) db_posts=[];
		//else if (db_posts[0]== undefined) db_posts=[];

		console.log(db_posts);
		done(req, res, db_posts);
	});
	query.onReject(function (reason) {
		console.log(reason);
		//done(req, res, []);
	});
}

exports.posts = function(req, res, next) {

	console.log("request is:", req.params.thread_id);
	var curthread_id=req.params.thread_id;

	for (var i=0; i<db_threads.length; i++){
		var curthread_id = db_threads[i]._id+"";
		var query = Model_post.find({ thread_id: curthread_id }).sort({date: 'desc'}).exec(function(err_inner, db_posts){
			//TODO::get posts since 'date', etc, just extend the API some more
			if (err_inner) {
				console.error(err_inner);
				done(req, res, err_inner);
			}
			if (db_posts[0]== undefined) db_posts=[];
			
			console.log(db_posts);
			done(req, res, db_posts);
		});
	}
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
}
