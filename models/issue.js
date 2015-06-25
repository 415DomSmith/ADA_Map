var mongoose = require('mongoose');

var issueSchema = new mongoose.Schema({
	title: {type: String, required: true},
	description: String,
	address: {type: String, required: true},
	lat: {type: Number, required: true},
	long: {type: Number, required: true},
	issueNum: Number,
	image: String,
	city: String,
	state: String,
	views: Number,
	liked: [],
	votes: Number,
	reviewed: Boolean,
	solved: Boolean,
	dateCreated: {type: Date, default: Date.now},
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