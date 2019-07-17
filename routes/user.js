//NPM MODULES
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const bcryptSalt = 10;
const transport = require('../config/mailtrap');
const { ensureLoggedOut, ensureLoggedIn } = require('connect-ensure-login');
const { uploadCloudUser } = require('../config/cloudinary.js');
//---------------------------------------------------------------------------

//LOGIN VERIFICATION
function ensureUserLoggedIn() {
  return function(req, res, next) {
    if (req.isAuthenticated() /* && req.personal.cpf */) {
      return next();
    } else {
      res.redirect('/user/login');
    }
  };
}
//---------------------------------------------------------------------------

// LOGIN ROUTER
router.get('/login', ensureLoggedOut('/user/profile'), (req, res, next) => {
  res.render('user/login');
});

router.post(
  '/login/',
  passport.authenticate('local-user', {
    successRedirect: `/user/profile`,
    failureRedirect: '/user/login',
    failureFlash: true,
    passReqToCallback: true
  })
);

//---------------------------------------------------------------------------

// LOGIN VIA FACEBOOK
router.get('/login/facebook', (req, res, next) => {
  res.render('user/login');
});

// LOGOUT ROUTER
router.get('/user/logout', (req, res) => {
  req.logout();
  res.redirect('/user/login');
});
//---------------------------------------------------------------------------

// SIGNUP ROUTER
router.get('/signup', ensureLoggedOut('/user/profile'), (req, res, next) => {
  res.render('user/signup');
});

router.post('/signup', (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  User.findOne({ 'personal.email': email })
    .then((user) => {
      if (user) {
        res.render('user/signup', { message: 'Email already registered!' });
        return;
      }

      User.findOne({ 'user.username': username })
        .then((user) => {
          if (user) {
            res.render('user/signup', {
              message: 'The username already exists'
            });
            return;
          }

          let hashPass = '';

          if (password !== confirmPassword) {
            res.render('user/signup', {
              essage:
                "Your password and your password confirmation don't match. Please, be sure they're equal."
            });
            return;
          } else {
            const salt = bcrypt.genSaltSync(bcryptSalt);
            hashPass = bcrypt.hashSync(password, salt);
            activationCode = bcrypt
              .hashSync(email, salt)
              .match(/[A-Za-z1-9]/g)
              .join('');
          }

          const newUser = new User({
            user: {
              username: username,
              password: hashPass
            },
            personal: {
              email: email
            },
            activationCode: activationCode
          });

          newUser.save((err) => {
            if (err) {
              res.render('user/signup', { message: 'Something went wrong' });
            } else {
              res.redirect('/user/cv');

              transport
                .sendMail({
                  from: 'register@ihp2.com',
                  to: email,
                  subject: 'IHP2 - Register',
                  text: `Follow this link to activate your account: 
                ${
                  process.env.baseURL
                }/user/signup/confirmation/${activationCode}`,
                  html: `<a href="${
                    process.env.baseURL
                  }/user/signup/confirmation/${activationCode}">Click here</a> 
                to activate your account!`
                })
                .then(() => res.redirect('/user/login'))
                .catch((err) => {
                  res.render('user/signup', {
                    message: 'Confirmation e-mail not sent!'
                  });
                  console.log(err);
                });
            }
          });
        })
        .catch((error) => {
          next(error);
        });
    })
    .catch((error) => console.log(error));
});
//---------------------------------------------------------------------------

//ACTIVATION CODE
router.get('/signup/confirmation/:activationCode', (req, res, next) => {
  User.findOneAndUpdate(
    { activationCode: req.params.activationCode },
    { active: true },
    { new: true }
  )
    .then((user) => {
      if (user) {
        res.render('user/confirmationCode', {
          message: 'Your account is active! Welcome!'
        });
      } else {
        res.render('user/confirmationCode', {
          message: "We didn't find any account for this activation code!"
        });
      }
    })
    .catch((err) => console.log(err));
});
//---------------------------------------------------------------------------

// CURRICULUM ROUTER
router.get('/cv', ensureUserLoggedIn(), (req, res, next) => {
  const date = req.user.personal.dateOfBirth;
  res.render('user/cv', req.user);
});

router.post(
  '/cv',
  uploadCloudUser.single('photo'),
  ensureUserLoggedIn(),
  (req, res, next) => {
    const {
      name,
      lastName,
      dateOfBirth,
      maritalStatus,
      cpf,
      email,
      phone,
      telephone,
      linkedin,
      facebook,
      sitePortifolio,
      nationality,
      street,
      number,
      district,
      city,
      state,
      country,
      zipCode,
      professionalResume,
      degree,
      institution,
      fieldOfStudy,
      educationStartDate,
      educationEndDate,
      idiom,
      level,
      companyName,
      occupation,
      experienceStartDate,
      experienceEndDate,
      description
    } = req.body;
    let imgPath = undefined;
    if (req.file) {
      imgPath = req.file.secure_url;
    }

    User.findOne({ 'personal.cpf': cpf })
      .then((user) => {
        if (user) {
          res.render('user/cv', { message: 'CPF already registered!' });
          return;
        }
        console.log(imgPath);
        const cv = {
          personal: {
            name: name,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            maritalStatus: maritalStatus,
            cpf: cpf,
            nationality: nationality,
            email: email,
            phone: phone,
            telephone: telephone,
            socialMedia: {
              linkedin: linkedin,
              facebook: facebook,
              sitePortifolio: sitePortifolio
            }
          },

          adress: {
            street: street,
            number: number,
            district: district,
            city: city,
            state: state,
            country: country,
            zipCode: zipCode
          },

          skills: {
            professionalResume: professionalResume,
            education: {
              degree: degree,
              institution: institution,
              fieldOfStudy: fieldOfStudy,
              period: {
                startDate: educationStartDate,
                endDate: educationEndDate
              }
            }
          },

          languages: {
            idiom: idiom,
            level: level
          },

          experiences: {
            companyName: companyName,
            occupation: occupation,
            period: {
              startDate: experienceStartDate,
              endDate: experienceEndDate
            },
            description: description
          },
          imgPath: imgPath
        };

        User.findOneAndUpdate(
          { _id: req.user._id },
          cv,
          { omitUndenfined: true },
          (err) => {
            if (err) {
              res.render('user/cv', { message: 'Something went wrong' });
            } else {
              res.redirect('/user/profile');
            }
          }
        );
      })
      .catch((err) => console.log(err));
  }
);
//---------------------------------------------------------------------------

// PROFILE ROUTER
router.get('/profile/:userID', ensureLoggedIn('/'), (req, res, next) => {
  id = req.params.userID;
  User.findById(id)
    .then((user) => {
      console.log(user)
      if (String(req.user._id) === id) {
        res.render('user/profile', {user, flag:true});
      } else {
      res.render('user/profile', {user});
      }
    })
    .catch((error) => console.log(error));
});

router.get('/profile/', ensureLoggedIn('/'), (req, res, next) => {
  res.redirect(`/user/profile/${req.user._id}`);
});
//---------------------------------------------------------------------------

// PROCESS LIST
router.get('/profile/:userID/processes', ensureLoggedIn('/'), (req, res, next) => {
  User.findById(req.params.userID).populate('processes')
  .then(user => res.render('user/processes', user))
  .catch(error => console.log(error))
});
//---------------------------------------------------------------------------




module.exports = router;
