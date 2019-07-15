//NPM MODULES
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const bcryptSalt = 10;
//---------------------------------------------------------------------------

function ensureUserLoggedIn() {
  return function(req, res, next) {
    // console.log(req.session)
    if (req.isAuthenticated() /* && req.personal.cpf */) {
      return next();
    } else {
      res.redirect('/user/login');
    }
  }
}

// LOGIN ROUTER
router.post("/login", passport.authenticate("local-user", {
  successRedirect: "/user/cv",
  failureRedirect: "/user/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get("/login", (req, res, next) => {
  res.render("user/login");
});
//---------------------------------------------------------------------------

// LOGOUT ROUTER
router.get("/user/logout", (req, res) => {
  req.logout();
  res.redirect("/user/login");
});
//---------------------------------------------------------------------------

// SIGNUP ROUTER
router.get('/signup', (req, res, next) => {
  res.render('user/signup');
});

router.post('/signup', (req, res, next) => {
  const { username, email, password } = req.body;

  User.findOne({"user.username": username})
    .then((user) => { console.log(user)
      if (user) {
        res.render('user/signup', { message: 'The username already exists' });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        user: {
          username: username,
          password: hashPass
        },
        personal: {
          email: email
        }
      });

      newUser.save((err) => {
        if (err) {
          res.render('user/signup', { message: 'Something went wrong' });
        } else {
          res.redirect('/user/cv');
        }
      });
    })
    .catch((error) => {
      next(error);
    });
});
//---------------------------------------------------------------------------

// CURRICULUM ROUTER
router.get('/cv', ensureUserLoggedIn(), (req, res, next) => {
  res.render('user/cv');
});
//---------------------------------------------------------------------------

//DASHBOARD
router.get('/dashboard', ensureUserLoggedIn(), (req, res, next) => {
  res.render('user/dashboard');
});
//---------------------------------------------------------------------------

module.exports = router;
