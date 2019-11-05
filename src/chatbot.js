const express = require('express')
const router = express.Router()
const imc = require('./imc')
const config = require('./config')
const bodyParser = require('body-parser')
var read_DB = config.read_DB
var Api = config.Api
var Parameter = config.Parameter
var Regexpr = config.Regexpr
var initialize = config.initialize
var init = config.init

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
  console.log('url앞에 데이터', data)
  let url = data.information.url
  let api_name = data.information.api_name
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
  // req.session[api_name] = data
  return res.json(result)
})

router.get('/chat/response/:api_name', async function(req, res) {
  let api_name = req.params.api_name
  let url = Api[api_name].url
  let parameters = Parameter[api_name]
  let data = {}
  for (let tmp in parameters) {
    if (req.query[parameters[tmp].parameter]) {
      data[parameters[tmp].parameter] = req.query[parameters[tmp].parameter]
    }
  }
  console.log('변환결과 -> ', data)
  const response = await imc.rest_api_function(data, url)
  console.log("REST API 통신 결과", response)
  let str
  if (response.response_code == "OK" && response.message == "success") {
    let result = response.result
    let keys = Object.keys(result[0])
    str = "<table border='1'>"
    str += "<thead>"
    str += "<tr>"
    for (let tmp in keys) {
      str += "<th>"
      str += keys[tmp]
      str += "</th>"
    }
    str += "</tr>"
    str += "</thead>"
    str += "<tbody>"
    for (let tmp in result) {
      str += "<tr>"
      for (let values in result[tmp]) {
        str += "<td>"
        str += result[tmp][values]
        str += "</td>"
      }
      str += "</tr>"
    }
    str += "</tbody>"
    str += "</table>"
  } else {
    str = "조회를 할 수 없거나 결과가 없습니다."
  }
  return res.send(str)
})

// 파싱
router.post('/parsing', async function(req, res) {
  let text = req.body.text
  let ret = await init(text, req.session)
  console.log('파싱결과 -> ', text, ret)
  return res.json(ret)
})

module.exports = router;
