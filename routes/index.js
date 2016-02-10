var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express',
    user: req.user
   });
});

module.exports = router;
