module.exports = function() {
  require('dotenv').config({
    path: __dirname + '/../' + '.env'
  })
  const sql = require('mssql')
  const sqlConfig = {
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
  }

  var Api = {}
  var Parameter = {}
  var Regexpr = {}
  var Recommend = {}
  var Response = {}
  var Cancel = []
  var Continue = []

  // 3개의 테이블 객체 유지하면서 속성 제거
  async function initialize() {
    for (let key in Api) delete Api[key]
    for (let key in Parameter) delete Parameter[key]
    for (let key in Regexpr) delete Regexpr[key]
    for (let key in Recommend) delete Recommend[key]
    for (let key in Response) delete Response[key]
    while (Cancel.length) Cancel.pop()
    while (Continue.length) Continue.pop()
  }

  // 동기화 SQL 쿼리
  async function sqlQuery(query) {
    console.log(query)
    return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
      return pool.request().query(query)
    }).then(async result => {
      await sql.close()
      return result.recordset
    }).catch(async err => {
      console.log(err)
      await sql.close()
      throw err
    })
  }

  // api 읽기
  async function read_api() {
    let records = await sqlQuery('SELECT * FROM Api')
    for (let i = 0; i < records.length; i++) {
      let record = records[i]
      Api[record.api_name] = record
    }
  }

  // parameter 읽기
  async function read_parameter() {
    let records = await sqlQuery(`SELECT * FROM Parameter`)
    for (let i = 0; i < records.length; i++) {
      let record = records[i]
      if (Parameter[record.api_name] === undefined)
        Parameter[record.api_name] = []
      Parameter[record.api_name].push(record)
    }
    for (let item in Parameter) {
      Parameter[item].sort(function(a, b) {
        return a._order - b._order
      })
    }
  }

  // regexp 읽기
  async function read_regexp() {
    let records = await sqlQuery(`SELECT * FROM Regexp`)
    for (let i = 0; i < records.length; i++) {
      let record = records[i]
      if (Regexpr[record.parameter_type] === undefined)
        Regexpr[record.parameter_type] = []
      Regexpr[record.parameter_type].push(record)
    }
  }

  // recommend 읽기
  async function read_recommend() {
    let records = await sqlQuery(`SELECT * FROM Recommend`)
    for (let i = 0; i < records.length; i++) {
      let record = records[i]
      if (Recommend[record.parameter_type] === undefined)
        Recommend[record.parameter_type] = []
      Recommend[record.parameter_type].push(record)
    }
  }

  async function read_response() {
    let records = await sqlQuery(`SELECT * FROM Response`)
    for (let i = 0; i < records.length; i++) {
      let record = records[i]
      if (Response[record.flag] === undefined) {
        if (record._option) {
          Response[record.flag] = {}
        } else {
          Response[record.flag] = []
        }
      }
      if (record._option) {
        if (Response[record.flag][record._option] === undefined)
          Response[record.flag][record._option] = []
        Response[record.flag][record._option].push(record)
      } else {
        Response[record.flag].push(record)
      }
    }
    for (let item in Response) {
      if (Array.isArray(Response[item])) {
        Response[item].sort(function(a, b) {
          return a._order - b._order
        })
      } else {
        for (let option in Response[item])
          Response[item][option].sort(function(a, b) {
            return a._order - b._order
          })
      }
    }
  }

  async function read_cancel_continue() {
    let result = await sqlQuery("SELECT * FROM Regexp WHERE parameter_type = 'cancel'")
    for (let i in result)
      Cancel.push(result[i])
    result = await sqlQuery("SELECT * FROM Regexp WHERE parameter_type = 'continue'")
    for (let i in result)
      Continue.push(result[i])
  }

  // 통합 읽기
  async function read_DB() {
    await initialize()
    await console.log("READ DB 중입니다 . . .")
    await read_api()
    // console.log('Api 읽기완료', Api)
    await read_parameter()
    // console.log('Parameter 읽기완료', Parameter)
    await read_regexp()
    // console.log('Regexp 읽기완료', Regexpr)
    await read_recommend()
    // console.log('Recommend 읽기완료', Recommend)
    await read_response()
    // console.log('Response 읽기완료', Response)
    await read_cancel_continue()
    await console.log("READ DB 종료 되었습니다.")
  }

  return {
    Api,
    Parameter,
    Regexpr,
    Recommend,
    Response,
    Cancel,
    Continue,
    sqlQuery,
    read_DB
  }
}()
