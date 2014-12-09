
//var asynch = require('asynch');
var Q = require('q');
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
Schema_post.plugin(autoIncrement.plugin, { model: 'Post', field: 'true_id' });
var Model_post = connection.model('Post', Schema_post);

var Schema_thread_op = require('../models/thread_op.js');
Schema_thread_op.plugin(autoIncrement.plugin, 'ThreadOP');
Schema_thread_op.plugin(autoIncrement.plugin, { model: 'ThreadOP', field: 'true_id' });
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



//
//Aw Yeah Mr. Krabs

var settings={max_post_files:5};
console.log("\n\n\n\n\nSettings are:");
console.log(settings);
//



//
// reassign board_id's
var reassign_board=false;
if (reassign_board){

	Model_thread_op.update({}, {board:'boatdev'}, { multi: true }, function(err, numberAffected, raw) {
		if (err) {
			console.error(err);
			done(req, res, err);
		} else {
			console.log("Board IDs reassigned.");
			console.log('The number of updated documents was %d', numberAffected);
			console.log('The raw response from Mongo was ', raw);
		}

	});

}

// Update existing threads
var reparse_values=false;
if (reparse_values){

	Model_thread_op.find().sort({last_reply: 'desc'}).exec(function (err, db_threads) {
		if (err) {
			console.error(err);
			done(req, res, err);
		} else {
			console.log(db_threads);

			for (var i=0; i<db_threads.length; i++){
				var curthread_id=db_threads[i].true_id;
				//console.log("curthread_id is:");
				//console.log(curthread_id);
				var query = Model_post.find({ thread_id: curthread_id }).sort({date: 'desc'}).exec(function(err_inner, db_posts){
					if (err_inner) {
						console.error(err_inner);
						return [];
					}
					if (db_posts == undefined) db_posts=[];

					if (db_posts.length!=0){

						var inner_reply_count=0, inner_file_count=0, curthread_id=db_posts[0].thread_id;

						for (var i = db_threads.length - 1; i >= 0; i--) {
							if (db_threads[i].true_id==curthread_id){

								var inner_files=db_threads[i].files;
								console.log("\n\n\n\n\nfile list length is:");
								console.log(inner_files.length);
								inner_file_count=(inner_files.length>settings.max_post_files) ? 1 : inner_files.length;
								break;
							}
						};

						for (var i = db_posts.length - 1; i >= 0; i--) {
							inner_reply_count=inner_reply_count+1;
							inner_file_count=inner_file_count+db_posts[i].files.length;
						};

						//console.log("Posts in this thread are:");
						//console.log(db_posts);

						Model_thread_op.findOneAndUpdate({ true_id: curthread_id }, { $set: {total_replies: inner_reply_count, total_files: inner_file_count }}, {upsert: true}, function(err, usl_thread){

							if (err) {
								console.error(err);
								console.error(usl_thread);
							} else {
								//console.log(usl_thread);
							}
						});
					}

				});
				query.onReject(function (reason) {
					console.log(reason);
					return [];
					//done(req, res, []);
				});
			}
		}
	});
}
//


	
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

exports.boardlist = function(req, res, next) {

	//console.log("request is:");
	//console.log(req.params);
	//console.log(req.params);
	var find_obj={board:req.query.board_id};

	if (req.query.since_date) find_obj.since_date=req.query.since_date;

	console.log(req.query);

	console.log(find_obj);

	if (find_obj.board===undefined){
		console.log("board ID undefined, quitting");
		return;
	}

	Model_thread_op.find(find_obj).sort({last_reply: 'desc'}).exec(function (err, db_threads) {
		if (err) {
			console.error(err);
			done(req, res, err);
		} else {
			//console.log(db_threads);
			//console.log(db_threads[0].true_id);
			var new_board=[]
			var promise_list=[];

			for (var i=0; i<db_threads.length; i++){

				console.log(db_threads[i].board);

				var curthread_id=db_threads[i].true_id;
				//console.log("curthread_id is:");
				//console.log(curthread_id);
				var query = Model_post.find({ thread_id: curthread_id }).limit(3).sort({date: 'desc'}).exec(function(err_inner, db_posts){
					//console.log("boardlist loading, currently on:", curthread_id);
					if (err_inner) {
						console.error(err_inner);
						return [];
					}
					if (db_posts == undefined) db_posts=[];
					//else if (db_posts[0]== undefined) db_posts=[];

					//console.log(db_posts);
					return db_posts.reverse();
				});
				query.onReject(function (reason) {
					console.log(reason);
					return [];
					//done(req, res, []);
				});
				promise_list.push(query);
				//^TODO::This does not guarantee that post lists will be put here in the same order they were queried. This is pretty serious
			}

			Q.all(promise_list).then(function(){

				for (var i=0; i<db_threads.length; i++){
					var temp_thread = {"op":db_threads[i],"posts": promise_list[i]};
					new_board.push(temp_thread);
				}
				//console.log(new_board);
				done(req, res, new_board);
			})
		}
	});
}

exports.thread = function(req, res, next) {

	console.log("request is for thread:", req.params.thread_id);
	var curthread_id=req.params.thread_id;

	Model_thread_op.findOne({true_id:curthread_id}).exec(function (err, db_thread) {
		if (err) {
			console.error(err);
			done(req, res, err);
		} else {
			console.log("db_thread is:");
			console.log(db_thread);
			var new_board=[]
			
			var query = Model_post.find({ thread_id: curthread_id }).sort({date: 'ascending'}).exec(function(err_inner, db_posts){
				if (err) {
					console.error(err);
					done(req, res, err_inner);
					return undefined;
				}
				//console.log("query result is:", db_posts);
				if (db_posts == undefined){

					var temp_thread = {"op":db_thread,"posts": []};
				}else{

					var temp_thread = {"op":db_thread,"posts": db_posts};
				}
				//console.log("db_posts are:");
				//console.log(db_posts);
				
				//if (db_posts[0]== undefined) db_posts=[];
				//console.log("new thread is:", temp_thread);

				done(req, res, temp_thread);
			});
		}
	});
}

exports.preview = function(req, res, next) {

	console.log("request is to preview thread:", req.params.thread_id);
	var curthread_id=req.params.thread_id;

	var query = Model_post.find({ thread_id: curthread_id }).populate({ path:'true_id thread_id date author name files subject body', options: { limit: 5 } }).sort({date: 'ascending'}).exec(function(err_inner, db_posts){
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

	//For reference; board.threads[0].posts[board.threads[0].posts.length - 1].true_id
	//^Use this as start point, and fetch posts since that

	console.log("request is:", req.params.thread_id);
	var curthread_id=req.params.thread_id;

	for (var i=0; i<db_threads.length; i++){
		var curthread_id = db_threads[i].true_id+"";
		var query = Model_post.find({ thread_id: curthread_id }).sort({date: 'desc'}).exec(function(err_inner, db_posts){
			//TODO::get posts since 'date', etc, just extend the API some more
			if (err_inner) {
				console.error(err_inner);
				done(req, res, err_inner);
			}
			if (db_posts[0]== undefined) db_posts=[];
			
			//console.log(db_posts);
			done(req, res, db_posts);
		});
	}
}

exports.post_thread = function(req, res, next) {

	//var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var ip = req.ip;

	console.log(req.query);

	//return;

	var new_files = (req.query.files == [""]) ? [] : req.query.files;
	var file_num=(new_files.length>settings.max_post_files) ? 1 : new_files.length;

	console.log("for this new thread, there are this many new files:");
	console.log(file_num);
	//TODO: fix multifile upload
	var instance_thread_op = new Model_thread_op({
		board: req.query.board_id,			// Board posted on
		date: new Date(),				// Post Date
		last_reply: new Date(),				// Last reply Date

		total_replies: 0,				// Total posts in thread
		total_files: file_num,				// Total media linked in thread

		author: req.ip,					// Author's IP TODO::consider checking against proxies
		name: req.query.name,				// Poster Name
		files: new_files,				// Post Media

		subject: req.query.subject,			// Poster IP
		body: req.query.body				// Post body
	}, function (err, small) {
		if (err) return handleError(err);
		// saved!
	})

	console.log("posting thread:");
	console.log(instance_thread_op);

	instance_thread_op.save(function (err, instance_thread_op) {
		if (err) {
			console.error(err);
			done(req, res, err);
		} else {
			console.log(instance_thread_op);
			done(req, res, { 'true_id': instance_thread_op.true_id });
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

	var new_files = (req.query.files == []) ? [] : req.query.files;
	if (new_files==undefined)new_files=[]
	else {
		var new_files_num=(new_files[new_files.length-1]==undefined) ? 1 : new_files.length;
	}
	//TODO: fix multifile upload
	var instance_post = new Model_post({
		thread_id: req.query.thread_id,			// Board posted on
		date: new Date(),				// Post Date

		author: req.ip,					// Author's IP TODO::consider checking against proxies
		name: req.query.name,				// Poster Name
		files: new_files,				// Post Media

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
			Model_thread_op.findOneAndUpdate({ true_id: req.query.thread_id }, { $inc: { total_replies: 1, total_files: new_files_num}, $set: {last_reply: new Date() }}, {upsert: true}, function(err, usl_thread){

				console.log("length of new_files is:", new_files.length)
				if (err) {
					console.error(err);
					console.error(usl_thread);
					done(req, res, err);
				} else {
					var reply_submit_report={true_id: instance_post.true_id}
					done(req, res, instance_post);
				}
			});
		}
	});

	//TODO:: update thread's last reply date
	//TODO:: increment thread's total replies
	//TODO:: update thread's total media links
}

exports.del_thread = function(req, res, next) {

	var curthread_id=req.params.thread_id;
	console.log("request is to delete thread:", curthread_id);

	var authorized = false;
	if (!authorized){
		done(req, res, "I'm sorry, I can't let you do that Dave");
	}
	Model_thread_op.findOne({true_id:curthread_id}).remove(function (err, db_thread) {
		if (err) {
			console.error(err);
			done(req, res, err);
		} else {
			console.log("db_thread is:");
			console.log(db_thread);
			var new_board=[]
			
			var query = Model_post.find({ thread_id: curthread_id }).remove(function(err_inner, db_posts){
				if (err) {
					console.error(err);
					done(req, res, err_inner);
					return undefined;
				}
				//console.log("query result is:", db_posts);
				if (db_posts == undefined){

					var temp_thread = {"op":db_thread,"posts": []};
				}else{

					var temp_thread = {"op":db_thread,"posts": db_posts};
				}
				console.log("db_posts were:");
				console.log(db_posts);
				
				//if (db_posts[0]== undefined) db_posts=[];
				//console.log("new thread is:", temp_thread);

				done(req, res, temp_thread);
			});
		}
	});
}

exports.del_reply = function(req, res, next) {

}

exports.mod_thread = function(req, res, next) {

}

exports.mod_reply = function(req, res, next) {

}
