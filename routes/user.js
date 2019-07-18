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
const Company = require('../models/company');
const Category = require('../models/category');
const Questions = require('../models/questions');
const Process = require('../models/process');
//---------------------------------------------------------------------------

//LOGIN VERIFICATION
function ensureUserLoggedIn() {
  return function(req, res, next) {
    if (req.isAuthenticated() && !req.user.ein) {
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
  const { username, cpf, email, password, confirmPassword } = req.body;

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
          User.findOne({ 'personal.cpf': cpf })
            .then((user) => {
              if (user) {
                res.render('user/cv', { message: 'CPF already registered!' });
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
                  email: email,
                  cpf: cpf
                },
                activationCode: activationCode
              });

              newUser.save((err) => {
                if (err) {
                  res.render('user/signup', {
                    message: 'Something went wrong'
                  });
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
router.get('/cv', ensureUserLoggedIn('/user/login'), (req, res, next) => {
  console.log(req.user.imgPath);
  res.render('user/cv', { user: req.user });
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

    const cv = {
      personal: {
        name: name,
        lastName: lastName,
        dateOfBirth: dateOfBirth,
        maritalStatus: maritalStatus,
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
    User.findOneAndUpdate({ _id: req.user._id }, cv, { omitUndenfined: true })
      .then(() => res.redirect('/user/profile'))
      .catch((error) => {
        console.log(error);
        res.render('/', { message: 'Something went wrong' });
      });
  }
);
//---------------------------------------------------------------------------  

// PROFILE ROUTER
router.get('/profile/:userID', ensureLoggedIn('/'), (req, res, next) => {
  const id = req.params.userID;
  User.findById(id)
    .then((user) => {
      if (String(req.user._id) === id) {
        res.render('user/profile', { user: user, flag: true });
      } else {
        res.render('user/profile', { user: user });
      }
    })
    .catch((error) => console.log(error));
});

router.get('/profile/', ensureLoggedIn('/'), (req, res, next) => {
  res.redirect(`/user/profile/${req.user._id}`);
});
//---------------------------------------------------------------------------

// PROCESS LIST
router.get(
  '/profile/:userID/processes',
  ensureLoggedIn('/'),
  (req, res, next) => {
    User.findById(req.params.userID)
      .populate('processes')
      .then((user) => res.render('user/processes', { user: user }))
      .catch((error) => console.log(error));
  }
);
//---------------------------------------------------------------------------
        
        //ACTIVATION CODE FOR PROCESSES
        router.get('/confirmation/company/:companyID/process/:processID', ensureUserLoggedIn('/user/login'), (req, res, next) => {
          const getCompany = Company.findById(req.params.companyID);
          const getProcess = Process.findById(req.params.processID);
          
          Promise.all([getCompany, getProcess])
          .then(result => {
            User.findOneAndUpdate(
              { _id: req.user._id},
              {$push: { processes: req.params.processID }
            }
            )
            .then((user) => {
              if (user) {
                res.render('user/confirmationProcess', {
                  message: `You are enrolled in "${result[0].name} - ${result[1].title}" process!`
                });
              } else {
                res.render('user/confirmationProcess', {
                  message: "We didn't find your account. Are you sure you're logged in?"
                });
              }
            })
            .catch((err) => console.log(err));
          })
          .catch(err => {
            console.log(err);
            res.render('user/confirmationProcess', {
              message: "We didn't find any process within this adress!"
            });
          });
        });
        //---------------------------------------------------------------------------
 
       
        // PERFORMANCE LIST
        router.get('/profile/:userID/performance', ensureLoggedIn('/'), (req, res, next) => {
          console.log('----------------------------------')
          const performance = {};
          const questCatRel = {};
          User.findById(req.params.userID)
          .then(user => {

            let answeredQuestions = new Set();
            user.questions.forEach(item => {
              answeredQuestions.add(item.question);
            });
            answeredQuestions = Array.from(answeredQuestions);
            
            Questions.find({_id: {$in: answeredQuestions}})
            .then(resultQuestions => {

              let answerCategories = new Set();
              resultQuestions.forEach(item => {
                answerCategories.add(item.category);
                questCatRel[item._id] = item.category;
              });
              answerCategories = Array.from(answerCategories);

              Category.find({_id: {$in: answerCategories}})
              .then(categories => {
                categories.forEach(category => {
                  performance[category._id] = {
                    name: category.name,
                    correct: 0,
                    total: 0,
                    percentage: 0,
                  };
                });
                
                let multiplier = 0;
                user.questions.forEach(item => {
                  for(let x = 0; x < resultQuestions.length; x += 1) {
                    if (String(resultQuestions[x]._id) === String(item.question)) {
                      multiplier = resultQuestions[x].difficulty;
                    }
                  }
                  if (item.statusAnswer) {
                    performance[questCatRel[item.question]].correct += 1 * multiplier;
                  }
                  performance[questCatRel[item.question]].total += 1 * multiplier;
                  performance[questCatRel[item.question]].percentage = ((performance[questCatRel[item.question]].correct /  performance[questCatRel[item.question]].total) * 100) + '%';
                });
                console.log(user);
                res.render('user/performance', {performance, user});
              })
              .catch(err => console.log(err));        
            })
            .catch(err => console.log(err));            
          })
          .catch(err => console.log(err)); 
        });
        //---------------------------------------------------------------------------
        
         //CARD       
        function shuffle(array) {
          var currentIndex = array.length, temporaryValue, randomIndex;
          
          while (0 !== currentIndex) {
            
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
          }
          
          return array;
        }
        
        const getACard = (process, companyName, categories, difficulties, userAnswers) => {
          
          const promise = new Promise((resolve, reject) => {
            let questionArr = [];
            let leftToAnswer = 0;
            let totalToAnswer = 0;
            
            Questions.find({category: {$in: categories}})
            .then(questions => {
              questionArr = questions.filter(question => {              
                for (let item in difficulties){
                  let index = difficulties[item].indexOf(question.category);
                  if (index != -1)
                  {
                    let diff = difficulties[index];
                    
                    if(question.difficulty == diff.slice(diff.indexOf('->') + 2, diff.length)) {
                      totalToAnswer += 1;
                      if(userAnswers.length === 0) {
                        return true;
                      }  
                      for (let x = 0; x < userAnswers.length; x += 1) { 
                        if(String(userAnswers[x].question) === String(question._id)) {
                          return false;
                        }
                      }
                      return true;              
                    }
                  }
                }
              })
              if (questionArr.length === 0) {
                resolve(null);
              }
              
              leftToAnswer = totalToAnswer - questionArr.length;
              const randomQuestion = questionArr[Math.floor(Math.random() * (questionArr.length - 1))];
              const alternatives = shuffle([...randomQuestion.incorrectAlternatives, randomQuestion.correctAlternative]);
              
              Category.findById(randomQuestion.category)
              .then(category => {
                const card = {
                  process,
                  company: companyName,
                  category: category.name,
                  question: randomQuestion.title,
                  questionId: randomQuestion._id,
                  alternatives,
                  status: [leftToAnswer, totalToAnswer],  
                } 
                resolve(card);
              })
              .catch(err => reject(err));    
            })
            .catch(err => reject(err));
          });
          
          return promise;
        }
        
        const getCardInfo = (processId, userId) => {
          const getCompany = Company.find({processes: processId}, {name: 1, _id: 0});
          const getCategories = Process.findById(processId, {title: 1, categories: 1, difficulties: 1, _id: 0});
          const getUser = User.findById(userId, {questions: 1, _id: 0});
          
          return Promise.all([getCompany, getCategories, getUser]);
        }
        
        router.get('/process/:processId/test', ensureUserLoggedIn('/user/login'), (req, res, next) => {
          res.render('user/test');
        });
        
        router.get('/process/:processId/getCard', (req, res, next) => {
          getCardInfo(req.params.processId, req.user._id).then(result => {
            getACard(result[1].title, result[0][0].name, result[1].categories, result[1].difficulties, result[2].questions).then(card => {
              if (!card) {
                card = req.user;
                res.status(200).json(card);  
              }
              res.status(200).json(card);
            })
            .catch(err => res.status(400).json(err));
          })
          .catch(err => res.status(400).json(err));
        });
        
        router.get('/processes/show/:processId', ensureUserLoggedIn('/user/login'), (req, res, next) => {
          const link = `${process.env.baseURL}/user/confirmation/company/${req.user._id}/process/${req.params.processId}`;
          
          const getUsers = User.find({processes: req.params.processId});
          const getProcess = Process.findById(req.params.processId).populate('categories');
          
          Promise.all([getUsers, getProcess])
          .then(result => {
            
            const catQuestRel = [];
            const categoryArr = [];
            let questionArr = [];
            result[1].categories.forEach(category => {
              categoryArr.push(category._id);
            })
            
            Questions.find({category: {$in: categoryArr}})
            .then(questions => {
              questionArr = questions.filter(question => {
                for (let item in result[1].difficulties){
                  let index = result[1].difficulties[item].indexOf(question.category);
                  if ( index != -1)
                  {
                    let diff = result[1].difficulties[index];
                    
                    if(question.difficulty == diff.slice(diff.indexOf('->') + 2, diff.length)) {
                      return true;
                    }
                  }
                }
              })
              result[1].categories.forEach(category => {
                catQuestRel.push([category.name, []]);
                questionArr.forEach(question => {
                  if(String(question.category) === String(category._id)){
                    catQuestRel[catQuestRel.length - 1][1].push(question._id);
                  }
                });
              });
              res.render('company/showProcess', {users: result[0], process: result[1], catQuestRel, link});
            })
            .catch(err => console.log(err));
          })  
          .catch(err => console.log(err));
        });
        
        router.post('/process/test/saveAnswer', (req, res, next) => {
          console.log('---------------------------');
          const {question, answer} = req.query;
          User.findOne({$and: [{_id: req.user._id},{'questions.question': question}]})
          .then(user => {
            if (!user) {
              Questions.findById(question, {correctAlternative: 1, _id: 0})
              .then(result => {
                const statusAnswer = String(result.correctAlternative) === String(answer) ? true : false;
                User.findByIdAndUpdate(req.user._id, {$push: {questions: {
                  question,
                  answer,
                  statusAnswer,
                }}})
                .then(result => res.status(200).json(result))
                .catch(err => res.status(401).json(err));
              })
              .catch(err => {
                console.log(err);
                res.status(400).json(err)
              });
            }
          })
          .catch(err => console.log(err));          
        });

        module.exports = router;
