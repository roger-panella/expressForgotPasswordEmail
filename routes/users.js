var express = require('express');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-sendgrid-transport');
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

router.post('/forgot', function(req, res, next){
  async.waterfall([
    function(done){
      crypto.randomBytes(20, function(err, buf){
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user){
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/users/forgot');
        }

        user.resetPasswordToken = token;
        user.restPasswordExpers = Date.now() + 3600000;
        user.save(function(err){
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var options = {
        auth: {
          api_user: process.env.sgLogin,
          api_key: process.env.sgPass
        }
      }

      var client = nodemailer.createTransport(smtpTransport(options));

      var mailOptions = {
        to: user.email,
        from: 'rogerpanella@gmail.com',
        subject: 'Authentic8 Password Reset',
        text: 'You\'re receiving this because you requested a password reset from Authentic8. \n\n' + 'Please click on the following link to complete this process:\n\n' + 'http://' + req.headers.host + '/reset/' + token + '\n\n' + 'If you did not request this password change, please ignore. \n'
      };
      client.sendMail(mailOptions, function(err){
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with password reset instructions');
        done(err, 'done');
      });
    }
  ], function(err){
    if (err) return next(err);
    res.redirect('/');
  });
});

module.exports = router;
