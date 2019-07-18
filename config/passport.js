const passport = require('passport');
const User = require('../models/user');
const Company = require('../models/company');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

//PASSPORT COMPANY
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id)
    .then((user) => {
      if (user) {
        cb(null, user);
      } else {
        Company.findById(id, (err, company) => {
          if (err) {
            return cb(err);
          }
          cb(null, company);
        });
      }
    })
    .catch((err) => console.log(err));
});

passport.use(
  'local-company',
  new LocalStrategy(
    { passReqToCallback: true },
    (req, username, password, next) => {
      Company.findOne(
        {
          $or: [{ username: username }, { ein: username }, { email: username }]
        },
        (err, user) => {
          
          if (err) {
            return next(err);
          }

          if (!user || !bcrypt.compareSync(password, user.password)) {
            return next(null, false, {
              message: 'Incorrect username or password'
            });
          }

          if (!user.active) {
            return next(null, false, { message: "Account not active! Check your registered e-mail!" });
          }

          return next(null, user);
        }
      );
    }
  )
);

// PASSPORT USER
passport.use(
  'local-user',
  new LocalStrategy(
    { passReqToCallback: true },
    (req, username, password, next) => {
    User.findOne({ 'personal.email': username }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user || !bcrypt.compareSync(password, user.user.password)) {
        return next(null, false, {
          message: 'Incorrect username or password'
        });
      }

      if (!user.active) {
        return next(null, false, { message: "Account not active! Check your registered e-mail!" });
      }
  
      return next(null, user);
    });
  }));

  module.exports = passport;