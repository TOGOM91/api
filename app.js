var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');




var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usersRouter');
var productRouter = require('./routes/productRouter');
var wishlistRouter = require('./routes/wishlistRouter');

var app = express();


app.use(session({
  secret: process.env.SESSION_SECRET || 'monSecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } 
}));

app.use(flash());

app.use('/uploads', express.static('uploads'));



// Middleware global pour rendre l'utilisateur dispo dans toutes les vues
app.use((req, res, next) => {
  // Si connecté via session
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
  }
  // Si connecté via JWT (middleware combinedAuth)
  else if (req.user) {
    res.locals.user = req.user;
  }
  // Sinon, pas d'utilisateur connecté
  else {
    res.locals.user = null;
  }
  next();
});


app.use((req, res, next) => {
  res.locals.user = req.session.user || null;  // infos user disponnible toutes les pages 
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});


const methodOverride = require('method-override');

app.use(methodOverride('_method')); 



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productRouter);
app.use('/wishlist', wishlistRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use((req, res, next) => {
  res.locals.user = req.user || req.session.user || null;
  next();
});


module.exports = app;
