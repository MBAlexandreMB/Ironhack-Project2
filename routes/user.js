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
    if (req.isAuthenticated() && req.user.ein) {
      return next();
    } else {
      res.redirect('/user/login');
      console.log('no authenticated')
      console.log(req.user.ein)
    }
  }
}

router.post("/login", passport.authenticate("local-user", {
  successReturnToOrRedirect: "/user/cv",
  failureRedirect: "/user/cv",
  failureFlash: true,
  passReqToCallback: true
}));


// SIGNUP ROUTER
// CLIENT REQUISITION
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
// CLIENTE REQUISITION
router.get('/cv', ensureUserLoggedIn(),(req, res, next) => {
  res.render('user/cv');
});
//---------------------------------------------------------------------------

// SIGNUP ROUTER
// CLIENT REQUISITION
router.get('/login', (req, res, next) => {
  res.render('user/login');
});

router.get('/logout', (req, res, next) => {
  res.render('user/logout');
});

//---------------------------------------------------------------------------

module.exports = router;
