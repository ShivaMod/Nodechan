var mongoose = require('mongoose');

var schema_thread_op = new mongoose.Schema({
	_id: Number,						// Post ID
	board: String,						// Board posted on
	date: Date,							// Post Date
	last_reply: Date,					// Last reply Date

	total_replies: Number,				// Total posts in thread
	total_files: Number,				// Total media linked in thread

	author: String,						// Poster IP
	name: String,						// Poster Name
	files: Array,						// Post Media

	subject: String,					// Poster IP
	body: String						// Post body
});

module.exports = mongoose.model('ThreadOP', schema_thread_op);
