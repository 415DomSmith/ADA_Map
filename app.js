// =====================================
// WELCOME TO ADAMAP ===================
// =====================================
// TODO - Look up licensing stuff to put in here
  


// =====================================
// DEPENDENCIES ========================
// =====================================

require('dotenv').load();
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var db 			 = require("./models");
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var favicon 		 = require('serve-favicon');

var request 		 = require('request');


// =====================================
// CONFIGURATION =======================
// =====================================

require('./config/passport')(passport); // pass passport for configuration

// set up express application
app.use(morgan('tiny')); 
app.use(cookieParser()); // read cookies (needed for auth)
// app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs'); 

// required for passport
app.use(session({ secret: 'adaboyadamap' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// =====================================
// RANDO STUFF =========================
// =====================================

var gk = 'AIzaSyAeeC94VEj-4SfsDUOOhqnRjIo-KnbK1Mw'
var issueNum = 1000;

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

// routes ======================================================================


// =====================================
// ROOT AND LANDING PAGE ===============
// =====================================
  app.get('/', function (req,res){
    db.Issue.find({}).populate('user').exec(function (err, issues){
      res.format({        
        'text/html': function(){
          if (req.session.passport.user == null){
            // console.log('NO ONE LOGGED IN');
            res.render('landing', {issues : issues, currentUser: ""})
          } else {
            // console.log(req.session.passport.user + " IS LOGGED IN"); 
            db.User.findById(req.session.passport.user, function (err, user){
              res.render('landing', {issues : issues, currentUser: user.local.username});
            })
            
          }
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

// =====================================
// ISSUES INDEX / DATE & VOTES TABLE ===
// =====================================
  app.get('/issues', function (req,res){
    db.Issue.find({}).populate('user').exec(function (err, issues){
      db.Issue.find({}).sort({dateCreated: -1}).limit(20).populate('user').exec(function (err, dates) {
        res.format({
          'text/html': function(){
            if (req.session.passport.user == null){
              console.log('NO ONE LOGGED IN');
              res.render('issues/index', {issues : issues, dates : dates, currentUser: ""})
            } else {
              console.log(req.session.passport.user + " IS LOGGED IN"); 
              db.User.findById(req.session.passport.user, function (err, user){
                res.render('issues/index', {issues : issues, dates : dates, currentUser: user.local.username});
              })     
            }
          },
          'application/json': function(){
            res.send({issues:issues, dates:dates});
          },
          'default': function(){
            res.status(406).send('Error. Please Try Again')
          }
        })
      })
    }); 
  });

// TODO - Create Issues on landing page, get address / location on pin drag 
// =====================================
// CREATE ISSUE ========================
// =====================================
  app.post('/issues', isLoggedIn, function (req,res){ 
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
            issue.user = req.user;

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

//TODO - Format issue new page better, maybe incorporate a map?
// =====================================
// NEW ISSUE PAGE ======================
// =====================================
  app.get('/issues/new', isLoggedIn, function (req,res){
    if (req.session.passport.user == null){
              console.log('NO ONE LOGGED IN');
              res.render('issues/new', {currentUser: ""})
            } else {
              console.log(req.session.passport.user + " IS LOGGED IN"); 
              db.User.findById(req.session.passport.user, function (err, user){
                res.render('issues/new', {currentUser: user.local.username});
              })     
            }
  });

//TODO - Clean up issue show EJS. Make it pretty.
// =====================================
// ISSUE SHOW PAGE =====================
// =====================================
  app.get('/issues/:id/', function (req,res){
      db.Issue.findById(req.params.id).populate('comments').populate('user').exec(function (err,issue){
        if (req.session.passport.user == null){
          console.log('NO ONE LOGGED IN');
          res.render('issues/show', {issue : issue, currentUser: ""})
        } else {
          console.log(req.session.passport.user + " IS LOGGED IN"); 
          db.User.findById(req.session.passport.user, function (err, user){
          res.render('issues/show', {issue : issue, currentUser: user.local.username});
          })     
        }
      });
  });

//TODO - Clean up edit page. Make it functional, keep in mind what user's should be able to edit and what they shouldn't.
// =====================================
// ISSUE EDIT PAGE =====================
// =====================================
  app.get('/issues/:id/edit', isLoggedIn, function (req,res){
    db.Issue.findById(req.params.id, function (err,issue){
      if (req.session.passport.user == null){
          console.log('NO ONE LOGGED IN');
          res.render('/issues/:id/edit', {issue : issue, currentUser: ""})
        } else {
          console.log(req.session.passport.user + " IS LOGGED IN"); 
          db.User.findById(req.session.passport.user, function (err, user){
          res.render('/issues/:id/edit', {issue : issue, currentUser: user.local.username});
          })     
        }
    });
  });

//TODO - Make some fields editable by Admins, and some not. Figure out how to get Admins working
// =====================================
// ISSUE UPDATE ROUTE ==================
// =====================================
  app.put('/issues/:id', isLoggedIn, function (req,res){
    res.format({
      'text/html': function(){ 
        db.Issue.findByIdAndUpdate(req.params.id, req.body.issue, function (err,issue){
        res.redirect('/issues');
        })
      },
      'application/json': function(){
          console.log(req);
        // db.Issue.findByIdAndUpdate(req.params.id,   function (err, issue){
          res.redirect('/issues');
        // })
      },
      'default': function() {
        res.status(406).send('Not Accepted');
      }
    })  
    // db.Issue.findByIdAndUpdate(req.params.id, function (err, issue){
    //   res.redirect('/issues');
    // });
  });

//TODO - Same as above, make the option to delete an issue only possible by admins
// =====================================
// ISSUE DELETE ROUTE ==================
// =====================================
  app.delete('/issues/:id', isLoggedIn, function (req,res){
    db.Issue.findByIdAndRemove(req.params.id, function (err,issue){  
      res.redirect('/issues');
    });
  });


// PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        console.log("THIS IS REQ.USER", req.user)
        res.render('users/profile', {
            user : req.user
        });
    });

// LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('users/login', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('users/signup', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
          }), function(req,res){
          res.redirect("/profile")
        });

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

//-----comments----- STRETCH GOAL//





//TODO - Make 404 page more pretty.
  // =====================================
  // CATCH ALL  ==========================
  // =====================================
  app.get('*', function(req,res){
    res.render('errors/404');
  });    




// launch ======================================================================
app.listen(port);
console.log('Server is Serving on port ' + port);
