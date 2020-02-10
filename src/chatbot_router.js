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

var parsing_moudle = require('./parsing')
var parsing = parsing_moudle.init
var flag_function = parsing_moudle.flag_function
var make_response_text = parsing_moudle.make_response_text
var getTime = parsing_moudle.getTime
var server_message = parsing_moudle.server_message

var sessionData = require('./api/chatbot_api/session.data')

router.use('/', require('./api/chatbot_api')) // 단코드 변경, 로그아웃 API
router.use(bodyParser.urlencoded({
  extended: false
}))
router.use(bodyParser.json())

// 메인
router.get('/', function(req, res) {
  console.log("로그인 정보", req.session)
  // 세션 유지 처리
  return res.render("./chatbot/chat", {
    login: false,
    test: false
  })
})

// 메인테스트
router.get('/test', function(req, res) {
  console.log("로그인 정보", req.session)
  // 세션 유지 처리
  return res.render("./chatbot/chat", {
    login: false,
    test: true
  })
})

// 로그인
router.post('/login/:route', async function(req, res) {
  // 세션 유지 처리
  const id = req.body.id
  const pw = req.body.password
  const server = req.body.server
  const route = req.params.route

  if (id == "" || id == null || id == undefined)
    return res.send(alertAndRedirect("아이디를 적어주세요", "/"))
  if (pw == "" || pw == null || pw == undefined)
    return res.send(alertAndRedirect("비밀번호를 적어주세요", "/"))
  if (server == "" || server == null || server == undefined)
    return res.send(alertAndRedirect("서버를 적어주세요", "/"))
  if (route != "icon" && route != "homepage")
    return res.send(alertAndRedirect("잘못된 경로 입니다", "/"))

  // 로그인 api 사용
  const auth = await imc.authorize(id, pw)
  // 로그인 실패
  if (auth.response_code != "OK")
    return res.send(alertAndRedirect("아이디 또는 비밀번호가 틀립니다.", "/"))

  console.log("로그인 통신 결과", auth)
  // 로그인 성공
  const session = {
    dancode: auth.result[0].dancode,
    username: auth.result[0].username,
    usergubun: auth.result[0].usergubun,
    information: {}, // 파싱한 정보 객체
    continue_flag: false, // 이전 정보를 유지하는 플래그
    start_flag: false, // START option 플래그
    api_information: null, // 정보에 관한 내용 플래그
    api_result: {}, // API 결과값 객체
    api_count: 0 // API 결과값 카운트
  }

  if (req.session[route] == null)
    req.session[route] = {}
  req.session[route][server] = session

  return res.redirect(`/chat/${route}/${server}`)
})

// 챗봇 화면
router.get('/chat/:route/:server', async function(req, res) {
  const route = req.params.route
  const server = req.params.server
  if ((route != "icon" && route != "homepage") || req.session[route] == null || req.session[route][server] == null)
    return res.send(alertAndRedirect("잘못된 경로 입니다", "/"))

  console.log("현재 세션", req.session)
  // 새로 고침 시 기존데이터 삭제
  req.session[route][server].api_result = {}
  req.session[route][server].api_count = 0
  const sessionID = req.session.id
  const username = req.session[route][server].username
  if (route == "homepage") {
    if (sessionData[server] == null) sessionData[server] = {}
    if (sessionData[server][username] == null) sessionData[server][username] = {}
    sessionData[server][username].sessionID = sessionID
  }

  const currSession = req.session[route][server]
  // 로그인 활성화
  if (currSession.dancode) {
    const login = await flag_function("LOGIN", currSession, server)
    return res.render('./chatbot/chat', {
      login,
      route,
      server,
      information: currSession, // 소켓 이용
      dancode: currSession.dancode,
      username: currSession.username,
      usergubun: currSession.usergubun
    })
  } else {
    // 로그인 필요
    return res.send(alertAndRedirect("로그인이 필요합니다.", "/"))
  }
})

// 파싱 라우터
router.post('/parsing', async function(req, res) {
  // console.log("현재 세션", req.session)
  const route = req.body.route
  const server = req.body.server
  const flag = req.body.flag
  const text = req.body.text
  const dancode = req.session[route][server].dancode
  const username = req.session[route][server].username
  const time = moment().format('YYYY-MM-DD HH:mm:ss.SSS')
  // if (text.length) {
  //   await sqlQuery(`
  //     INSERT INTO _Log(_time, dancode, id, query)
  //     VALUES('${time}','${dancode}','${username}','${await replace_quotes(text)}')`)
  // }
  const parsing_object = await parsing(flag, text, req.session[route][server], server)
  // console.log("/parsing 라우터 결과", req.session[route][server])
  return res.json(parsing_object)
})

// api 통신
router.post('/chat/response', async function(req, res) {
  const route = req.body.route
  const server = req.body.server
  let api_information = req.body.api_information
  let data = req.body.information
  let url = api_information.url
  const rest_method = api_information.rest_method
  const api_name = api_information.api_name

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
  req.session[route][server].api_count += 1
  let count = req.session[route][server].api_count
  req.session[route][server].api_result[count] = result
  // console.log("REST API 통신완료 하였으며, 결과값은", result)

  if (resultFlag) {
    str = "<a class='new_window' href='"
    str += `/chat/${route}/${server}/response/${api_name}?data=${count}`
    str += "' target='_blank'>"
    str += await make_response_text(Response.LINK)
    str += "</a>"
    return res.json(await server_message(str))
  } else {
    str = await make_response_text(Response.ERROR)
    return res.json(await server_message(str))
  }
})

// api 새창
router.get('/chat/:route/:server/response/:api_name', async function(req, res) {
  const route = req.params.route
  const server = req.params.server
  const information = req.session[route][server].information
  const api_name = req.params.api_name
  let result = req.session[route][server].api_result[JSON.parse(req.query.data)] // 세션에 있던거 불러옴
  /* result.length 만큼 반복 */
  let str = ""
  let keys = Object.keys(result[0].result[0])
  for (let i = 0; i < result.length; i++) {
    let responseText = Api[server][api_name].response_text
    str += "<h3>"
    for (let item in information) {
      let prop = information[item]
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

// 알림 후 리다이렉트
function alertAndRedirect(text, link) {
  return `<script>
            alert("${text}")
            location.href="${link}"
          </script>`
}

// 따옴표 처리
async function replace_quotes(text) {
  return text.replace(/'/gi, "''")
}

module.exports = router
