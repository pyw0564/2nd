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
/*

  여기는 READ DB 입니다.

*/
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

/*

  여기 부터는 파싱 부분입니다.

*/

var information = {} // 파싱한 정보 객체
var flag // 정보 유지를 위한 플래그
async function init(query, user) {
  // CLEAR
  let record = await sqlQuery("SELECT * FROM Regexp WHERE parameter_type = 'cancel'")
  for(let i in record){
    let curr = record[i]
    if(query.match(new RegExp(curr.regexp, curr._option))){
      console.log("CLEAR EXECUTE")
      information = {
        message: "정보가 초기화 되었습니다"
      }
      flag = null
      return information
    }
  }
  if (flag) {
    console.log("FLAG EXECUTE")
    return find_parameters(flag.api_name, query, user)
  }
  information = {}
  information = find_api(query, user)
  console.log('파싱된 정보', information)
  return information
}

// 1step -> api 골라내기
function find_api(query, user) {
  for (let item in Api) {
    let api_name = Api[item].api_name
    let parameter_type = Api[item].parameter_type
    let display_name = Api[item].display_name
    let response = Api[item].response
    if (Regexpr[item] === undefined) continue
    for (let j = 0; j < Regexpr[item].length; j++) {
      let low = Regexpr[item][j]
      let regexp = new RegExp(low.regexp, low._option)
      let result = query.match(regexp)
      if (result) {
        flag = {
          api_name: api_name,
          display_name: display_name
        }
        let ret = find_parameters(api_name, query, user)
        ret.information = Api[item]
        return ret
      }
    }
  }
  return null
}

// 2step -> parameter 마다 파싱
function find_parameters(api_name, query, user) {
  let parameters = Parameter[api_name]
  let ret = {}
  if (flag) {
    ret = information
    ret.message = flag.display_name + " 실행중"
  }
  for (let i = 0; i < parameters.length; i++) {
    let parameter = parameters[i].parameter
    let display_name = parameters[i].display_name
    let parameter_type = parameters[i].parameter_type
    let necessary = parameters[i].necessary
    let parsing_ret
    if(user[parameter])
      parsing_ret = user[parameter]
    else{
      parsing_ret = parsing(Regexpr[parameter_type], query)
      if (parsing_ret == null && information[parameter] != null) continue
    }
    ret[parameter] = {
      display_name : display_name,
      result : parsing_ret,
      necessary : necessary
    }
  }
  return ret
}

// 3step -> 파싱 함수
function parsing(regs, query) {
  if (regs == null) return null
  for (let i = 0; i < regs.length; i++) {
    let reg = regs[i]
    let regexp = new RegExp(reg.regexp, reg._option);
    let parsing_array = query.match(regexp)

    if (parsing_array == null) continue
    if (parsing_array.length == 1) {
      let ret = (reg.return_value === null || reg.return_value === "") ? parsing_array[0].substr(reg.start, reg._length) : reg.return_value;
      query = query.substr(0, reg.start) + query.substr(reg.start + reg._length, query.length);
      return ret
    } else if (parsing_array.length > 1) {
      console.log("정규표현식 결과가 2개이상이므로 모호합니다")
    }
  }
  return null
}

exports.init = init
exports.Api = Api
exports.Parameter = Parameter
exports.Regexpr = Regexpr
exports.sqlConfig = sqlConfig
exports.sqlQuery = sqlQuery
exports.read_DB = read_DB
exports.initialize = initialize
