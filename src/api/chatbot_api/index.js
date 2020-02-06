const express = require('express')
const router = express.Router()

const Redis = require('redis') // 레디스
const client = Redis.createClient() // 레디스
const {
  promisify
} = require('util')
const getAsync = promisify(client.get).bind(client)
var sessionData = require('./session.data')
const io = require('./socketMgt').getIO()

var Response = require('./../../read_database').Response

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({
  extended: false
}))
router.use(bodyParser.json())

// 로그아웃 동기화
router.post('/logout', function(req, res) {
  try {
    const server = req.body.server
    const username = req.body.username
    const {
      socketID
    } = sessionData[server][username]
    delete sessionData[server][username]

    io.to(socketID).emit('logout', true);
    return res.send({
      server: server,
      username: username,
      status: 200,
      message: `성공적으로 ${username}가 로그아웃 되었습니다.`
    })
  } catch (err) {
    return res.send({
      server: server,
      username: username,
      status: 400,
      message: `${username}를 세션에서 찾을 수 없습니다.`
    })
  }
})

// 로그아웃
router.post('/logout/session', function(req, res) {
  try {
    const route = req.body.route
    const server = req.body.server
    delete req.session[route][server]

    let str = ""
    let response_array = Response["LOGOUT"]
    for (let i in response_array) {
      let response_text = response_array[i].response_text
      str += response_text
    }
    return res.json({
      responseText: str
    })
  } catch (e) {
    return res.json({
      responseText: "로그아웃 중 오류발생!"
    })
  }
})

// icon 단지코드 변경
// 자기자신 세션 redis로안바꿔짐 ㅡㅡ 이렇게해야함
router.post('/change/icon/dancode', async function(req, res) {
  try {
    const server = req.body.server
    const from = req.body.from // 이전 단지 번호
    const to = req.body.to // 바꿀 단지 번호
    const dancode = req.session.icon[server].dancode // 세션 단지코드
    if (from == dancode) {
      req.session.icon[server].dancode = to
      return res.json({
        from,
        to,
        status: 200,
        message: `${from}에서 ${to}로 변경이 완료되었습니다.`
      })
    } else {
      return res.json({
        from,
        to,
        status: 403,
        message: `보내주신 단지코드 ${from}가 서버와 일치하지 않습니다.`
      })
    }
  } catch (e) {
    console.log(e)
    return res.json({
      status: 500,
      message: `예상치 못한 오류가 발생하였습니다.`
    })
  }
})

// homepage 단지코드 변경
router.post('/change/dancode', async function(req, res) {
  try {
    const server = req.body.server
    const username = req.body.username
    const from = req.body.from // 이전 단지 번호
    const to = req.body.to // 바꿀 단지 번호
    const {
      sessionID,
      socketID
    } = sessionData[server][username]
    let data = JSON.parse(await getAsync(`sess:${sessionID}`))
    const dancode = data.homepage[server].dancode // 세션 단지코드
    // 현재 단코드와 받은 단코드 비교
    if (from == dancode) {
      data.homepage[server].dancode = to
      await client.set(`sess:${sessionID}`, JSON.stringify(data), Redis.print)
      io.to(socketID).emit('/change/dancode', {
        from,
        to
      })
      return res.json({
        status: 200,
        message: `${from}에서 ${to}로 변경이 완료되었습니다`
      })
    } else {
      return res.json({
        status: 403,
        message: `보내주신 단지코드 ${from}가 서버와 일치하지 않습니다. 서버에서 단지코드는 ${dancode} 입니다.`
      })
    }
  } catch (e) {
    console.log(e)
    return res.json({
      status: 500,
      message: `예상치 못한 오류가 발생하였습니다.`
    })
  }
})

// 소켓
io.on('connection', function(socket) {
  socket.on('login', function(data) {
    // console.log("소켓", data)
    const server = data.server
    const username = data.information.username
    if (sessionData[server][username] == null) sessionData[username] = {}
    sessionData[server][username].socketID = socket.id
    // 접속된 모든 클라이언트에게 메시지를 전송한다
    // io.to(socket.id).emit('logout', "HI")
    console.log("소켓", sessionData)
  })
})

module.exports = router
