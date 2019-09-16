const config = require('./config')
const express = require('express')
var router = express.Router()
var sql = require('mssql')
const sqlConfig = config.sqlConfig
const read_DB = config.read_DB
const initialize = config.initialize
var tableList = config.tableList
var tables = config.tables
var reg = config.reg

router.get('/', async function(req, res) {
  await read_DB()
  res.render("adm", {
    type: "default",
    tableList: tableList,
    tables: tables,
    reg: reg
  })
})

router.get('/tables', async function(req, res) {
  const queryResult = await sqlQuery("SELECT * FROM tables")
  res.render("adm", {
    type: "tables",
    tableList: queryResult,
    tables: tables,
    reg: reg
  })
})

router.get('/regexps', async function(req, res) {
  const queryResult = await sqlQuery("SELECT * FROM regexps")
  res.render("adm", {
    type: "regexps",
    tableList: tableList,
    tables: tables,
    reg: queryResult
  })
})

router.get('/:tableName/columns', async function(req, res) {
  const tableName = req.params.tableName
  let queryResult = await sqlQuery(`SELECT * FROM ${tableName}`)
  res.render("adm", {
    type: "columns",
    columns: queryResult,
    tableName: tableName,
    tableList: tableList,
    tables: tables,
    reg: reg
  })
})

router.post('/insert/table', async function(req, res) {
  const tableKey = req.body.tableKey
  const tableName = req.body.tableName
  const query = ` INSERT INTO TABLES(tableKey, tableName)
                  VALUES ('${tableKey}', '${tableName}');
                  CREATE TABLE ${tableName} (
                    parameter nvarchar(255) NOT NULL,
                    display_name nvarchar(255) NOT NULL,
                    parameter_type varchar(255) NOT NULL,
                    PRIMARY KEY (parameter))`
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
    INSERT INTO REGEXPS(parameter_type, regexp, _option, return_value, start, _length)
    VALUES ('${parameter_type}', '${regexp}', '${_option}', '${return_value}', ${start}, ${_length})
  `
  await sqlQuery(query)
  console.log('정규표현식 등록완료')
  res.send(alertAndRedirect('정규표현식 등록완료', '/adm/regexps'))
})

router.post('/insert/:tableName/row', async function(req, res) {
  const parameter = req.body.parameter
  const display_name = req.body.display_name
  const parameter_type = req.body.parameter_type
  const tableName = req.params.tableName
  const query = `
    INSERT INTO ${tableName}(parameter, display_name, parameter_type)
    VALUES ('${parameter}', '${display_name}', '${parameter_type}')
  `
  await sqlQuery(query)
  console.log('테이블 속성 등록완료')
  res.send(alertAndRedirect('테이블 속성 등록완료', `/adm/${tableName}/columns`))
})

router.post('/update/table', async function(req, res) {
  const prev = req.body.prev
  const tableKey = req.body.tableKey
  const tableName = req.body.tableName
  const query = `
    UPDATE TABLES SET tableKey='${tableKey}', tableName='${tableName}'
    WHERE tableName='${prev}';
    EXEC SP_RENAME '${prev}', '${tableName}';
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
    UPDATE REGEXPS SET parameter_type='${parameter_type}', regexp='${regexp}', _option='${_option}', return_value='${return_value}', start=${start}, _length=${_length}
    WHERE idx=${idx};
  `
  await sqlQuery(query)
  console.log('정규표현식 수정완료')
  res.send(alertAndRedirect('정규표현식 수정완료', `/adm/regexps`))
})

router.post('/update/:tableName/row', async function(req, res) {
  const prev = req.body.prev
  const parameter = req.body.parameter
  const display_name = req.body.display_name
  const parameter_type = req.body.parameter_type
  const tableName = req.params.tableName
  const query = `
    UPDATE ${tableName} SET parameter='${parameter}', display_name='${display_name}', parameter_type='${parameter_type}'
    WHERE parameter='${prev}';
  `
  await sqlQuery(query)
  console.log('테이블 속성 수정완료')
  res.send(alertAndRedirect('테이블 속성 수정완료', `/adm/${tableName}/columns`))
})

router.post('/delete/table', async function(req, res) {
  const tableName = req.body.tableName
  if (tableName) {
    let query = `
      DELETE FROM TABLES WHERE tableName = '${tableName}';
      DROP TABLE ${tableName};
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
    let query = `DELETE FROM REGEXPS WHERE idx = ${idx}`
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
    let query = `DELETE FROM ${tableName} WHERE parameter = '${parameter}'`
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
