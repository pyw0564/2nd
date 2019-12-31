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
async function initialize(user) {
  user.information = {}
  user.flag = null
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
async function read_DB(user) {
  await initialize(user)
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

async function init(query_flag, query, user) {
  let information = user.information // 파싱한 정보 객체
  let flag = user.flag // 정보 유지를 위한 플래그
  let continue_flag = user.continue_flag
  // console.log("CHANGE", user)
  // console.log(query_flag, query)
  // 파싱 플래그가 아니면 따로 처리한다
  if (query_flag != "PARSE") {
    return flag_function(query_flag, user)
  }

  // 쿼리 객체화
  query = {
    q: " " + query + " "
  }

  // 취소 CLEAR 처리
  let records = await sqlQuery("SELECT * FROM Regexp WHERE parameter_type = 'cancel'")
  for (let i in records) {
    let record = records[i]
    if (await query.q.match(new RegExp(record.regexp, record._option))) {
      return await flag_function("CANCEL", user)
    }
  }
  // 플래그 처리
  if (flag) {
    console.log("FLAG가 유지되고 있습니다", flag)
    information = await find_parameters(flag.api_name, query, user)
    user.information = information
    return await flag_function("RUN", user)
  }

  // continue 처리
  let continue_records = await sqlQuery("SELECT * FROM Regexp WHERE parameter_type = 'continue'")
  continue_flag = false
  user.continue_flag = continue_flag
  for (let i in continue_records) {
    let record = continue_records[i]
    if (await query.q.match(new RegExp(record.regexp, record._option)))
      continue_flag = true
    user.continue_flag = continue_flag
  }
  // continue 없으면 정보 초기화
  if (!continue_flag) {
    information = {}
    user.information = information
  }

  // 파싱 실행
  console.log("...쿼리", query)
  information = await find_api(query, user)
  user.information = information
  if (Object.keys(information).length === 0) {
    console.log("......", information)
    return await flag_function("UNKNOWN", user)
  }
  console.log("RUN", information)
  return await flag_function("RUN", user)
}

// 1step -> 어떤 API인지 골라내기
async function find_api(query, user) {
  let information = user.information // 파싱한 정보 객체
  let flag = user.flag // 정보 유지를 위한 플래그
  let continue_flag = user.continue_flag
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
      let result = await query.q.match(regexp)
      if (result) {
        console.log("API FIND", result)
        flag = {
          api_name: api_name,
          display_name: display_name,
          API_information: Api[item]
        }
        user.flag = flag // 정보 유지를 위한 플래그
        let ret = await find_parameters(api_name, query, user)
        return ret
      }
    }
  }
  if (continue_flag) {
    let api_name = information.API_information.api_name
    let ret = await find_parameters(api_name, query, user)
    ret.API_information = Api[api_name]
    // console.log(ret)
    // console.log(ret.dongcode.result)
    return ret
  }
  return {}
}

// 2step -> 필요한 parameter 마다 파싱
async function find_parameters(api_name, query, user) {
  let information = user.information // 파싱한 정보 객체
  let flag = user.flag // 정보 유지를 위한 플래그
  let parameters = Parameter[api_name]
  console.log("ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ", Parameter)
  console.log("ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ", parameters, api_name)
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
  user.information = information // 파싱한 정보 객체
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
      parsing_ret = await except_parameter(parameter, query)
      if (parsing_ret == null) {
        parsing_ret = await parsing(Regexpr[parameter_type], query)
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
async function parsing(regs, query) {
  if (regs == null) return null
  let ret = []
  for (let i = 0; i < regs.length; i++) {
    let reg = regs[i]
    let parsing_array = await query.q.match(new RegExp(reg.regexp, reg._option))
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

async function flag_function(query_flag, user) {
  // console.log("flag function", user)
  let information = user.information // 파싱한 정보 객체
  let flag = user.flag // 정보 유지를 위한 플래그
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
      user.flag = flag // 정보 유지를 위한 플래그
      return return_object
    }
    return_object.flag = 'NOT SUCCESS'
    console.log("부족한것", recommend)
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
  user.flag = flag // 정보 유지를 위한 플래그
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
  user.information = information
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

async function except_parameter(parameter, query) {
  // yyyymm 처리
  if (parameter == 'yyyymm') {
    let year_ret = await parsing(Regexpr['year'], query)
    let month_ret = await parsing(Regexpr['month'], query)
    ret = []
    console.log(year_ret, month_ret)
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
    console.log(ret)
    if (ret.length)
      return ret
    return null
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
