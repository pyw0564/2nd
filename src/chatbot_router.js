const express = require('express')
const router = express.Router()
const imc = require('./api/imc_api')
const decryptor = imc.decryptor
const bodyParser = require('body-parser')
const moment = require('moment')
const fs = require('fs')

var read_database = require('./read_database')
var Api = read_database.Api
var Parameter = read_database.Parameter
var Regexpr = read_database.Regexpr
var Recommend = read_database.Recommend
var Response = read_database.Response
var Service = read_database.Service
var Session = read_database.Session
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
  if (req.session.icon == null)
    req.session.icon = {}
  var css = JSON.parse(fs.readFileSync("./css/window.json"))

  console.log("로그인 정보", req.session)
  return res.render("./chatbot/chat", {
    Service,
    login: false,
    test: false,
    css: css
  })
})

// 메인테스트
router.get('/test', function(req, res) {
  if (req.session.homepage == null)
    req.session.homepage = {}
  console.log("로그인 정보", req.session)
  return res.render("./chatbot/chat", {
    Service,
    login: false,
    test: true
  })
})

// 연동로그인
router.post('/login/homepage', async function(req, res) {
  try {
    let ssotoken = req.body.ssotoken
    console.log(ssotoken)
    // let ssotoken = require('./api/example')("test","youngwoo","bankdata","1413","hoffice");
    let auth = decryptor.login(ssotoken)
    console.log(auth)
    // 로그인 성공, 세션 객체 생성
    if (auth.userid == null || auth.userid == undefined) {
      return res.send(await alertAndRedirect("토큰 중 아이디 정보가 없습니다.", "/"))
    }
    if (auth.service == null || auth.service == undefined) {
      return res.send(await alertAndRedirect("토큰 중 서비스 정보가 없습니다.", "/"))
    }
    const session = {
      id: auth.userid ? auth.userid : null,
      username: auth.username ? auth.username : null,
      dancode: auth.dancode ? auth.dancode : null,
      danjiname: auth.danjiname ? auth.danjiname : null,
      usergubun: auth.usergubun ? auth.usergubun.toLowerCase() : "nothing",
      information: {}, // 파싱한 정보 객체
      continue_flag: false, // 이전 정보를 유지하는 플래그
      start_flag: false, // START option 플래그
      api_information: null, // 정보에 관한 내용 플래그
      api_result: {}, // API 결과값 객체
      api_count: 0 // API 결과값 카운트
    }
    let service = auth.service
    if (req.session.homepage == null) req.session.homepage = {}
    req.session.homepage[service] = session
    return res.redirect(`/chat/homepage/${service}`)
  } catch (e) {
    return res.send(await alertAndRedirect("로그인 중 오류가 발생했습니다.", "/"))
  }
})

// 로그인
router.post('/login/icon', async function(req, res) {
  // 세션 유지 처리
  const id = req.body.id
  const pw = req.body.password
  const service = req.body.service
  const dancode = req.body.dancode

  // 비어있는 값 있으면 에러
  for (let item in req.body) {
    let value = req.body[item]
    if (value == "" || value == null || value == undefined)
      return res.send(await alertAndRedirect(`${item} 값을 적어주세요!`, "/"))
  }

  // 로그인 api 사용
  const auth = await imc.authorize({
    id,
    pw,
    dancode,
    service
  })
  console.log("로그인 통신 결과", auth)

  // 로그인 실패
  if (auth.response_code != "OK")
    return res.send(await alertAndRedirect("입력하신 정보가 부정확합니다", "/"))

  // 로그인 성공, 세션 객체 생성
  const session = {
    id: id,
    username: auth.result[0].username ? auth.result[0].username : null,
    dancode: auth.result[0].dancode ? auth.result[0].dancode : null,
    danjiname: auth.result[0].danjiname ? auth.result[0].danjiname : null,
    usergubun: auth.result[0].usergubun ? auth.result[0].usergubun.toLowerCase() : "nothing",
    information: {}, // 파싱한 정보 객체
    continue_flag: false, // 이전 정보를 유지하는 플래그
    start_flag: false, // START option 플래그
    api_information: null, // 정보에 관한 내용 플래그
    api_result: {}, // API 결과값 객체
    api_count: 0 // API 결과값 카운트
  }

  req.session.icon[service] = session
  return await res.redirect(`/chat/icon/${service}`)
})

// 챗봇 화면
router.get('/chat/:route/:service', async function(req, res) {
  try {
    var css = JSON.parse(fs.readFileSync("./css/window.json"))

    const route = req.params.route
    const service = req.params.service
    if ((route != "icon" && route != "homepage") || req.session[route] == null || req.session[route][service] == null)
      return await res.send(await alertAndRedirect("잘못된 경로 입니다", '/'))

    console.log("현재 세션", req.session)
    // 새로 고침 시 기존데이터 삭제 (api_result, api_count)
    req.session[route][service].api_result = {}
    req.session[route][service].api_count = 0

    const id = req.session[route][service].id
    // 만약 연동이라면 세션아이디를 저장한다(동기화를 위해)
    if (route == "homepage") {
      if (sessionData[service] == null) sessionData[service] = {}
      if (sessionData[service][id] == null) sessionData[service][id] = {}
      sessionData[service][id].sessionID = req.session.id
    }
    console.log("전역세션데이타", sessionData)

    // 세션 시간
    const currSession = req.session[route][service]
    let sessionTime
    if (Session[route] && Session[route][service]) {
      sessionTime = Session[route][service]
    } else {
      return res.send(await alertAndRedirect("세션 시간이 설정되어있지 않습니다", '/'))
    }
    console.log(css)
    // 로그인 활성화
    if (currSession.dancode) {
      const login = await flag_function("LOGIN", currSession, service)
      return res.render('./chatbot/chat', {
        login,
        route,
        service,
        sessionTime,
        Service,
        information: currSession, // 소켓 이용
        dancode: currSession.dancode,
        username: currSession.username,
        danjiname: currSession.danjiname,
        usergubun: currSession.usergubun,
        css: css
      })
    } else {
      return res.send(await alertAndRedirect("로그인이 필요합니다.", "/"))
    }
  } catch (e) {
    return res.send(await alertAndRedirect("알 수 없는 오류가 발생했습니다", '/'))
  }
})

// 파싱 라우터
router.post('/parsing', async function(req, res) {
  // console.log("현재 세션", req.session)
  const route = req.body.route
  const service = req.body.service
  const flag = req.body.flag
  const text = req.body.text
  const dancode = req.session[route][service].dancode
  const id = req.session[route][service].id
  const time = await moment().format('YYYY-MM-DD HH:mm:ss.SSS')
  if (text.length) {
    await sqlQuery(`
      INSERT INTO _Log(_time, dancode, id, query)
      VALUES('${time}','${dancode}','${id}','${await replace_quotes(text)}')`)
  }
  await sqlQuery("") // ...??
  const parsing_object = await parsing(flag, text, req.session[route][service], service)
  await req.session.save()
  // console.log("/parsing 라우터 결과", req.session[route][service])
  return await res.json(parsing_object)
})

// api 통신
router.post('/chat/response', async function(req, res) {
  console.log(req.session.icon.bankdata.api_result)
  const route = req.body.route
  const service = req.body.service
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
    if (await Array.isArray(data[item].result)) { //만약 배열이면 카운트 측정
      index_object[item] = {
        index: 0,
        length: data[item].result.length
      }
      if (max_index < index_object[item].length)
        max_index = index_object[item].length
    }
  }

  let stringify_data = await JSON.stringify(data)

  /* GET METHOD */
  let urlArray = []
  if (rest_method == 'get') {
    let url_parameters = await url.split('/')
    for (let i in url_parameters) {
      let url_parameter = url_parameters[i]
      let length = url_parameter.length
      if (url_parameter[0] == '{' && url_parameter[length - 1] == '}')
        await urlArray.push(url_parameter)
    }
  }
  let result = []
  let resultFlag = false
  // JSON 형식으로 데이터 가공, 동시검색 지원 -> 배열로 반환
  for (let i = 0; i < max_index; i++) {
    let json_object = {}
    let keyValue = {}
    for (let item in data) {
      if (await Array.isArray(data[item].result)) { // 인덱스 카운트 객체를 사용하여 하나씩 진행
        let index_item = index_object[item]
        if (data[item].result[index_item.index]) {
          json_object[item] = data[item].result[index_item.index].return_value
          if (item == "yyyymm") // 예외처리
            keyValue[item] = data[item].result[index_item.index]
          else if (Regexpr[item][0].return_value == '' || Regexpr[item][0].return_value == null)
            keyValue[item] = json_object[item]
          else
            keyValue[item] = data[item].result[index_item.index].parsing_value
        }
        if (index_item.index < index_item.length - 1)
          index_item.index += 1
      } else {
        json_object[item] = data[item].result
        keyValue[item] = data[item].result
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
        get_url = await get_url.replace(parameter, json_object[await parameter.substr(1, parameter.length - 2)])
      }
      rest_api_result = await imc.rest_api_function(json_object, Parameter[api_name], get_url, 'get')
    }
    // API 통신 완료
    if (rest_api_result.response_code == 'OK')
      resultFlag = true
    // 1개의 결과 값일때 배열로 오지 않음, 배열로 전환 함
    if (await !Array.isArray(rest_api_result.result)) {
      rest_api_result.result = [rest_api_result.result]
    }
    // 새창 열어서 데이터 보여줄때 키값저장
    rest_api_result.keyValue = keyValue
    // 결과값 배열에 저장
    await result.push(rest_api_result)
  }
  // 최종 결과값 세션에 저장
  req.session[route][service].api_count += 1
  let count = req.session[route][service].api_count
  req.session[route][service].api_result[count] = result
  // console.log("REST API 통신완료 하였으며, 결과값은", result)

  if (resultFlag) {
    str = "<a class='new_window' href='"
    str += `/chat/${route}/${service}/response/${api_name}?data=${count}`
    str += "' target='_blank'>"
    str += await make_response_text(Response.LINK)
    str += "</a>"
    return await res.json(await server_message(str))
  } else {
    str = await make_response_text(Response.ERROR)
    return await res.json(await server_message(str))
  }
})

// api 새창
router.get('/chat/:route/:service/response/:api_name', async function(req, res) {
  const route = req.params.route
  const service = req.params.service
  const information = req.session[route][service].information
  const api_name = req.params.api_name
  let result = req.session[route][service].api_result[await JSON.parse(req.query.data)] // 세션에 있던거 불러옴
  /* result.length 만큼 반복 */
  console.log(result)
  let str = ""
  let keys
  // 테이블 Key 색출
  for (let i = 0; i < result.length; i++)
    if (result[i].result[0])
      keys = await Object.keys(result[i].result[0])

  for (let i = 0; i < result.length; i++) {
    let responseText = Api[service][api_name].response_text
    // 제목
    str += "<h3>"
    let keyValue = result[i].keyValue
    for (let item in keyValue) {
      let value = keyValue[item]
      if(item == "yyyymm") {
        responseText = await responseText.replace(`{yyyy}`, value.yyyy)
        responseText = await responseText.replace(`{mm}`, value.mm)
      }
      responseText = await responseText.replace(`{${item}}`, value)
    }
    str += responseText
    str += "</h3>"
    // 테이블 내용
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
  return await res.send(str)
})

// 알림 후 리다이렉트
async function alertAndRedirect(text, link) {
  let str = `<script> alert("${text}");`
  if (link)
    str += `location.href="${link}";`
  str += `</script>`
  return str
}

// 따옴표 처리
async function replace_quotes(text) {
  return await text.replace(/'/gi, "''")
}

module.exports = router
