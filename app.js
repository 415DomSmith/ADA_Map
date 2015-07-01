// =====================================
// WELCOME TO ADAMAP ===================
// =====================================
// TODO - Look up licensing stuff to put in here

  
// TODO - Make more modular... app.js is almost 500 lines of code... 

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


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    } else {
      res.cookie('adacook', false, {maxAge: 0})
      res.redirect('/login');
    }        
}

// routes ======================================================================


// =====================================
// ROOT AND LANDING PAGE ===============
// =====================================
  app.get('/', function (req,res){  
      res.format({        
        'text/html': function(){
          db.Issue.find({}).sort({votes: 'desc'}).limit(30).populate('user').exec(function (err, issues){
          console.log('THIS IS FROM THE HTML/TEXT');
            if (req.session.passport.user == null){
              // console.log('NO ONE LOGGED IN');
              res.render('landing', {issues : issues, currentUser: ""})
            } else {
              // console.log(req.session.passport.user + " IS LOGGED IN"); 
              db.User.findById(req.session.passport.user, function (err, user){
                res.render('landing', {issues : issues, currentUser: user.local.username});
              })    
            }
          }) 
        }, 
        'application/json': function(){
          var box = [req.query.NE, req.query.SW] //format req.query in to box of bounds    
          db.Issue.find({loc : {"$geoWithin" : {$box : box}}}).populate('user').sort({votes: 'desc'}).limit(30).exec(function (err, issues){ //find all issues inside box of bounds
            res.send(issues)
          })
        },
        'default': function(){
          res.status(406).send('Error. Please Try Again')
        }
    })
  });

// =====================================
// ISSUES INDEX / DATE & VOTES TABLE ===
// =====================================
  app.get('/issues', function (req,res){
    res.format({
      'text/html': function(){
        db.Issue.find({}).sort({votes: 'desc'}).limit(30).populate('user').exec(function (err, issues){
          db.Issue.find({}).sort({dateCreated: -1}).limit(30).populate('user').exec(function (err, dates) {
            if (req.session.passport.user == null){
              console.log('NO ONE LOGGED IN');
              res.render('issues/index', {issues : issues, dates : dates, currentUser: ""})
            } else {
              console.log(req.session.passport.user + " IS LOGGED IN"); 
              db.User.findById(req.session.passport.user, function (err, user){
                res.render('issues/index', {issues : issues, dates : dates, currentUser: user.local.username});
              })     
            }
          })
        })
      },
      'application/json': function(){
        console.log(req);
        // db.Issue.find({})
      },
      'default': function(){
        res.status(406).send('Error. Please Try Again')
      }      
    }); 
  });

// TODO - Create Issues on landing page, get address / location on pin drag 
// =====================================
// CREATE ISSUE ========================
// =====================================


  app.post('/issues', isLoggedIn, function (req,res){ 
    if (req.body.issue.address === '' || req.body.issue.city === '' || req.body.issue.title === '') {
      res.send('Address and Title fields must be completed')
    } else {
      var address = encodeURIComponent(req.body.issue.address + "," + req.body.issue.city + "," + req.body.issue.state); //gets address from user
      var city = req.body.issue.city;
      var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
        request.get(url + address + gk, function (error, response, resBody){ //queries google for proper address format
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
            //setting issue properties  
            var lat = results.results[0].geometry.location.lat; 
            var long = results.results[0].geometry.location.lng;
            var issue = new db.Issue(req.body.issue);
            issue.lat = lat;
            issue.long = long;
            issue.loc = [long, lat];
            issue.address = address;
            issue.city = city;
            // issue.issueNum = issueNum;
            issue.reviewed = false;
            issue.solved = false;
            issue.views = 0;
            issue.votes = 0;
            issue.user = req.user;

            issue.save(function (err, issue){
              res.format({
                'text/html': function(){ 
                  console.log('ERROR MSG: ' + err);
                  console.log('SUCCESSFUL ISSUE: ' + issue)
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

//TODO - Format issue NEW page better, maybe incorporate a map?
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
        db.Comment.find({issue : req.params.id}).populate('user').exec(function (err, comment){
          // console.log(comment);
          if (req.session.passport.user == null){
            // console.log('NO ONE LOGGED IN');
            res.render('issues/show', {issue : issue, comment : comment, currentUser: ""})
          } else {
            // console.log(req.session.passport.user + " IS LOGGED IN"); 
            db.User.findById(req.session.passport.user, function (err, user){
              res.render('issues/show', {issue : issue, comment : comment, currentUser: user.local.username});
            })
          }     
        })
      });
  });


// =====================================
// ISSUE NUMBER QUERY ROUTE ============
// =====================================

app.get('/issues/number', function (req, res){
  // console.log(req.query)
  db.Issue.find(req.query).exec(function (err, issue){
    console.log(issue);
    if (issue == [] || !issue || issue == null){
      res.status(406).send('No Issue Matching That Number');
    } else {
      // console.log(issue);
      var id = issue[0]._id;
      res.redirect('/issues/'+ id + '/');  
    }    
  })
  
})



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
      'application/json': function(){ //listening for JSON for voting system. 
        //Gets issue _ID, checks voters array if current user making call has already voted. 
        //If so, respond with error. Otherwise, increment issue votes # and add user _ID to voters array.
        db.Issue.findById(req.params.id, function (err, issue){
          var votersArr = issue.voters; 
          if (votersArr.indexOf(req.session.passport.user) !== -1){
            console.log('User already voted for this issue');
            res.status(406).send('You have already voted');
          } else {
            console.log('User has not voted yet!')
            db.Issue.findByIdAndUpdate(req.params.id, {$inc: {votes:1}}, function (err, issueA){
              db.Issue.findByIdAndUpdate(req.params.id, {$push: {voters: req.session.passport.user}}, function (err, issueB){
                
              })
            })
          }
        })    
      },
      'default': function() {
        res.status(406).send('Not Accepted');
      }
    })  
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
      db.Issue.find({user : req.user}).populate('comments').sort({dateCreated: -1}).exec(function (err,issues){  
        // console.log(issue)
        res.render('users/profile', {user : req.user, issues : issues});
      }) 
    });

// LOGOUT ==============================
    app.get('/logout', function(req, res) {
        res.cookie('adacook', false, {maxAge: 0})
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
            res.cookie('adacook', true, {maxAge: 900000})
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

//-----comments----- STRETCH GOAL//TODO -- build comment system for issues and users

app.post("/issues/:issue_id/comments", isLoggedIn, function (req, res) {
  db.Comment.create(req.body.comment, function (err, comment) { //creates a comment based on the form body submit, comment data is second param and is used below
    console.log(req.session.passport.user);
    if (err){
      console.log(err);
      res.render('issues/index');
    } else {
      db.Issue.findById(req.params.issue_id, function (err, issue) { //finds in the db the post based on the id passed in the url 
        issue.comments.push(comment); //pushes the comment data to the found post's comments array
        comment.issue = issue._id; //sets the post to the id in the url/req.params
        comment.user = req.session.passport.user; //sets the user id of the comment to the session id, giving ownership of that comment to the logged in user
        issue.save(); //updates post collection in db
        comment.save(); //updates comment collection in db
      
        db.User.findById(req.session.passport.user, function (err, user) { //finds the user in the user collection based on his session Id (same as user ID)
        user.comments.push(comment) //add the comment to the users comments array
        user.save(); //updates user collection in db
        res.redirect("/issues/" + req.params.issue_id + "/")
        })
      })
    } 
  });
});




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
