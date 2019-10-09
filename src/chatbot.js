const imc = require('./imc')
const express = require('express')
const router = express.Router()
const config = require('./config')
var read_DB = config.read_DB
var Api = config.Api
var Parameter = config.Parameter
var Regexpr = config.Regexpr;
var initialize = config.initialize;
var init = "NO"

// 메인 부분
router.get('/', function(req, res) {
  // 세션 유지 처리
  if (req.session.dancode) {
    return res.redirect('/chat')
  }
  res.render("chat", {
    login: false
  })
})

// 로그인 부분
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
  if (auth.response_code == "OK") {
    res.send(`
        <script>
          alert("아이디 또는 비밀번호가 틀립니다.")
          location.href = "/"
        </script>
      `)
  } else {
    req.session.dancode = 'nono'
    req.session.username = 'haha'
    req.session.usergubun = '1234'
    // req.session.dancode = auth.result[0].dancode
    // req.session.username = auth.result[0].username
    // req.session.usergubun = auth.result[0].usergubun
    res.redirect("/chat")
  }
})

// 챗봇 화면
router.get('/chat', async function(req, res) {
  // 임시 초기화 모드
  await initialize()
  await read_DB()

  // 세션 처리
  if (req.session.dancode) {
    // 파싱 테이블 init
    if (init == 'NO') {
      await read_DB()
      console.log("INIT")
      init = 'YES'
    }
    let info = {
      login : true,
      Api: Api,
      Parameter: Parameter,
      Regexpr: Regexpr,
      dancode: req.session.dancode,
      username: req.session.username,
      usergubun: req.session.usergubun
    };
    res.render('chat', info)
  } else {
    res.redirect('/')
  }
})

module.exports = router;
