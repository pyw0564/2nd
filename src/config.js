const sql = require('mssql');
require('dotenv').config({
  path: __dirname + '/../' + '.env'
})
var Api = {}
var Parameter = {}
var Regexpr = {}
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
// 3개의 테이블 객체 유지하면서 속성 제거
async function initialize() {
  while (Api.length) Api.pop()
  for (let key in Parameter) delete Parameter[key]
  for (let key in Regexpr) delete Regexpr[key]
}

async function sqlQuery(query) {
  return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
    return pool.request().query(query)
  }).then(async result => {
    await sql.close()
    return result.recordset
  }).catch(err => {
    console.error(err)
    sql.close()
    throw err
  })
}
// api 읽기
async function read_api() {
  let result = await sqlQuery('SELECT * FROM Api')
  for (let i = 0; i < result.length; i++) {
    let row = result[i];
    let obj = {};
    for (let item in row) obj[item] = row[item];
    Api[row.api_name] = obj;
  }
}
// parameter 읽기
async function read_parameter() {
  let result = await sqlQuery(`SELECT * FROM Parameter`)
  for (let i = 0; i < result.length; i++) {
    let row = result[i];
    if (Parameter[row.api_name] === undefined) {
      Parameter[row.api_name] = [];
    }
    let obj = {};
    for (let item in row) obj[item] = row[item];
    Parameter[row.api_name].push(obj);
  }
}
// regexp 읽기
async function read_regexp() {
  let result = await sqlQuery(`SELECT * FROM Regexp`)
  for (let i = 0; i < result.length; i++) {
    let row = result[i];
    if (Regexpr[row.parameter_type] === undefined) {
      Regexpr[row.parameter_type] = [];
    }
    let obj = {};
    for (let item in row) obj[item] = row[item];
    Regexpr[row.parameter_type].push(obj);
  }
}
// 통합 읽기
async function read_DB() {
  await initialize()
  await console.log("SQL Connect . . .")
  await read_api()
  console.log('Api 읽기완료', Api)
  await read_parameter()
  console.log('Parameter 읽기완료', Parameter)
  await read_regexp()
  console.log('Regexp 읽기완료', Regexpr)
  await console.log("READ DB 종료 되었습니다.")
}

exports.Api = Api
exports.Parameter = Parameter
exports.Regexpr = Regexpr
exports.sqlConfig = sqlConfig
exports.read_DB = read_DB
exports.initialize = initialize
