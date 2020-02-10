const express = require('express')
var router = express.Router()

var read_database = require('./read_database')
var Api = read_database.Api
var Parameter = read_database.Parameter
var Regexpr = read_database.Regexpr
var Recommend = read_database.Recommend
var Response = read_database.Response
var sqlQuery = read_database.sqlQuery
var read_DB = read_database.read_DB

router.get('/', async function(req, res) {
  await read_DB()
  return res.redirect('/adm/api')
})

router.get("/view", function(req, res) {
  return res.render("view", {
    rptfile : req.query.rptfile
  })
})

// 테이블 메인
router.get('/:tableName', async function(req, res) {
  try {
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
    return res.send(await alertAndRedirect('잘못된 접근 입니다.', '/adm/api'))
  }
})

// 등록
router.post('/insert/:tableName', async function(req, res) {
  try {
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
