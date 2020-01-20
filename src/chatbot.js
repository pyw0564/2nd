const express = require('express')
const router = express.Router()
const imc = require('./api/imc_api')
const bodyParser = require('body-parser')
const moment = require('moment')

var read_database = require('./read_database')
var Api = read_database.Api
var Parameter = read_database.Parameter
var Regexpr = read_database.Regexpr
var Recommend = read_database.Recommend
var Response = read_database.Response
var sqlQuery = read_database.sqlQuery
var parsing = require('./parsing').init
var flag_function = require('./parsing').flag_function

router.use('/', require('./api/chatbot_api')) // 단코드 변경, 로그아웃 API
router.use(bodyParser.urlencoded({
  extended: false
}))
router.use(bodyParser.json())

// 메인
router.get('/', function(req, res) {
  // 세션 유지 처리
  if (req.session.dancode)
    return res.redirect('/chat')

  return res.render("chat", {
    login: false
  })
})

// 로그인
router.post('/login', async function(req, res) {
  // 세션 유지 처리
  if (req.session.dancode)
    return res.redirect('/chat')

  const id = req.body.userid
  const pw = req.body.userpw
  const dancode = req.body.dancode
  // 로그인 api 사용
  const auth = await imc.authorize(id, pw)
  // 로그인 실패
  if (auth.response_code != "OK") {
    return res.send(alertAndRedirect("아이디 또는 비밀번호가 틀립니다.", "/"))
  }
  // 로그인 성공
  req.session.dancode = auth.result[0].dancode
  req.session.username = auth.result[0].username
  req.session.usergubun = auth.result[0].usergubun
  req.session.information = {} // 파싱한 정보 객체
  req.session.flag = null // 정보 유지를 위한 플래그
  req.session.continue_flag = null
  req.session.start_flag = false
  return res.redirect("/chat")
})

// 챗봇 화면
router.get('/chat', async function(req, res) {
  // 세션 처리
  if (req.session.dancode) {
    let login_object = await flag_function("LOGIN", req.session)
    // 파싱 테이블 초기화
    return res.render('chat', {
      login: true,
      login_object: login_object, // 로그인 시작 메시지 이용
      information: req.session, // 소켓 이용
      dancode: req.session.dancode,
      username: req.session.username,
      usergubun: req.session.usergubun
    })
  }
  // 로그인 필요
  return res.send(alertAndRedirect("로그인이 필요합니다.", "/"))
})

// 파싱 라우터
router.post('/parsing', async function(req, res) {
  let flag = req.body.flag
  let text = req.body.text
  let parsing_object = await parsing(flag, text, req.session)
  // console.log("/parsing 라우터 결과", parsing_object)
  console.log("/parsing 라우터 결과", req.session)
  return res.json(parsing_object)
})

// api 통신
router.post('/chat/response', async function(req, res) {
  let data = req.body.object
  // console.log('/chat/response REST API 통신 라우터', data)
  // 만약 세션에 남아있다면 바로 처리

  let information = data.API_information
  let url = information.url
  const rest_method = information.rest_method
  const api_name = information.api_name

  // 인덱스 카운트 객체
  let index_object = {}
  let max_index = 0
  for (let item in data) {
    // 오브젝트 아니거나 파라미터 값아니면 날린다.
    if (typeof data[item] != 'object' || data[item].result == null) {
      delete data[item]
      continue
    }
    if (Array.isArray(data[item].result)) { //만약 배열이면 카운트 측정
      index_object[item] = {
        index: 0,
        length: data[item].result.length
      }
      if (max_index < index_object[item].length)
        max_index = index_object[item].length
    }
  }

  let stringify_data = JSON.stringify(data)

  /* GET METHOD */
  let urlArray = []
  if (rest_method == 'get') {
    let url_parameters = url.split('/')
    for (let i in url_parameters) {
      let url_parameter = url_parameters[i]
      let length = url_parameter.length
      if (url_parameter[0] == '{' && url_parameter[length - 1] == '}')
        urlArray.push(url_parameter)
    }
  }
  let result = []
  let resultFlag = false
  // JSON 형식으로 데이터 가공, 동시검색 지원 -> 배열로 반환
  for (let i = 0; i < max_index; i++) {
    let json_object = {}
    for (let item in data) {
      if (Array.isArray(data[item].result)) { // 인덱스 카운트 객체를 사용하여 하나씩 진행
        let index_item = index_object[item]
        if (data[item].result[index_item.index])
          json_object[item] = data[item].result[index_item.index].return_value
        if (index_item.index < index_item.length - 1)
          index_item.index += 1
      } else {
        json_object[item] = data[item].result
      }
    }

    // API 통신 시작
    let rest_api_result
    if (rest_method == 'post') { // post rest api
      rest_api_result = await imc.rest_api_function(json_object, Parameter[api_name], url, 'post')
    } else if (rest_method == 'get') { // get rest api
      let get_url = url
      for (let j = 0; j < urlArray.length; j++) {
        let parameter = urlArray[j]
        get_url = get_url.replace(parameter, json_object[parameter.substr(1, parameter.length - 2)])
      }
      rest_api_result = await imc.rest_api_function(json_object, Parameter[api_name], get_url, 'get')
    }
    // API 통신 완료
    if (rest_api_result.response_code == 'OK')
      resultFlag = true
    // 1개의 결과 값일때 배열로 오지 않음, 배열로 전환 함
    if (!Array.isArray(rest_api_result.result)) {
      rest_api_result.result = [rest_api_result.result]
    }
    rest_api_result.keyValue = json_object
    // 결과값 배열에 저장
    result.push(rest_api_result)
  }
  // 최종 결과값 세션에 저장
  req.session[stringify_data] = result
  // console.log("REST API 통신완료 하였으며, 결과값은", result)

  if (resultFlag) {
    str = "<a class='new_window' href='"
    str += "/chat/response/" + api_name + "?"
    str += "data="
    str += JSON.stringify(data)
    str += "' target='_blank'>"
    str += await make_response_text(Response.LINK)
    str += "</a>"
    return res.json(server_message(str))
  } else {
    str = await make_response_text(Response.ERROR)
    return res.json(server_message(str))
  }
})

// api 새창
router.get('/chat/response/:api_name', async function(req, res) {
  let data = JSON.parse(req.query.data)
  const url = req.session.information.API_information.url
  const api_name = req.session.information.API_information.api_name
  let result = req.session[req.query.data] // 세션에 있던거 불러옴

  /* result.length 만큼 반복 */
  let str = ""
  let keys = Object.keys(result[0].result[0])
  for (let i = 0; i < result.length; i++) {
    let responseText = Api[api_name].response_text
    str += "<h3>"
    for (let item in data) {
      let prop = data[item]
      if (prop.result && Array.isArray(prop.result)) {
        let index = i < prop.result.length - 1 ? i : prop.result.length - 1
        let value = prop.result[index].parsing_value
        // default는 parsing_value 사용 ex) 관리비 입력시 1 (X) 관리비 (O)
        // parameter의 return_value 없으면 return value 사용 ex) 101동 입력시 101 (O) 101동 (X)
        if (Regexpr[item][0].return_value == '' || Regexpr[item][0].return_value == null) {
          value = prop.result[index].return_value
        }
        responseText = responseText.replace(`{${item}}`, value)
      }
    }
    str += responseText
    str += "</h3>"

    str += "<table border='1'>"
    str += "<thead>"
    str += "<tr>"
    for (let tmp in keys) {
      str += "<th>"
      str += keys[tmp]
      str += "</th>"
    }
    str += "</tr>"
    str += "</thead>"
    let resultValue = result[i]
    if (resultValue.response_code == "OK" && resultValue.message == "success") {
      str += "<tbody style='border-bottom:3px double black'>"
      for (let tmp in resultValue.result) {
        str += "<tr>"
        for (let values in resultValue.result[tmp]) {
          str += "<td>"
          str += resultValue.result[tmp][values]
          str += "</td>"
        }
        str += "</tr>"
      }
      str += "</tbody>"
    }
    str += "</table>"
  }

  return res.send(str)
})

// 로그 처리 라우터
router.post('/insertLog', async function(req, res) {
  let text = req.body.text

  // console.log('로그 텍스트입니다', text)
  // let now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  // await sqlQuery(`INSERT INTO _Log(_time, dancode, id, query)
  // VALUES('${now}','${req.session.dancode}','${req.session.username}','${text}')`)
  return res.json()
})

// 알림 후 리다이렉트
function alertAndRedirect(text, link) {
  return `<script>
            alert("${text}")
            location.href="${link}"
          </script>`
}

// 시간 구하기
function getTime() {
  var currentTime = new Date()
  return (currentTime.getHours() < 10 ? '0' + currentTime.getHours() : currentTime.getHours()) + ":" +
    (currentTime.getMinutes() < 10 ? '0' + currentTime.getMinutes() : currentTime.getMinutes()) + ":" +
    (currentTime.getSeconds() < 10 ? '0' + currentTime.getSeconds() : currentTime.getSeconds())
}

// 서버함수
function server_message(str) {
  let msg = "<div class='msg'>"
  msg += "<div class='user'>System</div>"
  msg += "<div class='content'>"
  msg += "<div class='data notme'>" + str + "</div>"
  msg += "<div class='time'>" + getTime() + "</div>"
  msg += "</div>"
  msg += "</div>"
  return msg
}

async function make_response_text(response_array) {
  let str = ""
  for (let i in response_array) {
    let response_text = response_array[i].response_text
    if (response_array[i]._order == 0) {
      str = `<div class='object_message'>${response_text}</div>`
    } else {
      str += `<div>${response_text}</div>`
    }
  }
  return str
}

module.exports = router;
