var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');
var session = require('express-session');
var ejs = require('ejs');
socketio = require('socket.io')();
var app = express();

var index = require('./routes/index');
var users = require('./routes/users');
var boards = require('./routes/boards');

var items = [];
var client;


app.use(session({
	secret: 'secretkey',
	resave: false,
	saveUninitialized: true,
	cookie: {
		// maxAge: 1000*50
	}
}));


// 서버 생성
var server = http.createServer(function(req, res){
    res.render('volunComm.ejs');
}).listen(8080, function(){
  console.log('server running at http://127.0.0.1:8080');
});

var io = socketio.listen(server);


io.sockets.on('connection', function(socket){
    //chatting
    socket.on('message', function(data){
      io.sockets.emit('message', data);
    });
});








// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
app.use('/users', users);
app.use('/boards', boards);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

module.exports = app;
