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
    routeMiddleware = require("./middleware/routeHelper");



app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(loginMiddleware);

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

app.get('/', function (req,res){
  
});
 
app.post('/', function (req,res){ 
  
});

app.get('//new', function (req,res){
  res.render('');
});

app.get('//:id/', function (req,res){
    res.render('');
  });
});

app.get('//:id/edit', function (req,res){
  
    res.render('');
  });
});

app.put('//:id', function (req,res){
  
    res.redirect('/');
  });
});

app.delete('//:id', function(req,res){
  
    res.redirect('/');
  });
});

app.get('*', function(req,res){
  res.render('errors/404');
});

app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});

