var mongoose = require('mongoose');

// Create a sequence
function sequenceGenerator(name){
  var SequenceSchema, Sequence;

  SequenceSchema = new mongoose.Schema({
    nextSeqNumber: { type: Number, default: 1 }
  });

  Sequence = mongoose.model(name + 'Seq', SequenceSchema);

  return {
    next: function(callback){
      Sequence.find(function(err, data){
        if(err){ throw(err); }

        if(data.length < 1){
          // create if doesn't exist create and return first
          Sequence.create({}, function(err, seq){
            if(err) { throw(err); }
            callback(seq.nextSeqNumber);
          });
        } else {
          // update sequence and return next
          Sequence.findByIdAndUpdate(data[0]._id, { $inc: { nextSeqNumber: 1 } }, function(err, seq){
            if(err) { throw(err); }
            callback(seq.nextSeqNumber);
          });
        }
      });
    }
  };
}


// sequence instance
var sequence = sequenceGenerator('issue');

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

issueSchema.pre('save', function (next){
	var doc = this;
	// get the next sequence
  sequence.next(function(nextSeq){
    doc.issueNum = nextSeq;
    next();
  });
})

// db.issues.ensureIndex( { loc : "2dsphere" } ) //Creates an index of location data in issues collection.

var Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;

// console.log(Issue);