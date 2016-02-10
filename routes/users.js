var express = require('express');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');
var router = express.Router();


// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res) {
  res.render('login', {
    title: 'Login | Autentic8',
    user: req.user
  });
});

router.post('/login', function(req, res, next){
  passport.authenticate('local', function(err, user, info){
    if (err) return next(err)
    if (!user) {
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/signup', function(req, res){
  res.render('signup', {
    title: 'Signup | Authentic8',
    user: req.user
  });
});

router.post('/signup', function(req, res){
  var user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });
  user.save(function(err){
    req.logIn(user, function(err){
      res.redirect('/');
    });
  });
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/forgot', function(req, res){
  res.render('forgot', {
    user: req.user
  });
});

module.exports = router;
