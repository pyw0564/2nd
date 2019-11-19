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
var init = config.init
var sqlQuery = config.sqlQuery
var cancel_function = config.cancel_function
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
      console.log("Database_read initialize complete")
    }
    let info = {
      login: true,
      dancode: req.session.dancode,
      username: req.session.username,
      usergubun: req.session.usergubun
    }
    return res.render('chat', info)
  }
  return res.redirect('/')
})

// api 통신
router.post('/chat/response', async function(req, res) {
  let data = req.body.data
  const url = data.information.url
  const api_name = data.information.api_name

  let index_Object = {}
  let max_index = 0
  for (let item in data) {
    if (typeof data[item] != 'object') {
      delete data[item]
    } else {
      if (data[item].result) {
        if (Array.isArray(data[item].result)) {
          index_Object[item] = {
            index : 0,
            length : data[item].result.length
          }
          if (max_index < index_Object[item].length)
            max_index = index_Object[item].length
        }
      } else {
        delete data[item]
      }
    }
  }
  let result = []
  // JSON 형식으로 데이터 가공
  for (let i = 0; i < max_index; i++) {
    let json_object = {}
    for (let item in data) {
      if (Array.isArray(data[item].result)) {
        let index_item = index_Object[item]
        json_object[item] = data[item].result[index_item.index]
        if (index_item.index < index_item.length - 1) {
          index_item.index += 1
        }
      } else {
        json_object[item] = data[item].result
      }
    }
    // console.log(json_object)
    let ret = await imc.rest_api_function(json_object, url)
    result.push(ret)
  }
  console.log("REST API 통신")
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
    str = "조회를 할 수 없거나 결과가 없습니다"
  }
  return res.send(str)
})

// 파싱
router.post('/parsing', async function(req, res) {
  let text = req.body.text
  let ret = await init(text, req.session)

  let now = moment().format('YYYY-MM-DD HH:mm:ss');
  sqlQuery(`INSERT INTO _Log(_time, dancode, id, query)
          VALUES('${now}','${req.session.dancode}','${req.session.username}','${text}')`)
  console.log('파싱결과 -> ', ret)
  return res.json(ret)
})

// ESC, API 통신 완료시 cancle 구현
router.post('/cancel', async function(req, res) {
  let flag = req.body.flag
  let ret = cancel_function(flag)
  return res.json(ret)
})

module.exports = router;
