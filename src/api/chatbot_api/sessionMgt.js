const Redis = require('redis') // 레디스
const client = Redis.createClient() // 레디스
const session = require('express-session') // 세션
var redisStore = require('connect-redis')(session) // 레디스
var sessionData = require('./session.data')
const express = require('express') // 익스프레스

module.exports = async function(req, res, next) {
  if (req.session.username) {
    if (sessionData[req.session.username]) {
      sessionData[req.session.username].sessionID = req.session.id
    } else {
      sessionData[req.session.username] = {}
      sessionData[req.session.username].sessionID = req.session.id
    }
  }
  next()
}
