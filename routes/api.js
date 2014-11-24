

var Model_post = require('../models/thread_reply.js');

var Model_thread_op = require('../models/thread_op.js');

/**
 * Create a log entry
 */

exports.threadlist = function(req, res, next) {
	
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

	//var thread_id=JSON.stringify(req.body)

	Model_thread_op.find(function (err, db_threads) {
		if (err) return console.error(err);

		var ret_threadlist = JSON.parse(JSON.stringify(db_threads));
		console.log(db_threads);
		done(db_threads);
	});
}

exports.thread = function(req, res, next) {
	
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
	
	var thread_id = req.params.id;

	var requested_thread = {};

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

	//var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var ip = req.ip;

	/*
	var instance = new Model_thread_op({
		_id: Number,						// Post ID
		board: 'v',						// Board posted on
		date: new Date(),							// Post Date
		last_reply: new Date(),					// Last reply Date

		total_replies: Number,				// Total posts in thread
		total_files: Number,				// Total media linked in thread

		author: ip,
		name: String,						// Poster Name
		files: Array,						// Post Media

		subject: String,					// Poster IP
		body: String						// Post body
	}, function (err, small) {
		if (err) return handleError(err);
		// saved!
	})

	console.log(instance);

	instance.save(function (err, instance) {
	  if (err) return console.error(err);
	});
	*/

	console.log(JSON.stringify(req.body));

	console.log('req.body.name', req.body['name']);
}

exports.post_reply = function(req, res, next) {
	
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


	//TODO:: update thread's last reply date
	//TODO:: increment thread's total replies
	//TODO:: update thread's total media links
	var name = req.body.name,
		color = req.body.color;

	console.log(JSON.stringify(req.body));

	console.log('req.body.name', req.body['name']);
}
