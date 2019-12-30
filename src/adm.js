const express = require('express')
var router = express.Router()
var sql = require('mssql')
const config = require('./config')
const sqlConfig = config.sqlConfig
const read_DB = config.read_DB
const initialize = config.initialize
var tableList = config.Api
var tables = config.Parameter
var reg = config.Regexpr

router.get('/', async function(req, res) {
  await read_DB()
  res.redirect('/adm/tables')
})

router.get('/tables', async function(req, res) {
  const queryResult = await sqlQuery("SELECT * FROM API")
  res.render("adm", {
    type: "tables",
    tableList: queryResult,
    tables: tables,
    reg: reg
  })
})

router.get('/regexps', async function(req, res) {
  const queryResult = await sqlQuery("SELECT * FROM regexp")
  res.render("adm", {
    type: "regexps",
    tableList: tableList,
    tables: tables,
    reg: queryResult
  })
})

router.get('/:tableName/columns', async function(req, res) {
  const tableName = req.params.tableName
  let queryResult = await sqlQuery(`SELECT * FROM Parameter where api_name = '${tableName}'`)
  res.render("adm", {
    type: "columns",
    columns: queryResult,
    tableName: tableName,
    tableList: tableList,
    tables: tables
  })
})

router.get('/logs', async function(req, res) {
  const queryResult = await sqlQuery("SELECT * FROM _log ORDER BY _time DESC")
  res.render("adm", {
    type: "logs",
    logs: queryResult
  })
})

router.get('/recommend', async function(req, res) {
  const queryResult = await sqlQuery("SELECT * FROM Recommend")
  console.log(queryResult)
  res.render("adm", {
    type: "recommend",
    recommend: queryResult
  })
})

router.post('/insert/table', async function(req, res) {
  const display_name = req.body.display_name
  const api_name = req.body.api_name
  const response = req.body.response
  const parameter_type = req.body.parameter_type
  const url = req.body.url
  const response_text = req.body.response_text
  const rest_method = req.body.rest_method
  const query = ` INSERT INTO API(display_name, api_name, response, parameter_type)
                  VALUES ('${display_name}', '${api_name}', '${response}', '${parameter_type}',
                '${url}', '${response_text}', '${rest_method}');`
  console.log(query);
  try {
    await sqlQuery(query)
  } catch (e) {
    console.log('테이블 등록실패')
    res.send(alertAndRedirect('테이블 등록 실패', '/adm/tables'))
  }
  console.log('테이블 등록완료')
  res.send(alertAndRedirect('테이블 등록이 완료되었습니다', '/adm/tables'))
})

router.post('/insert/regexp', async function(req, res) {
  const parameter_type = req.body.parameter_type
  const regexp = req.body.regexp
  const _option = req.body._option
  const return_value = req.body.return_value ? req.body.return_value : ""
  const start = req.body.start ? parseInt(req.body.start) : -1
  const _length = req.body._length ? parseInt(req.body._length) : -1
  const query = `
    INSERT INTO REGEXP(parameter_type, regexp, _option, return_value, start, _length)
    VALUES ('${parameter_type}', '${regexp}', '${_option}', '${return_value}', ${start}, ${_length})
  `
  await sqlQuery(query)
  console.log('정규표현식 등록완료')
  res.send(alertAndRedirect('정규표현식 등록완료', '/adm/regexps'))
})

router.post('/insert/recommendexp', async function(req, res) {
  const parameter_type = req.body.parameter_type
  const word = req.body.word
  const number = req.body.number
  const query = `
    INSERT INTO Recommend(parameter_type, word, number)
    VALUES ('${parameter_type}', '${word}', '${number}')
  `
  await sqlQuery(query)
  console.log('정규표현식 등록완료')
  res.send(alertAndRedirect('정규표현식 등록완료', '/adm/recommend'))
})

router.post('/insert/:tableName/row', async function(req, res) {
  const api_name = req.body.api_name
  const parameter = req.body.parameter
  const display_name = req.body.display_name
  const parameter_type = req.body.parameter_type
  const necessary = req.body.necessary
  const _order = req.body._order
  const tableName = req.params.tableName
  const query = `
    INSERT INTO Parameter(api_name, parameter, display_name, parameter_type, necessary, _order)
    VALUES ('${api_name}', '${parameter}', '${display_name}', '${parameter_type}', '${necessary}', '${order}')
  `
  console.log(query)
  await sqlQuery(query)
  console.log('테이블 속성 등록완료')
  res.send(alertAndRedirect('테이블 속성 등록완료', `/adm/${api_name}/columns`))
})

router.post('/update/table', async function(req, res) {
  const prev = req.body.prev
  const display_name = req.body.display_name
  const api_name = req.body.api_name
  const response = req.body.response
  const parameter_type = req.body.parameter_type
  const url = req.body.url
  const response_text = req.body.response_text
  const rest_method = req.body.rest_method

  const query = `
    UPDATE API SET display_name='${display_name}', api_name='${api_name}', response='${response}', parameter_type='${parameter_type}',
     url = '${url}', response_text = '${response_text}', rest_method = '${rest_method}'
    WHERE api_name='${prev}';
    UPDATE Parameter SET api_name = '${api_name}'
    WHERE api_name='${prev}';
  `
  await sqlQuery(query)
  console.log('테이블 수정완료')
  res.send(alertAndRedirect('테이블 수정완료', `/adm/tables`))
})

router.post('/update/regexp', async function(req, res) {
  const idx = req.body.idx
  const parameter_type = req.body.parameter_type
  const regexp = req.body.regexp
  const _option = req.body._option
  const return_value = req.body.return_value ? req.body.return_value : ""
  const start = req.body.start ? parseInt(req.body.start) : -1
  const _length = req.body._length ? parseInt(req.body._length) : -1
  const query = `
    UPDATE REGEXP SET parameter_type='${parameter_type}', regexp='${regexp}', _option='${_option}', return_value='${return_value}', start=${start}, _length=${_length}
    WHERE idx=${idx};
  `
  await sqlQuery(query)
  console.log('정규표현식 수정완료')
  res.send(alertAndRedirect('정규표현식 수정완료', `/adm/regexps`))
})

router.post('/update/:tableName/row', async function(req, res) {
  const prev = req.body.prev
  const api_name = req.body.api_name
  const parameter = req.body.parameter
  const display_name = req.body.display_name
  const parameter_type = req.body.parameter_type
  const necessary = req.body.necessary
  const tableName = req.params.tableName
  const _order = req.body._order
  const query = `
    UPDATE Parameter SET api_name='${api_name}', parameter='${parameter}', display_name='${display_name}', parameter_type='${parameter_type}', necessary='${necessary}', _order='${_order}'
    WHERE parameter='${prev}' and api_name='${tableName}';
  `
  await sqlQuery(query)
  console.log('테이블 속성 수정완료')
  res.send(alertAndRedirect('테이블 속성 수정완료', `/adm/${api_name}/columns`))
})

router.post('/delete/table', async function(req, res) {
  const api_name = req.body.api_name
  if (api_name) {
    let query = `
      DELETE FROM API WHERE api_name = '${api_name}';
      DELETE FROM Parameter WHERE api_name = '${api_name}';
    `
    await sqlQuery(query)
    console.log('테이블 삭제완료')
    res.send(alertAndRedirect('테이블 삭제완료', `/adm/tables`))
  } else {
    res.send(alertAndRedirect('오류!', `/adm/tables`))
  }
})

router.post('/delete/regexp', async function(req, res) {
  const idx = parseInt(req.body.idx) ? parseInt(req.body.idx) : -1
  if (idx != -1) {
    let query = `DELETE FROM REGEXP WHERE idx = ${idx}`
    await sqlQuery(query)
    console.log('정규표현식 삭제완료')
    res.send(alertAndRedirect('정규표현식 삭제완료', `/adm/regexps`))
  } else {
    res.send(alertAndRedirect('오류!', `/adm/regexps`))
  }
})

router.post('/delete/:tableName/row', async function(req, res) {
  const tableName = req.params.tableName
  const parameter = req.body.parameter
  if (tableName) {
    let query = `DELETE FROM Parameter WHERE parameter = '${parameter}' and api_name = '${tableName}'`
    await sqlQuery(query)
    console.log('테이블 속성삭제완료')
    res.send(alertAndRedirect('테이블 속성삭제완료', `/adm/${tableName}/columns`))
  } else {
    res.send(alertAndRedirect('오류!!', `/adm/${tableName}/columns`))
  }
})

function alertAndRedirect(aler, href) {
  let ret = `
  <script>
    alert("${aler}")
    location.href="${href}"
  </script>`;
  console.log(ret)
  return ret
}

async function sqlQuery(query) {
  await initialize()
  return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
    return pool.request().query(query)
  }).then(async result => {
    await sql.close()
    await read_DB()
    return result.recordset
  }).catch(err => {
    console.error(err)
    sql.close()
    throw err
  })
}

module.exports = router;
