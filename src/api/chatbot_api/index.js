const express = require('express')
const router = express.Router()
const moment = require('moment')

const Redis = require('redis') // 레디스
const client = Redis.createClient() // 레디스
const {
  promisify
} = require('util')
const getAsync = promisify(client.get).bind(client)
var sessionData = require('./session.data')
const io = require('./socketMgt').getIO()

const imc_api = require('./../imc_api')
const decryptor = imc_api.decryptor
const change_dancode = imc_api.change_dancode
var Response = require('./../../read_database').Response
var sqlQuery = require('./../../read_database').sqlQuery
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({
  extended: false
}))
router.use(bodyParser.json())

// 로그아웃 동기화
router.post('/logout', function(req, res) {
  try {
    // let ssotoken = require('./../example')("bankdata", "test");
    let ssotoken = req.body.ssotoken
    const {
      service,
      id
    } = decryptor.logout(ssotoken)

    if (service == null || service == undefined) {
      return res.send({
        response_code: "E01",
        message: `토큰에 서비스 정보가 없습니다`
      })
    }
    if (id == null || id == undefined) {
      return res.send({
        response_code: "E02",
        message: `토큰에 id 정보가 없습니다`
      })
    }
    if (sessionData[service] == null || sessionData[service] == undefined) {
      return res.send({
        response_code: "E03",
        message: `세션에 ${service}라는 서비스정보가 없습니다`
      })
    }

    if ((sessionData[service][id] == null) || (sessionData[service][id] == undefined)) {
      return res.send({
        response_code: "E04",
        message: `세션에 ${id}라는 아이디를 찾을 수 없습니다`
      })
    }
    const {
      socketID
    } = sessionData[service][id]
    delete sessionData[service][id]

    io.to(socketID).emit('logout', true);
    return res.send({
      response_code: "OK",
      message: `성공적으로 ${id} 유저가 로그아웃 되었습니다.`
    })
  } catch (err) {
    return res.send({
      response_code: "E05",
      message: `보내주신 토큰 정보가 부정확합니다`
    })
  }
})

// 로그아웃
router.post('/logout/session', function(req, res) {
  try {
    const route = req.body.route
    const service = req.body.service
    delete req.session[route][service]

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
    const now = moment().format('YYYYMMDDHHmmss') // 현재시각
    const from = req.body.from // 이전 단지 번호
    const to = req.body.to // 바꿀 단지 번호
    const service = req.body.service // 서비스
    const dancode = req.session.icon[service].dancode // 세션 단지코드
    const id = req.session.icon[service].id
    const result = await change_dancode({
      id,
      dancode: to,
      service
    })
    console.log(result)
    if (result.response_code != "OK") {
      return res.json({
        from,
        to,
        status: 403,
        message: `${to}로의 단지변경은 허용되지 않습니다`
      })
    } else {
      req.session.icon[service].dancode = result.result[0].dancode
      req.session.icon[service].danjiname = result.result[0].danjiname
      return res.json({
        danjiname: req.session.icon[service].danjiname,
        from,
        to: result.result[0].dancode,
        status: 200,
        message: `${from}에서 ${to}로 변경이 완료되었습니다.`
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
    // let ssotoken = require('./../example')("bankdata", "test", "9001");
    let ssotoken = req.body.ssotoken
    console.log(ssotoken)
    const {
      service,
      id,
      dancode
    } = decryptor.change_dancode(ssotoken)


    if (service == null || service == undefined) {
      return res.send({
        response_code: "E01",
        message: `토큰에 서비스 정보가 없습니다`
      })
    }

    if (id == null || id == undefined) {
      return res.send({
        response_code: "E02",
        message: `토큰에 id 정보가 없습니다`
      })
    }

    if (dancode == null || dancode == undefined) {
      return res.send({
        response_code: "E03",
        message: `토큰에 dancode 정보가 없습니다`
      })
    }

    if (sessionData[service] == null || sessionData[service] == undefined) {
      return res.send({
        response_code: "E04",
        message: `세션에 ${service}라는 서비스정보가 없습니다`
      })
    }

    if ((sessionData[service][id] == null) || (sessionData[service][id] == undefined)) {
      return res.send({
        response_code: "E05",
        message: `세션에 ${id}라는 아이디를 찾을 수 없습니다`
      })
    }

    const {
      sessionID,
      socketID
    } = sessionData[service][id]

    if (sessionID == null || sessionID == undefined) {
      return res.send({
        response_code: "E06",
        message: `세션ID가 저장되어 있지 않습니다`
      })
    }
    if (socketID == null || socketID == undefined) {
      return res.send({
        response_code: "E07",
        message: `소켓ID가 저장되어 있지 않습니다`
      })
    }

    let data = JSON.parse(await getAsync(`sess:${sessionID}`))
    const prev_dancode = data.homepage[service].dancode // 세션 단지코드
    if (prev_dancode == dancode) {
      return res.send({
        response_code: "E08",
        message: `변경하려는 단지코드가 기존과 같습니다`
      })
    }
    // 현재 단코드와 받은 단코드 비교
    data.homepage[service].dancode = dancode
    await client.set(`sess:${sessionID}`, JSON.stringify(data), Redis.print)
    io.to(socketID).emit('/change/dancode', {
      from: prev_dancode,
      to: dancode
    })
    return res.json({
      response_code: "OK",
      message: `${prev_dancode}에서 ${dancode}로 변경이 완료되었습니다`
    })
  } catch (e) {
    console.log(e)
    return res.json({
      response_code: "E09",
      message: `예상치 못한 오류가 발생하였습니다.`
    })
  }
})

// 세선 시간 변경
// router.post('/change/session_time', async function(req, res) {
//   try {
//     const route = req.body.route
//     const service = req.body.service
//     const username = req.body.username
//     const before = req.body.before // 이전 세션 시간
//     const after = req.body.after // 바꿀 세션 시간
//     if (after < 1) throw after
//     await sqlQuery(`UPDATE Session SET time=${after}
//       where route='${route}' and service='${service}' and username='${username}'`)
//     return res.json({
//       status: 200,
//       before,
//       after,
//       message: `세션 시간이 ${before}분에서 ${after}분으로 변경되었습니다`
//     })
//   } catch (e) {
//     console.log(e)
//     return res.json({
//       status: 500,
//       message: `예상치 못한 오류가 발생하였습니다.`
//     })
//   }
// })

// 소켓
io.on('connection', function(socket) {
  socket.on('login', function(data) {
    // console.log("소켓", data)
    const service = data.service
    const id = data.information.id
    if (sessionData[service] == null) sessionData[service] = {}
    if (sessionData[service][id] == null) sessionData[service][id] = {}
    sessionData[service][id].socketID = socket.id
    // 접속된 모든 클라이언트에게 메시지를 전송한다
    // io.to(socket.id).emit('logout', "HI")
    console.log("소켓", sessionData)
  })
})

module.exports = router
