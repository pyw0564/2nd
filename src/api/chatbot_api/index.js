const express = require('express')
const router = express.Router()

const Redis = require('redis') // 레디스
const client = Redis.createClient() // 레디스
const { promisify } = require('util')
const getAsync = promisify(client.get).bind(client)
var sessionData = require('./session.data')
const io = require('./socketMgt').getIO()

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({
  extended: false
}))
router.use(bodyParser.json())

router.get('/logout', function(req, res) {
  req.session.destroy()
  return res.send(`
    <script>
      alert('로그아웃 되었습니다.')
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
  const username = req.body.username
  const from = req.body.from // 이전 단지 번호
  const to = req.body.to // 바꿀 단지 번호
  // console.log(username, from, to)
  // const username = "챗봇테스터001"
  // 챗봇테스터001
  // 1. redis에서 유저정보 들고옴
  const {
    sessionID,
    socketID
  } = sessionData[username]
  let data = await getAsync(`sess:${sessionID}`)
  data = JSON.parse(data)

  // 2. 현재 단코드와 받은 단코드 비교
  if (from == data.dancode) {
    data.dancode = to
    client.set(`sess:${sessionID}`, JSON.stringify(data), Redis.print)
    console.log("소켓", socketID)
    io.to(socketID).emit('/change/dancode', {
      dancode: to
    })
    return res.send({
      status: 200,
      message: "단지코드 변경 완료되었습니다."
    })
  }
  return res.send({
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
    const username = data.information.username
    sessionData[username].socketID = socket.id
    // sessionData[{
    //   dancode : 1413,
    //   username : '챗봇테스터001'
    // }] = socket.id
    // 접속된 모든 클라이언트에게 메시지를 전송한다
    // io.to(socket.id).emit('logout', "HIddddd")
  })
})

module.exports = router
