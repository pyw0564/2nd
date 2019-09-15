const config = require('./config')
const express = require('express')
var router = express.Router()
var sql = require('mssql')
const sqlConfig = config.sqlConfig
const read_DB = config.read_DB
var tableList = config.tableList
var tables = config.tables
var reg = config.reg

router.get('/adm', async function(req, res) {
  await read_DB()
  res.render("adm", {
    type: "default",
    tableList: tableList,
    tables: tables,
    reg: reg
  })
})


router.get('/adm/tables', async function(req, res) {
  var tables = []
  await (async () => {
    return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
      return pool.request().query("SELECT * FROM tables")
    }).then(async result => {
      tables = result.recordset
      console.log(tables)
      await sql.close()
      return
    }).catch(err => {
      console.error(err)
      sql.close()
      throw err
    })
  })()
  res.render("adm", {
    tables: tables,
    type: "tables",
    tableList: tableList,
    reg: reg
  })
})

router.get('/adm/regexps', async function(req, res) {
  var regexps = []
  await (async () => {
    return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
      return pool.request().query("SELECT * FROM REGEXPS")
    }).then(async result => {
      regexps = result.recordset
      console.log(regexps)
      await sql.close()
      return
    }).catch(err => {
      console.error(err)
      sql.close()
      throw err
    })
  })()
  res.render("adm", {
    regexps: regexps,
    type: "regexps",
    tableList: tableList,
    tables: tables,
    reg: reg
  })
})

router.get('/adm/:tableName/columns', async function(req, res) {
  const tableName = req.params.tableName
  var columns = []
  await (async () => {
    return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
      return pool.request().query(`SELECT * FROM ${tableName}`)
    }).then(async result => {
      columns = result.recordset
      console.log(columns)
      await sql.close()
      return
    }).catch(err => {
      console.error(err)
      sql.close()
      throw err
    })
  })()
  res.render("adm", {
    columns: columns,
    tableName: tableName,
    type: "columns",
    tableList: tableList,
    tables: tables,
    reg: reg
  })
})

router.post('/adm/insert/table', async function(req, res) {
  const tableKey = req.body.tableKey
  const tableName = req.body.tableName
  const query = `
  INSERT INTO TABLES(tableKey, tableName)
  VALUES ('${tableKey}', '${tableName}');
  CREATE TABLE ${tableName} (
    parameter nvarchar(255) NOT NULL,
    display_name nvarchar(255) NOT NULL,
    parameter_type varchar(255) NOT NULL,
    PRIMARY KEY (parameter)
  )
`
  console.log(query)
  await (async () => {
    return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
      return pool.request().query(query)
    }).then(async result => {
      await sql.close()
      tableList = []
      tables = {}
      reg = {}
      await read_DB()
      return
    }).catch(err => {
      console.error(err)
      sql.close()
      throw err
    })
  })()
  res.send(`
    <script>
      alert('good')
      location.href="/adm/tables"
    </script>
  `)
})

router.post('/adm/insert/regexp', async function(req, res) {
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
  console.log(query)
  await (async () => {
    return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
      return pool.request().query(query)
    }).then(async result => {
      await sql.close()
      tableList = []
      tables = {}
      reg = {}
      await read_DB()
      return
    }).catch(err => {
      console.error(err)
      sql.close()
      throw err
    })
  })()
  res.send(`
    <script>
      alert('good')
      location.href="/adm/regexps"
    </script>
  `)
})

router.post('/adm/insert/:tableName/row', async function(req, res) {
  const parameter = req.body.parameter
  const display_name = req.body.display_name
  const parameter_type = req.body.parameter_type
  const tableName = req.params.tableName
  const query = `
  INSERT INTO ${tableName}(parameter, display_name, parameter_type)
  VALUES ('${parameter}', '${display_name}', '${parameter_type}')
`
  console.log(query)
  await (async () => {
    return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
      return pool.request().query(query)
    }).then(async result => {
      await sql.close()
      tableList = []
      tables = {}
      reg = {}
      await read_DB()
      return
    }).catch(err => {
      console.error(err)
      sql.close()
      throw err
    })
  })()
  res.send(`
    <script>
      alert('good')
      location.href="/adm/${tableName}/columns"
    </script>
  `)
})

router.post('/adm/update/table', async function(req, res) {
  const prev = req.body.prev
  const tableKey = req.body.tableKey
  const tableName = req.body.tableName
  const query = `
  UPDATE TABLES SET tableKey='${tableKey}', tableName='${tableName}'
  WHERE tableName='${prev}';
  EXEC SP_RENAME '${prev}', '${tableName}';
`
  console.log(query)
  await (async () => {
    return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
      return pool.request().query(query)
    }).then(async result => {
      await sql.close()
      tableList = []
      tables = {}
      reg = {}
      await read_DB()
      return
    }).catch(err => {
      console.error(err)
      sql.close()
      throw err
    })
  })()
  res.send(`
    <script>
      alert('good')
      location.href="/adm/tables"
    </script>
  `)
})

router.post('/adm/update/regexp', async function(req, res) {
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
  console.log(query)
  await (async () => {
    return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
      return pool.request().query(query)
    }).then(async result => {
      await sql.close()
      tableList = []
      tables = {}
      reg = {}
      await read_DB()
      return
    }).catch(err => {
      console.error(err)
      sql.close()
      throw err
    })
  })()
  res.send(`
    <script>
      alert('good')
      location.href="/adm/regexps"
    </script>
  `)
})

router.post('/adm/update/:tableName/row', async function(req, res) {
  const prev = req.body.prev
  const parameter = req.body.parameter
  const display_name = req.body.display_name
  const parameter_type = req.body.parameter_type
  const tableName = req.params.tableName
  const query = `
  UPDATE ${tableName} SET parameter='${parameter}', display_name='${display_name}', parameter_type='${parameter_type}'
  WHERE parameter='${prev}';
`
  console.log(query)
  await (async () => {
    return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
      return pool.request().query(query)
    }).then(async result => {
      await sql.close()
      tableList = []
      tables = {}
      reg = {}
      await read_DB()
      return
    }).catch(err => {
      console.error(err)
      sql.close()
      throw err
    })
  })()
  res.send(`
    <script>
      alert('good')
      location.href="/adm/${tableName}/columns"
    </script>
  `)
})

router.post('/adm/delete/table', async function(req, res) {
  const tableName = req.body.tableName
  if (tableName) {
    await (async () => {
      return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
        return pool.request().query(`
        DELETE FROM TABLES WHERE tableName = '${tableName}';
        DROP TABLE ${tableName};
        `)
      }).then(async result => {
        await sql.close()
        tableList = []
        tables = {}
        reg = {}
        await read_DB()
        return
      }).catch(err => {
        console.error(err)
        sql.close()
        throw err
      })
    })()
    res.send(`
      <script>
        alert('good')
        location.href="/adm/tables"
      </script>
    `)
  } else {
    res.send(`
      <script>
        alert('bad')
        location.href="/adm/tables"
      </script>
    `)
  }
})

router.post('/adm/delete/regexp', async function(req, res) {
  const idx = parseInt(req.body.idx) ? parseInt(req.body.idx) : -1
  if (idx != -1) {
    await (async () => {
      return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
        return pool.request().query(`DELETE FROM REGEXPS WHERE idx = ${idx}`)
      }).then(async result => {
        await sql.close()
        tableList = []
        tables = {}
        reg = {}
        await read_DB()
        return
      }).catch(err => {
        console.error(err)
        sql.close()
        throw err
      })
    })()
    res.send(`
      <script>
        alert('good')
        location.href="/adm/regexps"
      </script>
    `)
  } else {
    res.send(`
      <script>
        alert('bad')
        location.href="/adm/regexps"
      </script>
    `)
  }
})

router.post('/adm/delete/:tableName/row', async function(req, res) {
  const tableName = req.params.tableName
  const parameter = req.body.parameter
  if (tableName) {
    await (async () => {
      return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
        return pool.request().query(`DELETE FROM ${tableName} WHERE parameter = '${parameter}'`)
      }).then(async result => {
        await sql.close()
        tableList = []
        tables = {}
        reg = {}
        await read_DB()
        return
      }).catch(err => {
        console.error(err)
        sql.close()
        throw err
      })
    })()
    res.send(`
      <script>
        alert('good')
        location.href="/adm/${tableName}/columns"
      </script>
    `)
  } else {
    res.send(`
      <script>
        alert('bad')
        location.href="/adm/${tableName}/columns"
      </script>
    `)
  }
})

module.exports = router;
