require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const bcrypt = require("bcrypt");
const passport = require("passport");
const passportCompany = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require('./models/user');
const Company = require('./models/company');
const flash = require("connect-flash");
const cookieParser = require('cookie-parser');

const logger = require('morgan');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

//PASSPORT AND LOGIN. Flash is used for passport error handling

app.use(session({
  secret: "ihp2",
  cookie: { maxAge: 12000000 },
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

app.use(flash());


  //PASSPORT COMPANY
  passportCompany.serializeUser((user, cb) => {
    cb(null, user._id);
  });
  
  passportCompany.deserializeUser((id, cb) => {
    Company.findById(id, (err, user) => {
      if (err) { return cb(err); }
      cb(null, user);
    });
  });

  passportCompany.use('local-company', new LocalStrategy(
    { passReqToCallback: true }, 
    (req, username, password, next) => {
    Company.findOne({$or: [{username: username}, {ein: username}, {email: username}]}, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return next(null, false, { message: "Incorrect username or password" });
      }
  
      return next(null, user);
    });
  }));

  app.use(passportCompany.initialize());
  app.use(passportCompany.session());
  

  //PASSPORT USER
  passport.serializeUser((user, cb) => {
    cb(null, user._id);
  });
  
  passport.deserializeUser((id, cb) => {
    User.findById(id, (err, user) => {
      if (err) { return cb(err); }
      cb(null, user);
    });
  });

passport.use('local-user', new LocalStrategy(
  { passReqToCallback: true },
  (req, username, password, next) => {
    User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));

app.use(passport.initialize());
app.use(passport.session());
//----------------------------------

app.use('/', require('./routes/index'));
app.use('/company', require('./routes/company'));

app.use('/user', require('./routes/user'));


app.listen(process.env.PORT);