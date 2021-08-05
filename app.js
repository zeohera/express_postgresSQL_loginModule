require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require("helmet");
const passport = require('passport')
const swaggerUI = require("swagger-ui-express")
const swaggerJsDoc = require('swagger-jsdoc')
var cors = require('cors')
const db  = require('./models/index')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users.route');
var authRouter = require('./routes/auth.route');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Acazia Demo',
      version: '1.0.0',
      description: 'login module'
    },
    severs: [
      {
        url: "http://localhost:3000"
      }
    ],
  },
  apis: ['./routes/*.js'], // files containing annotations as above
};

const specs = swaggerJsDoc(options)

var app = express();
app.use(helmet());
db.connect()
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize())
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/api-docs' ,swaggerUI.serve, swaggerUI.setup(specs))
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.error(err)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.statusCode || 500).json({message : err.message, data : err.data});
});

module.exports = app;
