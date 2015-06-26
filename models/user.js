var bcrypt = require('bcrypt');

var SWF = 10;  //salt work factor

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
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

userSchema.pre('save', function (next){
	var user = this;
	if(!user.isModified('password')){
		return next();
	}
			return bcrypt.genSalt(SWF, function (err, salt){
				if(err){
				return next(err);
				}
					return bcrypt.hash(user.password, salt, function (err, hash){
						if(err){
							return next(err);
						}
								user.password = hash;
								return next();
					});
			});
});

<<<<<<< HEAD
// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
=======
userSchema.statics.authenticate = function (formData, callback){
	this.findOne({
		username: formData.username
	}, function (err, user){
		if (user === null){
			callback('Invalid username or password', null);
		} else {
			user.checkPassword(formData.password, callback);
		}
	});
>>>>>>> parent of f8c113a... working on passport auth
};

userSchema.methods.checkPassword = function (password, callback){
	var user = this;
	bcrypt.compare(password, user.password, function (err, isMatch){
		if (isMatch) {
			callback(null, user);
		} else {
			callback(err, null);
		}
	});
};

var User = mongoose.model('User', userSchema);

module.exports = User;