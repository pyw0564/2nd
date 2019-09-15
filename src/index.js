/* jshint esversion: 8 */
const express = require('express')
var app = express();
const Redis = require('redis')
const client = Redis.createClient()
const session = require('express-session')
var redisStore = require('connect-redis')(session)
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
  secret: '1a3sdfg3#$#@13%#45asfsd',
  store: new redisStore({ client:client }),
  resave: false,
  saveUninitialized: true
}))

app.set('view engine', 'pug');
app.set('views', './views');
app.use('/', express.static(__dirname));
app.use('/adm', require('./adm'));
app.use('/', require('./chatbot'));
app.locals.pretty = true;

app.listen(3000, function(err) {
  console.log("connected 3000 port");
});
