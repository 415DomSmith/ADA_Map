var mongoose = require('mongoose');

var issueSchema = new mongoose.Schema({
	title: String,
	description: String,
	address: String,
	lat: Number,
	long: Number,
	issueNum: Number,
	image: String,
	city: String,
	views: Number,
	votes: Number,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}, 
	comments: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Comment'
	}]
});

var Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;

// console.log(Issue);