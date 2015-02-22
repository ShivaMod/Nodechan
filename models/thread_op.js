var mongoose = require('mongoose');

var schema_thread_op = new mongoose.Schema({
	_id: Number,						// Post ID
	true_id: Number,					// Post ID
	board: String,						// Board posted on
	date: Date,						// Post Date

	subject: String,					// Poster IP
	body: String,						// Post body

	author: String,						// Poster IP
	name: String,						// Poster Name
	files: Array,						// Post Media
	
	last_reply: Date,					// Last reply Date
	total_replies: { type: Number, default: 0 },		// Total posts in thread
	total_files: { type: Number, default: 0 }		// Total media linked in thread
});

module.exports = schema_thread_op;
