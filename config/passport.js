var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function (passport){
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
        done(null, user.id);
  });

  	// used to deserialize the user
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
  	usernameField : 'email',
  	passwordField : 'password',
  	passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function (req, email, password, done) { // User.findOne wont fire unless data is sent back
  	process.nextTick(function(){
  		User.findOne({ 'local.email' : email}, function (err, user){// find a user whose email is the same as the forms email // we are checking to see if the user trying to login already exists
        
  			if (err){
  				return done(err);
  			} else if (user) { // check to see if theres already a user with that email
  				return done(null, false, req.flash('signupMessage', 'That email address is already taken'));
  			} else { // if there is no user with that email, create one
  				newUser.save(function(err){
  					if (err){
  						throw err;
  					} else {
  						return done(null, newUser);
  					}
  				});
  			}
  		});
  	});
  }));

};