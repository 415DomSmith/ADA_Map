// =====================================
// WELCOME TO ADAMAP ===================
// =====================================
// TODO - Look up licensing stuff to put in here
  


// =====================================
// DEPENDENCIES ========================
// =====================================
    require('dotenv').load();
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

   

    // FacebookStrategy = require('passport-facebook').Strategy,

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
app.use(passport.session()); // persistent login sessions
app.use(session({ secret: 'adaboyadamap' })); // session secret
app.use(passport.initialize());
app.use(flash()); // use connect-flash for flash messages stored in session

// =====================================
// ROUTE MIDDLEWARE ====================
// =====================================

function isLoggedIn (req, res, next){
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/')
  }
}

// =====================================
// RANDO STUFF =========================
// =====================================

var issueNum = 1000;    
var gk = 'AIzaSyAeeC94VEj-4SfsDUOOhqnRjIo-KnbK1Mw';

// =====================================
// LOGIN ===============================
// =====================================

app.get('/login', function(req, res) {
// render the page and pass in any flash data if it exists
  res.render('users/login', { message: req.flash('loginMessage')})
});


// =====================================
// SIGNUP ==============================
// =====================================

app.get('/signup', function (req, res){
  res.render('users/signup.ejs', { message: req.flash('signupMessage') 
    });
});

app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup', 
  failureFlash: true //allow flash messages
}));


// =====================================
// PROFILE SECTION =====================
// =====================================

app.get('/profile', isLoggedIn, function (req, res){
  res.render('users/profile.ejs', { req: req.user })
});

// =====================================
// LOGOUT ==============================
// =====================================

app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/');
});



// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_ID,
//     clientSecret: process.envFACEBOOK_SECRET,
//     callbackURL: "http://localhost:3000/auth/facebook/callback",
//     enableProof: false
//   },
//   function(accessToken, refreshToken, profile, done) {
//     console.log("this is the access token:" , accessToken);
//     console.log("this is the refreshToken token:" , refreshToken)
//     console.log("this is the profile token:" , profile)
//     // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return done(r);
//     });
//   }
// ));

//LOGIN WITH FACEBOOK

// app.get('/auth/facebook',
//   passport.authenticate('facebook'));

// app.get('/auth/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });



// =====================================
// ROOT AND LANDING PAGE ===============
// =====================================
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

// =====================================
// ISSUES INDEX / DATE & VOTES TABLE ===
// =====================================
app.get('/issues', function (req,res){
  db.Issue.find({}, function (err, issues){
    db.Issue.find({}).sort({'date': -1}).limit(30).exec(function (err, dates) {
      res.format({
        'text/html': function(){
          res.render('issues/index', {issues:issues, dates:dates})
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

//TODO - Format issue new page better, maybe incorporate a map?
// =====================================
// NEW ISSUE PAGE ======================
// =====================================
app.get('/issues/new', function (req,res){
  res.render('issues/new');
});

//TODO - Clean up issue show EJS. Make it pretty.
// =====================================
// ISSUE SHOW PAGE =====================
// =====================================
app.get('/issues/:id/', function (req,res){
    db.Issue.findById(req.params.id).populate('comments').populate('user').exec(function (err,issue){
    console.log(issue);
    res.render("issues/show", {issue : issue});
  });
});

//TODO - Clean up edit page. Make it functional, keep in mind what user's should be able to edit and what they shouldn't.
// =====================================
// ISSUE EDIT PAGE =====================
// =====================================
app.get('/issues/:id/edit', function (req,res){
  db.Issue.findById(req.params.id, function (err,issue){
    res.render("issues/edit", {issue : issue});
  });
});

//TODO - Make some fields editable by Admins, and some not. Figure out how to get Admins working
// =====================================
// ISSUE UPDATE ROUTE ==================
// =====================================
app.put('/issues/:id', function (req,res){
  db.Issue.findByIdAndUpdate(req.params.id, req.body.issue, function (err,issue){
    res.redirect('/issues');
  });
});

//TODO - Same as above, make the option to delete an issue only possible by admins
// =====================================
// ISSUE DELETE ROUTE ==================
// =====================================
app.delete('/issues/:id', function (req,res){
  db.Issue.findByIdAndRemove(req.params.id, function (err,issue){  
    res.redirect('/issues');
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

//TODO - Figure out what it will take to deploy to Heroku, and what needs to change here
// =====================================
// SERVER START ========================
// =====================================
app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});

