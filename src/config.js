const sql = require('mssql');
require('dotenv').config({
  path: __dirname + '/../' + '.env'
})

/*

  여기는 READ DB 입니다.

*/
var Api = {}
var Parameter = {}
var Regexpr = {}
var Recommend = {}
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
  information = {}
  flag = null
  while (Api.length) Api.pop()
  for (let key in Parameter) delete Parameter[key]
  for (let key in Regexpr) delete Regexpr[key]
  for (let key in Recommend) delete Recommend[key]
}

// 동기화 SQL 쿼리
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
  let records = await sqlQuery('SELECT * FROM Api')
  for (let i = 0; i < records.length; i++) {
    let record = records[i]
    let obj = {}
    for (let item in record) obj[item] = record[item]
    Api[record.api_name] = obj
  }
}

// parameter 읽기
async function read_parameter() {
  let records = await sqlQuery(`SELECT * FROM Parameter ORDER BY _order`)
  for (let i = 0; i < records.length; i++) {
    let record = records[i]
    if (Parameter[record.api_name] === undefined) {
      Parameter[record.api_name] = []
    }
    let obj = {}
    for (let item in record) obj[item] = record[item]
    Parameter[record.api_name].push(obj)
  }
}

// regexp 읽기
async function read_regexp() {
  let records = await sqlQuery(`SELECT * FROM Regexp`)
  for (let i = 0; i < records.length; i++) {
    let record = records[i]
    if (Regexpr[record.parameter_type] === undefined) {
      Regexpr[record.parameter_type] = []
    }
    let obj = {}
    for (let item in record) obj[item] = record[item]
    Regexpr[record.parameter_type].push(obj)
  }
}

// recommend 읽기
async function read_recommend() {
  let records = await sqlQuery(`SELECT * FROM Recommend`)
  for (let i = 0; i < records.length; i++) {
    let record = records[i]
    if (Recommend[record.parameter_type] === undefined) {
      Recommend[record.parameter_type] = []
    }
    let obj = {}
    for (let item in record) obj[item] = record[item]
    Recommend[record.parameter_type].push(obj)
  }
}

// 통합 읽기
async function read_DB() {
  await initialize()
  await console.log("SQL Connect . . .")
  await read_api()
  // console.log('Api 읽기완료', Api)
  await read_parameter()
  // console.log('Parameter 읽기완료', Parameter)
  await read_regexp()
  // console.log('Regexp 읽기완료', Regexpr)
  await read_recommend()
  // console.log('Recommend 읽기완료', Recommend)
  await console.log("READ DB 종료 되었습니다.")
}

/*

  여기 부터는 파싱 부분입니다.

*/

var information = {} // 파싱한 정보 객체
var flag = {} // 정보 유지를 위한 플래그
var continue_flag
async function init(query_flag, query, user) {

  // 파싱 플래그가 아니면 따로 처리한다
  if (query_flag != "PARSE") {
    return flag_function(query_flag)
  }

  // 쿼리 객체화
  query = {
    q: " " + query + " "
  }

  // 취소 CLEAR 처리
  let records = await sqlQuery("SELECT * FROM Regexp WHERE parameter_type = 'cancel'")
  for (let i in records) {
    let record = records[i]
    if (query.q.match(new RegExp(record.regexp, record._option))) {
      return flag_function("CANCEL")
    }
  }

  // 플래그 처리
  if (flag) {
    // console.log("FLAG가 유지되고 있습니다", flag)
    information = find_parameters(flag.api_name, query, user)
    return flag_function("RUN")
  }

  // continue 처리
  let continue_records = await sqlQuery("SELECT * FROM Regexp WHERE parameter_type = 'continue'")
  continue_flag = false
  for (let i in continue_records) {
    let record = continue_records[i]
    if (query.q.match(new RegExp(record.regexp, record._option)))
      continue_flag = true
  }
  // continue 없으면 정보 초기화
  if (!continue_flag)
    information = {}

  // 파싱 실행
  information = find_api(query, user)
  console.log(information, "......")
  if (Object.keys(information).length === 0)
    return flag_function("UNKNOWN")

  return flag_function("RUN")
}

// 1step -> 어떤 API인지 골라내기
function find_api(query, user) {
  for (let item in Api) {
    let record = Api[item]
    let api_name = record.api_name
    let parameter_type = record.parameter_type
    let display_name = record.display_name
    let response = record.response
    if (Regexpr[item] === undefined) continue

    for (let i = 0; i < Regexpr[item].length; i++) {
      let record = Regexpr[item][i]
      let regexp = new RegExp(record.regexp, record._option)
      let result = query.q.match(regexp)
      if (result) {
        flag = {
          api_name: api_name,
          display_name: display_name,
          API_information: Api[item]
        }
        let ret = find_parameters(api_name, query, user)
        return ret
      }
    }
  }
  if (continue_flag) {
    let api_name = information.API_information.api_name
    let ret = find_parameters(api_name, query, user)
    ret.API_information = Api[api_name]
    // console.log(ret)
    // console.log(ret.dongcode.result)
    return ret
  }
  return {}
}

// 2step -> 필요한 parameter 마다 파싱
function find_parameters(api_name, query, user) {
  let parameters = Parameter[api_name]
  let ret = {}
  // api_name에 맞지 않는 파라미터 삭제 O(N^2)
  for (let item in information) {
    let delete_flag = true
    for (let i = 0; i < parameters.length; i++) {
      let record = parameters[i]
      let parameter = record.parameter
      if (item == parameter) delete_flag = false
    }
    if (delete_flag) delete information[item]
  }
  if (flag) {
    ret = information
    ret.API_information = flag.API_information
    ret.message = flag.display_name + " 실행중입니다."
  }
  for (let i = 0; i < parameters.length; i++) {
    let record = parameters[i]
    let parameter = record.parameter
    let display_name = record.display_name
    let parameter_type = record.parameter_type
    let necessary = record.necessary
    let parsing_ret
    if (user[parameter])
      parsing_ret = user[parameter]
    else {
      parsing_ret = except_parameter(parameter, query)
      if (parsing_ret == null) {
        parsing_ret = parsing(Regexpr[parameter_type], query)
        if (parsing_ret == null && information[parameter] &&
          information[parameter].result != null) {
          parsing_ret = information[parameter].result
        }
      }
    }
    ret[parameter] = {
      display_name: display_name,
      result: parsing_ret,
      necessary: necessary
    }
  }
  return ret
}

// 3step -> 파싱 함수
function parsing(regs, query) {
  if (regs == null) return null
  let ret = []
  for (let i = 0; i < regs.length; i++) {
    let reg = regs[i]
    let parsing_array = query.q.match(new RegExp(reg.regexp, reg._option))
    if (parsing_array == null) continue

    for (let j = 0; j < parsing_array.length; j++) {
      let parsing_value = parsing_array[j]
      let return_value = (reg.return_value === null || reg.return_value === "") ?
        parsing_value.substr(reg.start, reg._length) :
        reg.return_value;
      query.q = query.q.replace(parsing_value, "")
      ret.push({
        parsing_value: parsing_value,
        return_value: return_value
      })
    }
    return ret
  }
  return null
}

function flag_function(query_flag) {
  // console.log("query_flag", query_flag)

  let recommend = []
  let return_object = {
    flag: query_flag,
    object: information,
    recommend: recommend
  }
  if (query_flag == "RUN") {
    let necessary_count = 0
    let match_count = 0
    for (let item in information) {
      let record = information[item]
      if (typeof record === 'object') {
        if (record.necessary) {
          ++necessary_count
          if (record.result) {
            ++match_count
          } else {
            recommend.push({
              display_name: record.display_name,
              parameter_type: item
            })
          }
        }
      }
    }
    if (necessary_count > 0 && necessary_count == match_count) {
      return_object.flag = 'SUCCESS'
      flag = null
      return return_object
    }
    return_object.flag = 'NOT SUCCESS'
    let necessary_array = []
    for (let item in recommend) {
      let parameter_type = recommend[item].parameter_type
      if (Recommend[parameter_type]) {
        for (let i in Recommend[parameter_type]) {
          necessary_array.push(Recommend[parameter_type][i].word)
        }
      }
    }
    return_object.necessary_array = necessary_array
    return return_object
  }

  flag = null
  console.log(query_flag, "쿼리플래그")
  if (query_flag == "HOME") {
    information.flag = "HOME"
    information.message = "안녕하세요. 원하는 기능을 선택해주세요!"
  } else if (query_flag == "ESC") {
    information = {}
    information.flag = "ESC"
    information.message = "ESC로 취소되었습니다."
  } else if (query_flag == "CANCEL") {
    information = {}
    information.flag = "CANCEL"
    information.message = "취소되었습니다."
  } else if (query_flag == "UNKNOWN") {
    information = {}
    information.flag = "UNKNOWN"
    information.message = "정확한 정보를 입력해주세요."
  }
  for (let i in Api) {
    recommend.push({
      display_name: Api[i].display_name,
      parameter_type: i
    })
  }
  return_object.object = information
  // console.log("FLAG FUNCTION EXECUTE", return_object, information)
  return return_object
}

function except_parameter(parameter, query) {
  // yyyymm 처리
  if (parameter == 'yyyymm') {
    let year_ret = parsing(Regexpr['year'], query)
    let month_ret = parsing(Regexpr['month'], query)
    ret = []
    if (year_ret == null || month_ret == null) return null
    for (let i = 0; i < year_ret.length; i++) {
      for (let j = 0; j < month_ret.length; j++) {
        if (month_ret[j].return_value.length == 1) {
          month_ret[j].return_value = '0' + month_ret[j].return_value
        }
        ret.push({
          parsing_value: year_ret[i].parsing_value + month_ret[j].parsing_value,
          return_value: year_ret[i].return_value + month_ret[j].return_value
        })
      }
    }
    return ret
  }
  return null
}

module.exports = function() {
  return {
    init: init,
    Api: Api,
    Parameter: Parameter,
    Regexpr: Regexpr,
    Recommend: Recommend,
    sqlConfig: sqlConfig,
    sqlQuery: sqlQuery,
    read_DB: read_DB,
    initialize: initialize,
    flag_function: flag_function
  }
}()
