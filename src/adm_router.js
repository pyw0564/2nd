const express = require('express')
var router = express.Router()
var read_database = require('./read_database')
const imc = require('./api/imc_api')
const fs = require('fs')
var Api = read_database.Api
var Parameter = read_database.Parameter
var Regexpr = read_database.Regexpr
var Recommend = read_database.Recommend
var Service = read_database.Service
var Response = read_database.Response
var sqlQuery = read_database.sqlQuery
var read_DB = read_database.read_DB

router.get('/', async function(req, res) {
  await read_DB()
  if (req.session.auth && req.session.auth.usergubun == 'hoffice'){
    return res.redirect('/adm/api')
  }
  return res.render('./administer/adm_login', {
    Service
  })
})

router.post('/login', async function(req, res) {
  // 세션 유지 처리
  const id = req.body.id
  const pw = req.body.password
  const auth = await imc.authorize({
    id,
    pw,
    dancode: 1413,
    service: 'bankdata'
  })
  console.log("로그인 통신 결과", auth.result[0])
  req.session.auth = auth.result[0]
  if (req.session.auth.usergubun == 'hoffice') {
    return res.redirect('/adm/api')
  } else {
    req.session.auth = {}
    return res.send(await alertAndRedirect(`권한이 없습니다.`, `/adm`))
  }
})

router.get("/view", async function(req, res) {
  if (req.session.auth.usergubun != 'hoffice'){
    req.session.auth = {}
    return res.send(await alertAndRedirect(`권한이 없습니다.`, `/adm`))
  }
  return res.render("view", {
    rptfile : req.query.rptfile
  })
})

router.get('/css', async function(req, res) {
  if (req.session.auth.usergubun != 'hoffice'){
    req.session.auth = {}
    return res.send(await alertAndRedirect(`권한이 없습니다.`, `/adm`))
  }
  var css = JSON.parse(fs.readFileSync("./css/window.json"))
  try {
    return res.render("./administer/adm", {
      type: "css",
      object: css,
      columns: css
    })
  } catch (e) {
    return res.send(await alertAndRedirect('잘못된 접근 입니다.', '/adm'))
  }
})
router.post('/css/update', async function(req, res) {
  try {
    if (req.session.auth.usergubun != 'hoffice'){
      req.session.auth = {}
      return res.send(await alertAndRedirect(`권한이 없습니다.`, `/adm`))
    }
    const width = req.body.width
    const height = req.body.height
    const window = {
      "window": {
        "width": width,
        "height": height,
      }
    }
    await fs.writeFileSync('./css/window.json', JSON.stringify(window))
    return res.send(await alertAndRedirect(`css 수정 완료`, `/adm/css`))
  } catch (e) {
    return res.send(await alertAndRedirect('잘못된 접근 입니다.', '/adm'))
  }
})

// 테이블 메인
router.get('/:tableName', async function(req, res) {
  try {
    if (req.session.auth.usergubun != 'hoffice'){
      req.session.auth = {}
      return res.send(await alertAndRedirect(`권한이 없습니다.`, `/adm`))
    }
    const tableName = req.params.tableName
    let query = `SELECT * FROM ${tableName}`
    if (tableName == "_log")
      query += ` ORDER BY _time DESC`
    let queryResult = await sqlQuery(query)
    let columns = await sqlQuery(`SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`)
    return res.render("./administer/adm", {
      type: tableName,
      object: queryResult,
      columns
    })
  } catch (e) {
    return res.send(await alertAndRedirect('잘못된 접근 입니다.', '/adm'))
  }
})

// 등록
router.post('/insert/:tableName', async function(req, res) {
  try {
    if (req.session.auth.usergubun != 'hoffice'){
      req.session.auth = {}
      return res.send(await alertAndRedirect(`권한이 없습니다.`, `/adm`))
    }
    const tableName = req.params.tableName
    let query = `INSERT INTO ${tableName}(`
    let idx = 0
    for (let item in req.body) {
      if (item.substr(0, 5) == "prev_") continue
      if (idx++) query += ", "
      query += item
    }
    query += ") VALUES ("
    idx = 0
    for (let item in req.body) {
      if (item.substr(0, 5) == "prev_") continue
      if (idx++) query += ", "
      let value = req.body[item]
      if (value.match(/'/)) value = await replace_quotes(req.body[item])
      query += `'${value}'`
    }
    query += ")"
    await sqlQuery(query)
    return res.send(await alertAndRedirect(`${tableName} 등록 완료`, `/adm/${tableName}`))
  } catch (e) {
    return res.send(await alertAndRedirect(`${tableName} 등록 중 오류발생! PK, NULL값 확인`, `/adm/${tableName}`))
  }
})

// 수정
router.post('/update/:tableName', async function(req, res) {
  try {
    if (req.session.auth.usergubun != 'hoffice'){
      req.session.auth = {}
      return res.send(await alertAndRedirect(`권한이 없습니다.`, `/adm`))
    }
    const tableName = req.params.tableName
    let query = `UPDATE ${tableName} SET `
    let idx = 0
    for (let item in req.body) {
      if (item.substr(0, 5) == "prev_") continue
      if (idx++) query += ", "
      let value = req.body[item]
      if (value.match(/'/)) value = await replace_quotes(value)
      query += `${item}='${value}'`
    }
    query += " WHERE "
    idx = 0
    for (let item in req.body) {
      if (item.substr(0, 5) == "prev_") continue
      if (idx++) query += "and "
      let value = req.body["prev_" + item]
      if (value.match(/'/)) value = await replace_quotes(value)
      query += `${item}='${value}' `
    }
    await sqlQuery(query)
    return res.send(await alertAndRedirect(`${tableName} 수정 완료`, `/adm/${tableName}`))
  } catch (e) {
    return res.send(await alertAndRedirect(`${tableName} 수정 중 오류발생! PK, NULL값 확인`, `/adm/${tableName}`))
  }
})

// 삭제
router.post('/delete/:tableName', async function(req, res) {
  try {
    if (req.session.auth.usergubun != 'hoffice'){
      req.session.auth = {}
      return res.send(await alertAndRedirect(`권한이 없습니다.`, `/adm`))
    }
    const tableName = req.params.tableName
    let query = `DELETE FROM ${tableName} WHERE `
    let idx = 0
    for (let item in req.body) {
      if (item.substr(0, 5) == "prev_") continue
      if (idx++) query += "and "
      let value = req.body[item]
      if (value.match(/'/)) value = await replace_quotes(value)
      query += `${item}='${value}' `
    }
    await sqlQuery(query)
    return res.send(await alertAndRedirect(`${tableName} 삭제 완료`, `/adm/${tableName}`))
  } catch (e) {
    return res.send(await alertAndRedirect(`${tableName} 삭제 중 오류발생!`, `/adm/${tableName}`))
  }
})

async function alertAndRedirect(aler, href) {
  await read_DB()
  return `<script>
    alert("${aler}")
    location.href="${href}"
  </script>`
}

async function replace_quotes(text) {
  return text.replace(/'/gi, "''")
}
module.exports = router;
