var mongoose = require('mongoose');

var schema_post = new mongoose.Schema({
	_id: Number,						// Post ID
	true_id: Number,					// Post ID
	thread_id: Number,					// Thread ID
	date: Date,						// Post Date

	subject: String,					// Poster IP
	body: String,						// Post body

	author: String,						// Poster IP
	name: String,						// Poster Name
	files: Array						// Post Media
});

module.exports = schema_post;
