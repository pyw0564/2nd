const imc = require('./imc');
const express = require('express')
var router = express.Router();
const config = require('./config');
const read_DB = config.read_DB
var tableList = config.tableList
var tables = config.tables
var reg = config.reg;
var init = "NO"

router.get('/', function(req, res) {
  res.render("chat", {
    login: true
  })
})

router.post('/login', async function(req, res) {
  const id = req.body.userid
  const pw = req.body.userpw
  const dancode = req.body.dancode
  const auth = await imc.authorize(id, pw)
  if (auth.response_code != "OK") {
    res.send(`
        <script>
          alert("아이디 또는 비밀번호가 틀립니다.")
          location.href = "/"
        </script>
      `)
  } else {
    // req.session.dancode = 'nono'
    req.session.dancode = auth.result[0].dancode
    // req.session.username = 'haha'
    req.session.username = auth.result[0].username
    // req.session.usergubun = '1234'
    req.session.usergubun = auth.result[0].usergubun
    res.redirect("/chat")
  }
})

router.get('/chat', async function(req, res) {
  if (req.session.dancode) {
    if (init == 'NO') {
      await read_DB()
      init = 'YES'
    }
    let info = {
      tableList: tableList,
      tables: tables,
      reg: reg,
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
