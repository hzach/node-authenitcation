// config/passport.js

// load all the things we need
var localStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
//var jwtStrategy = require('passport-jwt').Strategy;

// load up the user model
var User = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // FACEBOOK ================================================================================
  passport.use(new facebookStrategy({

    // pull inour app id and secret from our auth.js file
    clientID     : configAuth.facebookAuth.clientID,
    clientSecret : configAuth.facebookAuth.clientSecret,
    callbackURL  : configAuth.facebookAuth.callbackURL
  },
  //faceook will send back the token and profile
  function(token, refreshToken, profile, done) {

    // asynchronous
    process.nextTick(function() {

      // finde the user in the database based on their facebook id
      User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

        // if there is an error, stop everything and return that
        if (err)
          return done(err);

          // if the user is found, then log them in
        if (user)
          return done(null, user); // user found, return that user
        else
          var newUser = new User();

          newUser.facebook.id = profile.id; // set the users facebook id
          newUser.facebook.token = token; // save the token that facebook provides
          newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
          newUser.facebook.email = profile.emails[0].value // return the primary email address

          newUser.save(function(err) {
            if (err) throw err;
            return done(null, newUser);
          });
      });
    });
  }));

  // LOCAL SIGNUP =========================================

  // passport.use('local-signup', new localStrategy({
  //   // by default, local strategy uses username and password, we will override with email
  //   usernameField : 'email',
  //   passwordField : 'password',
  //   passReqToCallback : true // allows us to pass back the entire request to the callback
  //
  // },
  // function(req, email, password, done) {
  //
  //   // asynchronous
  //   // User.findOne wont fire unless data is sent back
  //   process.nextTick(function(){
  //
  //       User.findOne({ 'local.email' : email }, function(err, user) {
  //
  //         // if there are any errors, return the error
  //         if (err)
  //           return done(err);
  //
  //         // check to see if theres already a user with that email
  //         if (user) {
  //           return done(null, false, req.flash('signupMessage', 'That email is already taken'));
  //         } else {
  //
  //           // if there is not user with that email
  //           // create the user
  //           var newUser = new User();
  //
  //           // set the user's local credentials
  //           newUser.local.email = email;
  //           newUser.local.password = newUser.generateHash(password);
  //
  //           // save the user
  //           newUser.save(function(err) {
  //             if (err)
  //                 throw err;
  //             return done(null, newUser);
  //           });
  //         }
  //       });
  //   });
  // }));

  //LOCAL LOGIN ================================================================================

  // passport.use('local-login', new localStrategy({
  //   // by default, local strategy uses username and password, we will override with email
  //   usernameField : 'email',
  //   passwordField : 'password',
  //   passReqToCallback : true // allows us to pass back the entire request to the callback
  // },
  // function(req, email, password, done) {
  //   User.findOne({ 'local.email' : email }, function(err, user) {
  //
  //     // return the error if it exists
  //     if (err)
  //       return done(err);
  //
  //     // check if the user exists
  //     if (!user)
  //       return done(null, false, req.flash('loginMessage', 'That email is not registered. Please register an account.'));
  //
  //     // check if the password was correct
  //     if (!user.validPassword(password))
  //       return done(null, false, req.flash('loginMessage', 'The password you entered was incorrect. Please try again.'));
  //
  //     return done(null, user);
  //
  //   });
  // }));


  // // JWT SIGNUP
  // passport.use('jwt-signup', new jwtStrategy({
  //   secretOrKey : passport.secret,
  //   issuer : 'janus.crockpot.com',
  //   usernameField : 'email',
  //   passwordField : 'password'
  // },
  // function(req, email, password, done) {
  //
  //   process.nextTick(function() {
  //     User.findOne({ 'jwt.email' : email}, function(err, user) {
  //       if (err)
  //         return done(err);
  //       if (user)
  //         return done(null, false, req.flash('signupMessage', 'That email is already taken'));
  //       else {
  //           var newUser = new User();
  //           newUser.jwt.email = email;
  //           newUser.jwt.password = generateHash(password);
  //
  //           newUser.save(function(err) {
  //             if (err)
  //               throw err;
  //             return done(null, newUser);
  //           });
  //       }
  //     });
  //   });
  // }));
  //
  // // JWT LOGIN =========================================
  // passport.use('jwt-login', new jwtStrategy({
  //   secretOrKey : passport.secret,
  //   issuer : 'janus.crockpot.com',
  //   usernameField : 'email',
  //   passwordField : 'password'
  // },
  // function(req, email, password, done) {
  //   User.findOne({ 'jwt.email' : email }, function(err, user) {
  //
  //     if (err)
  //       return done(err);
  //
  //     if (!user)
  //       return done(null, false, req.flash('loginMessage', 'That email is already taken'));
  //
  //     if (!user.validPassword(password))
  //       return done(null, false, req.flash('loginMessage', 'Oops! Wrong password!'));
  //
  //     else
  //       return done(null, user);
  //   });
  // }));
};
