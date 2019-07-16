require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('./config/passport');
const MongoStore = require('connect-mongo')(session);
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

app.use(passport.initialize());
app.use(passport.session());

//----------------------------------

app.use('/', require('./routes/index'));
app.use('/company', require('./routes/company'));

app.use('/user', require('./routes/user'));

app.listen(process.env.PORT);
