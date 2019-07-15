const express = require('express');
const router = express.Router();
const multer = require('multer');
const {uploadCloudCompany} = require('../config/cloudinary.js');
const Company = require('../models/company');
const bcrypt = require('bcrypt');
const passport = require("passport");
// const {ensureLoggedIn, ensureLoggedOut} = require("connect-ensure-login");

function ensureCompanyLoggedIn() {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.ein) {
      return next();
    } else {
      res.redirect('/company/login');
    }
  }
}

router.post("/login", passport.authenticate("local-company", {
  successReturnToOrRedirect: "/company/dashboard",
  failureRedirect: "/company/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get('/', (req, res, next) => {
  res.render('company/index');
});

//SIGN UP ROUTES
router.get('/signup', (req, res, next) => {
  res.render('company/signup');
});

router.post('/signup', (req, res, next) => {
  let message = 'Please: ';
  let hash = '';
  const { name, ein, email, password, rptpassword, username } = req.body;
  
  if(name === '') {
    message += 'Fill the company\'s name. ';
  }
  
  if (email.toLowerCase().includes('gmail') || 
  email.toLowerCase().includes('hotmail') || 
  email.toLowerCase().includes('yahoo')) {
    message += 'You need a corporate e-mail to register. ';
  }
  
  if (email === '') {
    message += 'Fill your corporate e-mail. ';
  }
  
  if (ein === '') {
    message += 'Fill your Employer Identification Number. ';
  }
  
  if(password === '' || rptpassword === '') {
    message += 'Set your password and confirm it. ';
  }
  
  if(username === '') {
    message += 'Set your username. ';
  }
  
  if(message !== 'Please: ') {
    res.render('company/signup', {message: message});
    return;
  }
  
  if(password !== rptpassword) {
    res.render('company/signup', 
    {passWrong: true, passWrongMessage: "Your password and your password confirmation don't match. Please, be sure they're equal."});
    return;
  } else {
    hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }
  
  Company.findOne({ein: ein})
  .then(einResult => {
    if (einResult) {
      res.render('company/signup', {message: 'Company already registered!'});
      return;
    }
    
    Company.findOne({username: username})
    .then(result =>  {
      if(result) {
        res.render('company/signup', {message: 'Username is already taken!'});
        return;
      }
      
      Company.create({ name, username, email, password: hash, ein })
      .then(() => res.redirect('/login'))
      .catch(err => {
        console.log(err);
        res.render('company/signup', {message: 'Something went wrong! Please, try again later!'});
      });  
    })
    .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
});



//LOGIN ROUTES
router.get('/login', (req, res, next) => {
  res.render('company/login', { "message": req.flash("error") });
});

router.get('/auth/linkedin', (req, res, next) => {
  res.send('linkedin');
});

router.get("/company/logout", (req, res) => {
  req.logout();
  res.redirect("/company/login");
});

//DASHBOARD
router.get('/dashboard', ensureCompanyLoggedIn(), (req, res, next) => {
  res.render('company/dashboard');
});


//---------------------------------------------
//TO USE ON PROFILE

//Remember to upload logo on route's header
// uploadCloudCompany.single('logo')

//Logo check for update
// let logo = '';

// if(req.file) {
//   logo = req.file.secure_url;
// }

module.exports = router;