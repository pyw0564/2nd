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
var Recommend = config.Recommend
var Count = config.Count
var initialize = config.initialize
var init = config.init
var sqlQuery = config.sqlQuery
var flag_function = config.flag_function
var sessionData = require('./imc/session.data');
const Redis = require('redis') // 레디스
const client = Redis.createClient() // 레디스
const {
  promisify
} = require('util');
const getAsync = promisify(client.get).bind(client);
const io = require('./socketMgt').getIO();

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
  // console.log("로그인", auth, id, pw)
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
    req.session.information = {} // 파싱한 정보 객체
    req.session.flag = null // 정보 유지를 위한 플래그
    req.session.continue_flag = null

    return res.redirect("/chat")
  }
})

// 챗봇 화면
router.get('/chat', async function(req, res) {
  // console.log(Count)
  if (Count.count == false) {
    await read_DB(req.session)
    console.log("Database_read initialize complete")
    Count.count = true
  }
  // console.log("session id: ", req.session.id)
  // console.log("/chat 세션 정보", req.session, sessionData)
  // DB READ FLAG, 실제 서비스 시 제거
  // 세션 처리
  if (req.session.dancode) {
    // 파싱 테이블 초기화
    let info = {
      login: true,
      information: req.session,
      dancode: req.session.dancode,
      username: req.session.username,
      usergubun: req.session.usergubun
    }
    return res.render('chat', info)
  }
  return res.redirect('/')
})

// 파싱하는 라우터
router.post('/parsing', async function(req, res) {
  // console.log(req.session)
  let query_flag = req.body.flag
  let text = req.body.text
  let parsing_object = await init(query_flag, text, req.session)
  console.log("파싱오브젝트", parsing_object)
  return res.json(parsing_object)
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

// api 통신
router.post('/chat/response', async function(req, res) {
  let data = req.body.data
  let data_tmp = JSON.stringify(data)
  console.log('REST API 통신 라우터입니다 /chat/response', data)
  let url = data.API_information.url
  const rest_method = data.API_information.rest_method
  const api_name = data.API_information.api_name

  // index count Object.. FOR ARRAY PROPERTY
  let index_Object = {}
  let max_index = 0
  for (let item in data) {
    if (typeof data[item] != 'object' || !data[item].result) { // 오브젝트 아니거나 파라미터 값아니면 날린다.
      delete data[item]
      continue
    }
    if (Array.isArray(data[item].result)) { //만약 배열이면
      index_Object[item] = {
        index: 0,
        length: data[item].result.length
      }
      if (max_index < index_Object[item].length)
        max_index = index_Object[item].length
    }
  }
  /* GET METHOD */
  let urlArray = []
  if (rest_method == 'get') {
    let urlArray_temp = url.split('/')
    for (let i in urlArray_temp)
      if (urlArray_temp[i][0] == '{')
        urlArray.push(urlArray_temp[i])
  }
  let result = []
  let resultFlag = false
  // JSON 형식으로 데이터 가공, 동시검색 지원 -> 배열로 반환
  for (let i = 0; i < max_index; i++) {
    let url_temp = url
    let json_object = {}
    for (let item in data) {
      if (Array.isArray(data[item].result)) {
        let index_item = index_Object[item]
        // console.log(data[item].result, index_item.index)
        if (data[item].result[index_item.index])
          json_object[item] = data[item].result[index_item.index].return_value
        if (index_item.index < index_item.length - 1)
          index_item.index += 1
      } else {
        json_object[item] = data[item].result
      }
    }
    let rest_api_result
    // console.log("json_object", json_object)
    if (rest_method == 'post') { // post rest api
      rest_api_result = await imc.rest_api_function(json_object, Parameter[api_name], url_temp, 'post')
    } else if (rest_method == 'get') { // get rest api
      for (let j = 0; j < urlArray.length; j++) {
        let param = urlArray[j]
        url_temp = url_temp.replace(param, json_object[param.substr(1, param.length - 2)])
      }
      // console.log("GET 통신 왜 안돼..", json_object, url)
      rest_api_result = await imc.rest_api_function(json_object, Parameter[api_name], url_temp, 'get')
    }
    if (rest_api_result.response_code == 'OK')
      resultFlag = true
    if (!Array.isArray(rest_api_result.result)) {
      rest_api_result.result = [rest_api_result.result]
    }
    rest_api_result.keyValue = json_object
    result.push(rest_api_result)
  }
  req.session[data_tmp] = result
  console.log("REST API 통신완료, 결과값", result)

  if (resultFlag) {
    return res.json('Y')
  } else {
    return res.json('N')
  }
})

// api 새창
router.get('/chat/response/:api_name', async function(req, res) {
  let data = JSON.parse(req.query.data)
  const url = data.API_information.url
  const api_name = data.API_information.api_name
  let result = req.session[req.query.data]

  // console.log("새창 세션 활용~", data)
  // console.log("새창 세션 활용~", result)

  /* result.length 만큼 반복 */
  /* replace response text */
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
router.get('/logout', function(req, res) {
  req.session.destroy()
  return res.send(`
    <script>
      alert('로그아웃 되었습니다.');
      location.href = '/';
    </script>`)
})

router.post('/logout', function(req, res) {
  const username = req.body.username;
  try {
    const {
      socketID
    } = sessionData[username];

    io.to(socketID).emit('logout', true);
    return res.send({
      status: 200,
      message: `success logout: ${username}`
    })
  } catch (err) {
    return res.send({
      status: 400,
      message: `user not found ${username}`
    })
  }
});

router.post('/change/dancode', async function(req, res) {
  const username = req.body.username;
  const from = req.body.from; // 이전 단지 번호
  const to = req.body.to; // 바꿀 단지 번호
  // const username = "챗봇테스터001"
  // 챗봇테스터001
  // 1. redis에서 유저정보 들고옴
  const {
    sessionID,
    socketID
  } = sessionData[username];

  let data = await getAsync(`sess:${sessionID}`);
  data = JSON.parse(data);

  // 2. 현재 단코드와 받은 단코드 비교
  if (from == data.dancode) {
    data.dancode = to;

    client.set(`sess:${sessionID}`, JSON.stringify(data), Redis.print);
    console.log("소켓", socketID);
    io.to(socketID).emit('/change/dancode', {
      dancode: to
    });
    return res.send({
      status: 200,
      message: "Session destroy"
    })
  }
  // 3. 변경
  return res.send({
    status: 403,
    message: "현재 단지코드가 일치하지 않습니다."
  })

})

module.exports = router;
