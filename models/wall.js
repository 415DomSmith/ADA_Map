var mongoose = require('mongoose');

var wallSchema = new mongoose.Schema({
	wallMessage: String,
	messagDate: {type: Date, default: Date.now},
	wallActivity: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Issue'
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
});
	
var Wall = mongoose.model('Wall', wallSchema);

module.exports = Wall;

// console.log(Wall);