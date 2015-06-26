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
    
require('./config/passport')(passport); 
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

function isLoggedIn (req, res, next){
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/')
  }
}

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

