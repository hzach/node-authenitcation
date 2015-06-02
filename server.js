

// set up ==================================================
// get all the tools we need
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

// Configuration =============================================
mongoose.connect(configDB.url);

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs');

// required for passport
app.use(session({ secret: 'givemebaconorgivemeham' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes ====================================================
require('./app/routes.js')(app, passport);

// launch ====================================================
app.listen(port);
console.log('The magic happens on port ' + port);
