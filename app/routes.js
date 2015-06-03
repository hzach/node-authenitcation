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
  // GOOGLE ROUTES
  // ======================================================
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));


  // ======================================================
  // TWITTER ROUTES
  // ======================================================
  app.get('/auth/twitter', passport.authenticate('twitter', {
    scope: 'displayName'
  }));

  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/'
  }));

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

  // ===========================================================================
  // AUTHORIZE ROUTES
  // ===========================================================================
  // local
  app.get('/connect/local', function(req, res) {
    res.render('connect-local.ejs', { message : req.flash('loginMessage')});
  });

  app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/',
    failureFlash : true
  }));

  // facebook
  app.get('/connect/facebook', passport.authorize('facebook', {
    scope: 'email'
  }));

  app.get('/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/',
      failureFlash : true
    }));

  // twitter
  app.get('/connect/twitter', passport.authorize('twitter', {
    scope: 'email'
  }));

  app.get('/connect/twitter/callback',
    passport.authorize('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/',
      failureFlash : true
    }));

  // google
  app.get('/connect/google', passport.authorize('google', {
    scope : ['profile', 'email']
  }));

  app.get('/connect/google/callback',
  passport.authorize('google', {
    successRedirect : '/profile',
    failureRedirect : '/',
    failureFlash : true
  }));

  // unlink local login
  app.get('/unlink/local', function(req, res) {

    var user = req.user;
    user.local.name = undefined;
    user.local.email = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  // unlink facebook
  app.get('/unlink/facebook', function(req, res) {

    var user = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  // unlink twitter
  app.get('/unlink/twitter', function(req, res) {
    var user = req.user;
    user.twitter.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  // unlink google
  app.get('/unlink/google', function(req, res) {
    var user = req.user;
    console.log(user);
    user.google.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  //route middleware to make sure user is logged in
  function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) return next();

    res.redirect('/');

  };

};
