const express = require('express')
const router = express.Router()
const imc = require('./imc')
const config = require('./config')
const bodyParser = require('body-parser')
const moment = require('moment');
var read_DB = config.read_DB
var Api = config.Api
var Parameter = config.Parameter
var Regexpr = config.Regexpr
var initialize = config.initialize
var parsing = config.init
var sqlQuery = config.sqlQuery
// Body parser
router.use(bodyParser.urlencoded({
  extended: false
}))
router.use(bodyParser.json())

// 메인
router.get('/', function(req, res) {
  // 세션 유지 처리
  if (req.session.dancode) {
    return res.redirect('/chat')
  }
  res.render("chat", {
    login: false
  })
})

// 로그인
router.post('/login', async function(req, res) {
  // 세션 유지 처리
  if (req.session.dancode) {
    return res.redirect('/chat')
  }
  const id = req.body.userid
  const pw = req.body.userpw
  const dancode = req.body.dancode
  // 로그인 api 사용
  const auth = await imc.authorize(id, pw)
  console.log("로그인", auth, id, pw)
  if (auth.response_code != "OK") {
    res.send(`
        <script>
          alert("아이디 또는 비밀번호가 틀립니다.")
          location.href = "/"
        </script>
      `)
  } else {
    // req.session.dancode = 'nono'
    // req.session.username = 'haha'
    // req.session.usergubun = '1234'
    req.session.database_read = false
    req.session.dancode = auth.result[0].dancode
    req.session.username = auth.result[0].username
    req.session.usergubun = auth.result[0].usergubun
    res.redirect("/chat")
  }
})

// 챗봇 화면
router.get('/chat', async function(req, res) {
  // DB READ FLAG
  req.session.database_read = false

  // 세션 처리
  if (req.session.dancode) {
    // 파싱 테이블 초기화
    if (req.session.database_read == false) {
      req.session.database_read = true
      await initialize()
      await read_DB()
      console.log("database_read initialize complete")
    }
    let info = {
      login: true,
      Api: Api,
      Parameter: Parameter,
      Regexpr: Regexpr,
      dancode: req.session.dancode,
      username: req.session.username,
      usergubun: req.session.usergubun
    };
    return res.render('chat', info)
  }
  return res.redirect('/')
})

// api 통신
router.post('/chat/response', async function(req, res) {
  let data = req.body.data
  let url = data.information.url
  for (let item in data) {
    if (typeof data[item] != 'object') {
      delete data[item]
    } else {
      if (data[item].result) {
        data[item] = data[item].result
      } else {
        delete data[item]
      }
    }
  }
  console.log('변환결과 -> ', data)
  const result = await imc.rest_api_function(data, url)
  console.log("REST API 통신 결과", result)
  return res.json(result)
})

// 파싱
router.post('/parsing', async function(req, res) {
  let text = req.body.text
  let ret = parsing(text, req.session)

	let now = moment().format('YYYY-MM-DD-HH-mm-ss');
  sqlQuery(`INSERT INTO _Log(_time, dancode, id, query)
          VALUES('${now}','${req.session.dancode}','${req.session.username}','${text}')`)
  console.log('파싱결과 -> ', ret)
  return res.json(ret)
})

module.exports = router;
