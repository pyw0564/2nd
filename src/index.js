/* jshint esversion: 8 */
require('dotenv').config({
  path: __dirname + '/../' + '.env'
})
const imc = require('./imc');
const Redis = require('redis')
const client = Redis.createClient()
const session = require('express-session')
var redisStore = require('connect-redis')(session)
const express = require('express')
var app = express();
var sql = require('mssql');

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(session({
  secret: '1a3sdfg3#$#@13%#45asfsd',
  store: new redisStore({
    client:client
  }),
  resave: false,
  saveUninitialized: true
}))

var debug = 0;
var sqlConfig;
if (debug) {
  sqlConfig = {
    user: 'sa',
    password: '1111',
    server: 'DESKTOP-T86S6M5\\SQLEXPRESS',
    database: 'test', // 사용할 database 이름
  }
} else {
  sqlConfig = {
    user: process.env.DB_USER ? process.env.DB_USER : 'njuser', // mssql username
    password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'imc0029', // mssql password
    server: process.env.DB_SERVER ? process.env.DB_SERVER : '211.239.22.183', // 서버 주소
    database: process.env.DB_DATABASE ? process.env.DB_DATABASE : 'DAU_CRAWLER', // 사용할 database 이름
    stream: 'true', // ???
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433, // 서버 port 설정
    autoSchemaSync: true, // ???
    option: {
      encrypt: 'false' // ???
    },
    pool: {
      max: 100,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };
}
// [{ Key : TableName }]
var tableList = [];
// {sedeinfo : [ {dancode:dan}, {dongcode:dong}, {roomno:room}, {relation:rel}, {name:name} ]};
var tables = {};
// { TableName : [parameter, display_name, parameter_type], ... }
var reg = {};
var init;

app.use('/', express.static(__dirname));
app.set('view engine', 'pug');
app.set('views', './views');

app.locals.pretty = true;
app.get('/', function(req, res) {
  res.render("chat", {
    login: true
  })
})
app.post('/login', async function(req, res) {
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
    req.session.dancode = auth.result[0].dancode
    req.session.username = auth.result[0].username
    req.session.usergubun = auth.result[0].usergubun
    res.redirect("/chat")
  }
})
app.get('/chat', async function(req, res) {
  if(req.session.dancode) {
    if (init == null) {
      await read_DB()
      init = 'complete'
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

app.get('/adm', async function(req, res) {
  await read_DB();
  res.render("adm", {
    type: "default",
    tableList: tableList,
    tables: tables,
    reg: reg
  })
})
app.get('/adm/tables', async function(req, res) {
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
    });
  })()
  res.render("adm", {
    tables: tables,
    type: "tables",
    tableList: tableList,
    reg: reg
  })
})
app.get('/adm/regexps', async function(req, res) {
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
    });
  })()
  res.render("adm", {
    regexps: regexps,
    type: "regexps",
    tableList: tableList,
    tables: tables,
    reg: reg
  })
})
app.get('/adm/:tableName/columns', async function(req, res) {
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
    });
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
app.post('/adm/insert/table', async function(req, res) {
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
    });
  })()
  res.send(`
      <script>
        alert('good')
        location.href="/adm/tables"
      </script>
    `)
})
app.post('/adm/insert/regexp', async function(req, res) {
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
    });
  })()
  res.send(`
      <script>
        alert('good')
        location.href="/adm/regexps"
      </script>
    `)
})
app.post('/adm/insert/:tableName/row', async function(req, res) {
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
    });
  })()
  res.send(`
      <script>
        alert('good')
        location.href="/adm/${tableName}/columns"
      </script>
    `)
})
app.post('/adm/update/table', async function(req, res) {
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
    });
  })()
  res.send(`
      <script>
        alert('good')
        location.href="/adm/tables"
      </script>
    `)
})
app.post('/adm/update/regexp', async function(req, res) {
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
    });
  })()
  res.send(`
      <script>
        alert('good')
        location.href="/adm/regexps"
      </script>
    `)
})
app.post('/adm/update/:tableName/row', async function(req, res) {
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
    });
  })()
  res.send(`
      <script>
        alert('good')
        location.href="/adm/${tableName}/columns"
      </script>
    `)
})
app.post('/adm/delete/table', async function(req, res) {
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
      });
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
app.post('/adm/delete/regexp', async function(req, res) {
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
      });
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
app.post('/adm/delete/:tableName/row', async function(req, res) {
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
      });
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
app.listen(3000, function(err) {
  console.log("connected 3000 port");
});


async function read_DB() {
  try {
    await console.log("sql connecting......");
    let pool = await sql.connect(sqlConfig);
    let result = await pool.request().query('select * from tables'); // subject is my database table name

    for (let i = 0; i < result.recordset.length; i++) {
      let record = result.recordset[i];
      tableList.push({
        key: record.tableKey,
        tableName: record.tableName
      });
      let result_table = await pool.request().query(`select * from ${record.tableName}`);
      tables[record.tableName] = [];
      for (let j = 0; j < result_table.recordset.length; j++) {
        let table = result_table.recordset[j];
        let obj = {};
        for (let item in table) {
          obj[item] = table[item];
        }
        tables[record.tableName].push(obj);
      }
    }
    result = await pool.request().query('select * from regexps'); // subject is my database table name
    for (let i = 0; i < result.recordset.length; i++) {
      let record = result.recordset[i];
      if (reg[record.parameter_type] == null) {
        reg[record.parameter_type] = [];
      }
      reg[record.parameter_type].push({
        regexp: record.regexp,
        return_value: record.return_value,
        start: record.start,
        _length: record._length,
        _option: record._option
      });
    }
  } catch (err) {
    await console.log(err);
  }
  console.log('테이블리스트', tableList);
  console.log('테이블', tables);
  console.log('정규식', reg);
}
