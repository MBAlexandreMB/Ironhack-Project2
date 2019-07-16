require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo')(session);
const User = require('./models/user');
const Company = require('./models/company');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');

const logger = require('morgan');

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error('Error connecting to mongo', err);
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
    ttl: 24 * 60 * 60
  })
}));

app.use(flash());

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

          return next(null, user);
        }
      );
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

//   //PASSPORT USER
passport.use(
  'local-user',
  new LocalStrategy((username, password, next) => {
    User.findOne({ $or: [{ 'personal.email': username }, { 'personal.cpf': username }, { 'user.username': username }]}, (err, user) => {
      if (err) {
        return next(err),
        console.log(err)
      }
      if (!user) {
        return next(null, false, { message: 'Incorrect username' }), console.log('incorrect username');
      }
      if (!bcrypt.compareSync(password, user.user.password)) {
        return next(null, false, { message: 'Incorrect password' }), console.log('incorrect password');
      }

      if (!user.active) {
        return next(null, false, { message: "Account not active! Check your registered e-mail!" }), console.log('account active');
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
