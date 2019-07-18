const passport = require('passport');
const User = require('../models/user');
const Company = require('../models/company');
const LocalStrategy = require('passport-local').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
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

  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENTID,
    clientSecret: process.env.LINKEDIN_SECRET,
    callbackURL: `${process.env.baseURL}/company/auth/linkedin/callback`,
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: true,
  }, function(accessToken, refreshToken, profile, done) {
      Company.find({linkedinId: profile.id}, (err, user) => {
        if(user) {
          return done(err, user);
        }

        Company.create({linkedinId: profile.id}, (err, user) => {
          return done(err, user);
        })
      });
    process.nextTick(function () {
     
      // To keep the example simple, the user's LinkedIn profile is returned to
      // represent the logged-in user. In a typical application, you would want
      // to associate the LinkedIn account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }));

  module.exports = passport;