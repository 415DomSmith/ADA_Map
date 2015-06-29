var mongoose = require('mongoose');



var issueSchema = new mongoose.Schema({

	loc 							: {type: [Number], coordinates: [], index: '2dsphere'},
	lat 							: {type: Number, required: true},
	long 							: {type: Number, required: true},
	title 						: {type: String, required: true},
	description 			: String,
	address 					: {type: String, required: true},
	issueNum 					: Number,
	image 						: String,
	city 							: String,
	state 						: String,
	views 						: Number,
	votes 						: Number,
	voters 						: [],
	reviewed 					: Boolean,
	solved 						: Boolean,
	dateCreated 			: {type: Date, default: Date.now},
	user: {
		type 						: mongoose.Schema.Types.ObjectId,
		ref 						: 'User'
	}, 
	comments: [{
		type 						: mongoose.Schema.Types.ObjectId,
		ref 						: 'Comment'
	}]
});

issueSchema.index({loc: '2dsphere'});

// db.issues.ensureIndex( { loc : "2dsphere" } ) //Creates an index of location data in issues collection.

var Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;

// console.log(Issue);