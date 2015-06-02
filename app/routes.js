module.exports = function(app, passport) {

  // home page
  app.get('/', function(req, res) {
    res.render('index.ejs'); //load the index.ejs file
  });

  // show login forms
  app.get('/login', function(req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // ======================================================
  // FACEBOOK routes
  // ======================================================
  app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));
    
  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash : true
  }));

  // app.post('/login', passport.authenticate('jwt-login', {
  //   successRedirect : '/profile',
  //   failureRedirect : '/login',
  //   failureFlash : true
  // }));

  // show the signup form
  app.get('/signup', function(req, res) {
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
  }));

  // app.post('/signup', passport.authenticate('jwt-signup', {
  //   successRedirect : '/profile',
  //   failureRedirect : '/signup',
  //   failureRedirect : true
  // });

  // show the profile page
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
      user : req.user
    });
  });

  // logout
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });


  //route middleware to make sure user is logged in
  function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) return next();

    res.redirect('/');

  };

};
