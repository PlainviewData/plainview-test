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

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var static_articles;
var nonstatic_articles;

function generateRandomArticle(){
  var story = loremIpsum({count: Math.floor(Math.random() * (30 - 10 + 1)) + 10, units:'sentences' , paragraphLowerBound: 4, paragraphLowerBound: 8});
  var author = loremIpsum({count: Math.floor(Math.random() * (3 - 2 + 1)) + 2, units:'words'});
  var dateObj = new Date();
  var date = (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '/' +  dateObj.getFullYear();
  var headline = loremIpsum({count: 1, units: 'sentences'});
  return {story: article.story, author: article.author, date: article.date, headline: article.headline};
}

fs.readFile('static_html_contents.json', function(err, data){
  static_articles = JSON.parse(data.toString());
});

app.get('/static_article/simple/:storyId', function(req, res, next){
  var article = static_articles[req.params.storyId];
  res.render('valid_article', {story: article.story, author: article.author, date: article.date, headline: article.headline});
});

app.get('/nonstatic_article/simple/:storyId', function(req, res, next){
  res.render('valid_article', {story: article.story, author: article.author, date: article.date, headline: article.headline});
});

app.get('/random_article', function(req, res, next){
  res.render('valid_article', generateRandomArticle());
});

app.get('/temp_article/:id', function(req, res, next){
  if (fs.existsSync(path.join(__dirname, req.params.id+'.json')) == false) {
    res.send("Invalid id- file doesn't exist");
    return;
  }
  jsonfile.readFile(path.join(__dirname, req.params.id+'.json'), function(err, content) {
    res.render('valid_article', content);
  });
});

app.post('/temp_article', function(req, res, next){
  if (req.body.id === undefined){
    res.status(400).send("Please enter an id");
  }
  var content = {story: req.body.story, author: req.body.author, date: req.body.date, headline: req.body.headline};
  jsonfile.writeFile(path.join(__dirname, req.body.id+'.json'), content);
  setTimeout(function () {
    fs.unlink(path.join(__dirname, req.body.id+'.json'));
  }, 10000);
  res.render('valid_article', content);
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
