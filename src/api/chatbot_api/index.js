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

router.get('/logout', function(req, res) {
  req.session.destroy()
  let str = ""
  let response_array = Response["LOGOUT"]
  for (let i in response_array) {
    let response_text = response_array[i].response_text
    str += response_text
  }
  return res.send(`
    <script>
      alert("${str}")
      location.href = '/'
    </script>`)
})

router.post('/logout', function(req, res) {
  const username = req.body.username
  try {
    const {
      socketID
    } = sessionData[username]

    io.to(socketID).emit('logout', true);
    return res.send({
      status: 200,
      message: `success logout: ${username}`
    })
  } catch (err) {
    return res.send({
      status: 400,
      message: `logout router : user not found ${username}`
    })
  }
})

router.post('/change/dancode', async function(req, res) {
  const server = req.body.server
  const username = req.body.username
  const from = req.body.from // 이전 단지 번호
  const to = req.body.to // 바꿀 단지 번호
  // 챗봇테스터001
  const {
    sessionID,
    socketID
  } = sessionData[server][username]
  let data = await getAsync(`sess:${sessionID}`)
  data = JSON.parse(data)
  // console.log("변경전", data)
  const dancode = data.icon[server].dancode
  // 2. 현재 단코드와 받은 단코드 비교
  if (from == dancode) {
    data.icon[server].dancode = to
    req.session.icon[server].dancode = to // 자기자신 세션 redis로안바꿔짐 ㅡㅡ 이렇게해야함
    await client.set(`sess:${sessionID}`, JSON.stringify(data), Redis.print)
    // console.log("변경 후 ", await getAsync(`sess:${sessionID}`))
    io.to(socketID).emit('/change/dancode', {
      dancode: to
    })
    return res.json({
      status: 200,
      message: "단지코드 변경 완료되었습니다."
    })
  }
  return res.json({
    status: 403,
    message: "현재 단지코드가 일치하지 않습니다."
  })
})

io.on('connection', function(socket) {
  // 접속한 클라이언트의 정보가 수신되면
  // socket.on('test', function(data) {
  //   console.log('소켓아이디', socket.id)
  // })

  socket.on('login', function(data) {
    // console.log("소켓", data)
    const server = data.server
    const username = data.information.username
    if(sessionData[server][username] == null) sessionData[username] = {}
    sessionData[server][username].socketID = socket.id
    // sessionData[{
    //   dancode : 1413,
    //   username : '챗봇테스터001'
    // }] = socket.id
    // 접속된 모든 클라이언트에게 메시지를 전송한다
    // io.to(socket.id).emit('logout', "HIddddd")
    console.log("소켓", sessionData)
  })
})

module.exports = router
