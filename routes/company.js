const express = require('express');
const router = express.Router();
const multer = require('multer');
const {uploadCloudCompany} = require('../config/cloudinary.js');
const Company = require('../models/company');
const Category = require('../models/category');
const bcrypt = require('bcrypt');
const passport = require("passport");
const {ensureLoggedOut} = require("connect-ensure-login");
const transport = require('../config/mailtrap');
const Process = require('../models/process');
const User = require('../models/user');

function ensureCompanyLoggedIn() {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.ein) {
      return next();
    } else {
      res.redirect('/company/login');
    }
  }
}

router.get('/', (req, res, next) => {
  res.render('company/index');
});

//SIGN UP ROUTES ------------------------------------------------------------------
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
    activationCode = bcrypt.hashSync(email, bcrypt.genSaltSync(10)).match(/[A-Za-z1-9]/g).join('');
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
      
      Company.create({ name, username, email, password: hash, ein, activationCode })
      .then(() => {
        
        transport.sendMail({
          from: 'register@ihp2.com',
          to: email, 
          subject: 'IHP2 - Register', 
          text: `Follow this link to activate your account: 
          ${process.env.baseURL}/company/signup/confirmation/${activationCode}`,
          html: `<a href="${process.env.baseURL}/company/signup/confirmation/${activationCode}">Click here</a> 
          to activate your account!`
        })
        .then((() => res.redirect('/company/login')))
        .catch(err => {
          res.render('company/signup', {message: 'Confirmation e-mail not sent!'});
          console.log(err)
        });
      })
      .catch(err => {
        console.log(err);
        res.render('company/signup', {message: 'Something went wrong! Please, try again later!'});
      });  
    })
    .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
});

router.get('/signup/confirmation/:activationCode', (req, res, next) => {
  Company.findOneAndUpdate({activationCode: req.params.activationCode}, {active: true}, {new: true})
  .then(company => {
    if (company) {
      res.render('company/confirmationCode', {message: `${company.name}, your account is active! Welcome!`})
    } else {
      res.render('company/confirmationCode', {message: "We didn't find any account for this activation code!"})
    }
  })
  .catch();
});
// ------------------------------------------------------------------

//LOGIN ROUTES ------------------------------------------------------------------
router.get('/login', ensureLoggedOut('/company/dashboard'), (req, res, next) => {
  res.render('company/login', { "message": req.flash("error") });
});

router.post("/login", passport.authenticate("local-company", {
  successReturnToOrRedirect: "/company/dashboard",
  failureRedirect: "/company/login",
  failureFlash: true,
  passReqToCallback: true
}));

// router.get('/auth/linkedin', (req, res, next) => {
//   res.send('linkedin');
// });

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/company/login");
});
//  ------------------------------------------------------------------

//DASHBOARD
router.get('/dashboard', ensureCompanyLoggedIn(), (req, res, next) => {
  res.render('company/dashboard');
});
//  ------------------------------------------------------------------

//PROFILE ------------------------------------------------------------------
router.get('/profile', ensureCompanyLoggedIn(), (req, res, next) => {
  Company.findById(req.user._id)
  .then(company => res.render('company/profile', company))
  .catch(err => console.log(err));
});

router.post('/profile/save', 
ensureCompanyLoggedIn(), 
uploadCloudCompany.single('logo'), 
(req, res, next) => {
  let logo = undefined;
  const {name, ein, street, number, district, city, state, country} = req.body;
  
  if(req.file) {
    logo = req.file.secure_url;
  }
  
  console.log('User id: ', req.user._id);
  Company.findOneAndUpdate({_id: req.user._id}, {$set: {
    name, 
    ein, 
    'address.street': street,
    'address.number': number,
    'address.district': district,
    'address.city': city,
    'address.state': state,
    'address.country': country,
    logo
  }}, {new: true, omitUndefined: true})
  .then((result) => {
    console.log(result);
    res.redirect('/company/dashboard');
  })
  .catch(err => {
    console.log(err);
    Company.findById(req.user._id)
    .then(company => res.render('company/profile', {company, message:"Something went wrong! Changes not saved!"}))
    .catch(err => console.log(err));
  })
});

router.get('/profile/credentials', ensureCompanyLoggedIn(), (req, res, next) => {
  res.render('company/passChange');
});

router.post('/profile/credentials/save', ensureCompanyLoggedIn(), (req, res, next) => {
  const {password, rptPassword, oldPassword} = req.body;
  
  if(password !== rptPassword) {
    res.render('company/passChange', { 
      errorMessage: "Your password and your password confirmation don't match. Please, be sure they're equal." 
    })
    return;
  }
  
  Company.findById(req.user._id)
  .then(company => {
    if(!bcrypt.compareSync(oldPassword, company.password)) {
      res.render('company/passChange', { 
        errorMessage: "Wrong current password!" 
      })
      return;
    }
    
    const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    
    Company.findOneAndUpdate({_id: req.user._id}, {password: hash})
    .then(() => {
      res.render('company/passChange', {
        successMessage: "Password changed!"
      })
    })
    .catch();
  })
  .catch();
});
//---------------------------------------------

// PROCESSES ------------------------------------
router.get('/processes', ensureCompanyLoggedIn(), (req, res, next) => {
  Company.findById(req.user._id).populate('processes')
  .then(company => {
    res.render('company/process', {company});
  })
  .catch(err => console.log(err));
});

router.get('/processes/new', ensureCompanyLoggedIn(), (req, res, next) => {
  res.render('company/newProcess');
});

router.post('/processes/new', ensureCompanyLoggedIn(), (req, res, next) => {
  const {title, jobRole, hierarchyOfRole} = req.body;
  delete req.body.title;
  delete req.body.jobRole;
  delete req.body.hierarchyOfRole;

  const selectedCategories = req.body;
  const categoriesToRemove = [];
  let categoriesToUse = [];
  for (let key in selectedCategories) {
    let arr = selectedCategories[key].split('/');
    categoriesToUse.push(arr[0]);
    if (arr.length > 1) {
      for (let x = 1; x < arr.length; x += 1) {
        categoriesToRemove.push(arr[x]); 
      }
    }
  }
  categoriesToUse = categoriesToUse.filter(a => !categoriesToRemove.includes(a));

  Process.create({title: title, jobRole: jobRole, hierarchyOfRole: hierarchyOfRole, prerequisites: categoriesToUse})
  .then(result => {
    Company.findOneAndUpdate({_id: req.user._id}, {$push: {processes: result._id}})
    .then(() => {
      res.redirect('/company/processes');
    })
    .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
});

router.get('/processes/new/getSubCategory/hierarchy', ensureCompanyLoggedIn(), 
(req, res, next) => {
  Category.find({hierarchy: 1})
  .then(categories => {
    res.status(200).json(categories);
  })
  .catch(err => console.log(err));
});

router.get('/processes/new/getSubByIdCategory/:categoryId', ensureCompanyLoggedIn(), 
(req, res, next) => {
  Category.findById(req.params.categoryId, {subcategories: 1}).populate('subcategories')
  .then(categories => {
    res.status(200).json(categories);
  })
  .catch(err => console.log(err));
});

router.get('/processes/show/:processId', (req, res, next) => {
  const getUsers = User.find({processes: req.params.processId});
  const getProcess = Process.findById(req.params.processId);

  Promise.all([getUsers, getProcess])
  .then(result => {
    console.log(result[0][0].personal);
    res.render('company/showProcess', {users: result[0], process: result[1]});
  })
  .catch(err => console.log(err));
});
//---------------------------------------------

module.exports = router;