const express = require('express');
const router = express.Router();
const passport = require("passport");
const User = require('../models/user')

const bcrypt = require("bcrypt");
const bcryptSalt = 10;

router.get('/signup', (req, res, next) => {
  res.render('user/signup');
});

router.post('/signup', (req, res, next) => {
  const {username, email, password} = req.body

  User.findOne({ username: username })
  .then(user => {
    if (user !== null) {
      res.render("user/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username: username,
      password: hashPass,
      email: email,

    });

    newUser.save((err) => {
      if (err) {
        res.render("user/signup", { message: "Something went wrong" });
      } else {
        res.redirect("/");
      }
    });
  })
  .catch(error => {
    next(error)
  })
});

router.get('/login', (req, res, next) => {
  res.render('user/login');
});

router.get('/logout', (req, res, next) => {
  res.render('user/logout');
});

module.exports = router;