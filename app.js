var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var loremIpsum = require('lorem-ipsum')
var shortid = require('shortid');
var jsonfile = require('jsonfile')
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var index = require('./routes/index');
var users = require('./routes/users');

var articles;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

fs.readFile('static_html_contents.json', function(err, data){
  articles = JSON.parse(data.toString());
});

// app.use('/', index);
// app.use('/validPage', users);

app.get('/static_article/simple/:storyId', function(req, res, next){
  var article = articles[req.params.storyId];
  res.render('valid_article', {story: article.story, author: article.author, date: article.date, headline: article.headline});
});

app.get('/random_article', function(req, res, next){
  var story = loremIpsum({count: Math.floor(Math.random() * (30 - 10 + 1)) + 10, units:'sentences' , paragraphLowerBound: 4, paragraphLowerBound: 8});
  var author = loremIpsum({count: Math.floor(Math.random() * (3 - 2 + 1)) + 2, units:'words'});
  var dateObj = new Date();
  var date = (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '/' +  dateObj.getFullYear();
  var headline = loremIpsum({count: 1, units: 'sentences'});
  res.render('valid_article', {story: story, author: author, date: date, headline: headline});
});

app.get('/temp_article/:id', function(req, res, next){
  if (fs.existsSync(path) == false) {
    res.send("Invalid id- file doesn't exist");
    return;
  }
  jsonfile.readFile('./random_articles/'+req.params.id+'.json', function(err, content) {
    res.render('valid_article', {story: content.story, author: content.author, date: content.date, headline: content.headline });
  });
});

app.post('/temp_article', function(req, res, next){
  if (req.body.id === undefined){
    res.status(400).send("Please enter an id");
  }
  var content = {story: req.body.story, author: req.body.author, date: req.body.date, headline: req.body.headline};
  jsonfile.writeFile('./random_articles/'+req.body.id+'.json', content);
  setTimeout(function () {
    fs.unlink('./random_articles/'+req.body.id+'.json');
  }, 10000);
  res.render('valid_article', {content: content});
});

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
