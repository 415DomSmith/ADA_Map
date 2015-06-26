// =====================================
// WELCOME TO ADAMAP ===================
// =====================================
// TODO - Look up licensing stuff to put in here
  


// =====================================
// DEPENDENCIES ========================
// =====================================
    require('dotenv').load();
    require('./config/passport')(passport); 
var express = require('express'),
    app = express(),
    passport = require('passport'),
    db = require("./models"),
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = ('express-session'),
    methodOverride = require("method-override"),
    favicon = require('serve-favicon'),
    morgan = require("morgan"),
    request = require('request');
    // loginMiddleware = require("./middleware/loginHelper"),
    // routeMiddleware = require("./middleware/routeHelper"),
    // session = require("cookie-session"),

    // configDB = require('./config/database.js');

// =====================================
// CONFIG STUFF ========================
// =====================================
    
require('/config/passport')(passport); 
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(morgan('tiny'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(favicon(__dirname + '/public/favicon.ico'));

// =====================================
// PASSPORT STUFF ======================
// =====================================
// required for passport

app.use(session({ secret: 'adaboyadamap' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
// FacebookStrategy = require('passport-facebook').Strategy,

// =====================================
// ROUTE MIDDLEWARE ====================
// =====================================

  passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
  passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

function isLoggedIn (req, res, next){
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/')
  }
}

passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

        });

    }));


  // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));


// =====================================
// ROUTES ==============================
// =====================================
require('./config/routes.js')(app, passport);



//TODO - Figure out what it will take to deploy to Heroku, and what needs to change here
// =====================================
// SERVER START ========================
// =====================================
app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});

