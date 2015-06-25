var bcrypt = require('bcrypt-nodejs');

var SWF = 10;  //salt work factor

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({

    local: {
        email: String,
        password: String,
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    comments: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Comment'
		}],
		issues: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Issue'
		}],
		walls: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Wall'
		}]
});


// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(SWF), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};


var User = mongoose.model('User', userSchema);

module.exports = User;