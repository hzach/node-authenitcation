// config/passport.js

// load all the things we need
var localStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var twitterStrategy = require('passport-twitter').Strategy;
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;
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

  // GOOGLE ==================================================================================
  passport.use( new googleStrategy({
    clientID : configAuth.googleAuth.clientID,
    clientSecret : configAuth.googleAuth.clientSecret,
    callbackURL : configAuth.googleAuth.callbackURL
  },
  function(req, token, refreshToken, profile, done) {

    // asynchronous
    process.nextTick(function() {

      if (!req.user) {

        User.findOne({ 'google.id' : profile.id }, function(err, user) {

          // if there is an error, return that
          if (err) return done(err);

          // if there is a user, return that.
          if (user) {

            if (!user.google.token) {
              user.google.token = token;
              user.google.email = profile.emails[0].value;
              user.google.name = profile.displayName;

              user.save(function(err) {
                if (err) throw err;
                return done(null, user);
              });

            }

            return done(null, user);

          // if no user is found, create a new one
          } else {
            var newUser = new User();

            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.google.email = profile.emails[0].value;
            newUser.google.name = profile.displayName;

            newUser.save(function(err) {
              if (err) throw err;
              return done(null, newUser);
            });
          }
        });
    } else {
      var user  = req.user;

      user.google.id = profile.id;
      user.google.token = token;
      user.google.name = profile.displayName;
      user.google.email = profile.emails[0].value;

      // save the user
      user.save(function(err) {
        if (err) throw err;
        return done(null, user);
      });
    }

  });
}));

  // TWITTER =================================================================================
  passport.use( new twitterStrategy({

    // pull in out app id and secret from our auth.js file
    consumerKey     : configAuth.twitterAuth.consumerKey,
    consumerSecret  : configAuth.twitterAuth.consumerSecret,
    callbackURL     : configAuth.twitterAuth.callbackURL
  },
  // twitter will send back the token and profile
  function(req, token, tokenSecret, profile, done) {

    // asynchronous
    process.nextTick(function () {

      if (!req.user) {

        // find the user in the database based on their twiiter
        User.findOne( { 'twitter.id' : profile.id }, function(err, user) {

          if (err) return done(err);

          if (user) {

            if (!user.facebook.token) {
              user.twitter.token = token;
              user.twitter.name = profile.name.givenName + ' ' + profile.name.familyName;
              user.twitter.email = profile.emails[0].value;

              user.save(function(err) {
                if (err) throw err;
                return done(null, user);
              });
            }

            return done(null, user);

          } else {
            var newUser = new User();

            newUser.twitter.id = profile.id;
            newUser.twitter.token = token;
            newUser.twitter.username = profile.username;
            newUser.twitter.displayName = profile.displayName;

            newUser.save(function(err) {
              if (err) throw err;
              return done(null, newUser);
            });
          }
        });
    } else {
        var user  = req.user;

        user.twitter.id = profile.id;
        user.twitter.token = token;
        user.twitter.name = profile.displayName;
        user.twitter.username = profile.username;

        // save the user
        user.save(function(err) {
          if (err) throw err;
          return done(null, user);
        });
    }
  });
}));

  // FACEBOOK ================================================================================
  passport.use(new facebookStrategy({

    // pull inour app id and secret from our auth.js file
    clientID          : configAuth.facebookAuth.clientID,
    clientSecret      : configAuth.facebookAuth.clientSecret,
    callbackURL       : configAuth.facebookAuth.callbackURL,
    passReqToCallback : true
  },
  //faceook will send back the token and profile
  function(req, token, refreshToken, profile, done) {

    // asynchronous
    process.nextTick(function() {

      // chekc if the user is already logged in
      if (!req.user) {

        // finde the user in the database based on their facebook id
        User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

          // if there is an error, stop everything and return that
          if (err)
            return done(err);

            // if the user is found, then log them in
          if (user){

            if (!user.facebook.token) {
              user.facebook.token = token;
              user.facebook.name =  profile.name.givenName + ' ' + profile.name.familyName;
              user.facebook.email = profile.emails[0].value;

              newUser.save(function(err) {
                if (err) throw err;
                return done(null, newUser);
              });
            }

            return done(null, user); // user found, return that user

          } else {

            var newUser = new User();

            newUser.facebook.id = profile.id; // set the users facebook id
            newUser.facebook.token = token; // save the token that facebook provides
            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
            newUser.facebook.email = profile.emails[0].value // return the primary email address

            newUser.save(function(err) {
              if (err) throw err;
              return done(null, newUser);
            });
          }
        });
    } else {
        var user  = req.user;

        user.facebook.id = profile.id;
        user.facebook.token = token;
        user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
        user.facebook.email = profile.emails[0].value;

        // save the user
        user.save(function(err) {
          if (err) throw err;
          return done(null, user);
        });
    }
  });
}));

  // LOCAL SIGNUP =========================================

  passport.use('local-signup', new localStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback

  },
  function(req, email, password, done) {

    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function(){

      if (!req.user) {

          User.findOne({ 'local.email' : email }, function(err, existingUser) {

            // if there are any errors, return the error
            if (err)
              return done(err);

            // check to see if theres already a user with that email
            if (existingUser) {
              return done(null, false, req.flash('signupMessage', 'That email is already taken'));

            }
            if (req.user) {
              var user = req.user;
              user.local.email = email;
              user.local.password = user.generateHash(password);
              user.save(function(err) {
                if (err)
                  throw err;
                return done(null, user);
              });
            } else {

              // if there is not user with that email
              // create the user
              var newUser = new User();

              // set the user's local credentials
              newUser.local.email = email;
              newUser.local.password = newUser.generateHash(password);

              // save the user
              newUser.save(function(err) {
                if (err)
                    throw err;
                return done(null, newUser);
              });
            }
          });

    } else {
      var user  = req.user;

      user.local.email = email;
      user.local.password = user.generateHash(password);

      // save the user
      user.save(function(err) {
        if (err) throw err;
        return done(null, user);
      });

    }

  });
}));

  //LOCAL LOGIN ================================================================================

  passport.use('local-login', new localStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {
    User.findOne({ 'local.email' : email }, function(err, user) {

      // return the error if it exists
      if (err)
        return done(err);

      // check if the user exists
      if (!user)
        return done(null, false, req.flash('loginMessage', 'That email is not registered. Please register an account.'));

      // check if the password was correct
      if (!user.validPassword(password))
        return done(null, false, req.flash('loginMessage', 'The password you entered was incorrect. Please try again.'));

      return done(null, user);

    });
  }));


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
