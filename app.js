<<<<<<< HEAD
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
=======
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    db = require("./models"),
    methodOverride = require("method-override"),
    session = require("cookie-session")
    favicon = require('serve-favicon'),
    morgan = require("morgan"),
    request = require('request'),
    loginMiddleware = require("./middleware/loginHelper"),
    routeMiddleware = require("./middleware/routeHelper"),

    gk = 'AIzaSyAeeC94VEj-4SfsDUOOhqnRjIo-KnbK1Mw';
>>>>>>> parent of f8c113a... working on passport auth


<<<<<<< HEAD
// =====================================
// CONFIG STUFF ========================
// =====================================
    
require('/config/passport')(passport); 
=======

var issueNum = 1000;    



>>>>>>> parent of f8c113a... working on passport auth
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(morgan('tiny'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(loginMiddleware);

<<<<<<< HEAD
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
=======

//root and index page
app.get('/', function (req,res){
  db.Issue.find({}, function (err, issues){
    res.format({
      'text/html': function(){
        res.render('landing', {issues : issues})
      },
      'application/json': function(){
        res.send({issues : issues});
      },
      'default': function(){
        res.status(406).send('Error. Please Try Again')
      }
    })
  }); 
});

//issues index
app.get('/issues', function (req,res){
 db.Issue.find({}, function (err, issues){
    res.format({
      'text/html': function(){
        res.render('issues/index', {issues : issues})
      },
      'application/json': function(){
        res.send({issues : issues});
      },
      'default': function(){
        res.status(406).send('Error. Please Try Again')
      }
    })
  }); 
});

//create a new issue -- this is targeted from both the issues index page AND the landing page 
app.post('/issues', function (req,res){ 
  if (req.body.issue.address === '' || req.body.issue.title === '') {
    res.send('Address and Title fields must be completed')
  } else {
    var address = encodeURIComponent(req.body.issue.address);
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
      request.get(url + address + gk, function (error, response, resBody){
        if (error || JSON.parse(resBody).status === 'ZERO_RESULTS'){
          console.log(error);
          res.send('Address not found, please re-structure the address search and try again')
        } else if (!error && response.statusCode === 200){
          results = JSON.parse(resBody);
            if (results.results[0].formatted_address === null){
              var address = 'Address unknown';
            } else {
              var address = results.results[0].formatted_address;
            }
          var lat = results.results[0].geometry.location.lat;
          var long = results.results[0].geometry.location.lng;
          
          var issue = new db.Issue(req.body.issue);
          issueNum++;
          issue.lat = lat;
          issue.long = long;
          issue.address = address;
          issue.issueNum = issueNum;
          issue.reviewed = false;
          issue.solved = false;
          issue.views = 0;
          issue.votes = 1;
       // issue.user = req.session.id;

          issue.save(function (err, issue){
            res.format({
              'text/html': function(){ 
                res.redirect("/issues");
              },
              'application/json': function(){
                res.send({issue : issue});
              },
              'default': function() {
                res.status(406).send('Not Accepted');
              }
            })  
          })
        } 
      })
  }         
});

//new
app.get('/issues/new', function (req,res){
  res.render('issues/new');
});

//individual issue page with comments
app.get('/issues/:id/', function (req,res){
    db.Issue.findById(req.params.id).populate('comments').populate('user').exec(function (err,issue){
    console.log(issue);
    res.render("issues/show", {issue : issue});
  });
});

//issue edit page
app.get('/issues/:id/edit', function (req,res){
  db.Issue.findById(req.params.id, function (err,issue){
    res.render("issues/edit", {issue : issue});
  });
});

//issue update
app.put('/issues/:id', function (req,res){
  db.Issue.findByIdAndUpdate(req.params.id, req.body.issue, function (err,issue){
    res.redirect('/issues');
  });
});

//issue delete
app.delete('/issues/:id', function (req,res){
  db.Issue.findByIdAndRemove(req.params.id, function (err,issue){  
    res.redirect('/issues');
  });
});



//-----comments----- STRETCH GOAL//






//catch all
app.get('*', function(req,res){
  res.render('errors/404');
});

//server start
>>>>>>> parent of f8c113a... working on passport auth
app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});

