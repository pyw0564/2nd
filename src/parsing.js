/*
  여기는 DataBase 입니다.
*/
var read_database = require('./read_database')
var Api = read_database.Api
var Parameter = read_database.Parameter
var Regexpr = read_database.Regexpr
var Recommend = read_database.Recommend
var Cancel = read_database.Cancel
var Continue = read_database.Continue
var Response = read_database.Response
var sqlQuery = read_database.sqlQuery

/*

  여기 부터는 파싱 부분입니다.

*/

async function init(query_flag, query, user, server) {
  // 파싱 플래그가 아니면 따로 처리한다
  if (query_flag != "PARSE")
    return await flag_function(query_flag, user, server)

  // 쿼리 객체화
  query = {
    q: " " + query + " "
  }

  // 취소 CLEAR 처리
  for (let i in Cancel) {
    let record = Cancel[i]
    if (await query.q.match(new RegExp(record.regexp, record._option)))
      return await flag_function("CANCEL", user, server)
  }

  let api_information = user.api_information // 정보 유지를 위한 플래그
  // 플래그 처리
  if (api_information) {
    console.log("FLAG가 유지되고 있습니다")
    user.information = await find_parameters(api_information.api_name, query, user)
    return await flag_function("RUN", user, server)
  }

  // continue 처리
  let continue_flag = false
  for (let i in Continue) {
    let record = Continue[i]
    if (await query.q.match(new RegExp(record.regexp, record._option)))
      continue_flag = true
  }
  // continue 없으면 정보 초기화
  if (continue_flag == false) {
    user.continue_flag = false
    user.information = {}
  }

  // 파싱 실행
  console.log("현재 쿼리상태 /parsing ----->", query)
  user.information = await find_api(query, user, server)
  if (await Object.keys(user.information).length === 0) {
    return await flag_function("UNKNOWN", user, server)
  }

  return await flag_function("RUN", user, server)
}

// 1step -> 어떤 API인지 골라내기
async function find_api(query, user, server) {
  let api_information = user.api_information
  let continue_flag = user.continue_flag
  for (let item in Api[server]) {
    let record = Api[server][item]
    let api_name = record.api_name
    let parameter_type = record.parameter_type
    let display_name = record.display_name
    let response = record.response
    if (Regexpr[item] === undefined) {
      console.log(`${item}에 맞는 정규표현식이 존재하지 않습니다`)
      continue
    }

    for (let i = 0; i < Regexpr[item].length; i++) {
      let record = Regexpr[item][i]
      let regexp = new RegExp(record.regexp, record._option)
      let result = await query.q.match(regexp)
      if (result) {
        user.api_information = Api[server][item] // 정보 유지를 위한 플래그
        return await find_parameters(api_name, query, user)
      }
    }
  }
  if (continue_flag) {
    user.api_information = Api[server][continue_flag] // 정보 유지를 위한 플래그
    return await find_parameters(continue_flag, query, user)
  }
  return {}
}

// 2step -> 필요한 parameter 마다 파싱
async function find_parameters(api_name, query, user) {
  let information = user.information // 파싱한 정보 객체
  let api_information = user.api_information // 정보 유지를 위한 플래그
  let parameters = Parameter[api_name]
  // api_name에 맞지 않는 파라미터 삭제 O(N^2)
  for (let item in information) {
    let delete_flag = true
    for (let i = 0; i < parameters.length; i++)
      if (item == parameters[i].parameter) delete_flag = false
    if (delete_flag) delete information[item]
  }
  user.information = information // 파싱한 정보 객체
  let ret = information

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
      query.q = await query.q.replace(parsing_value, "")
      await ret.push({
        parsing_value: parsing_value,
        return_value: return_value
      })
    }
  }
  if (ret.length) return ret
  return null
}

async function flag_function(flag, user, server) {
  console.log("현재 플래그 입니다!", flag)
  let api_information = user.api_information
  let information = user.information
  let recommend = []
  let message = ""
  let return_object = {
    flag,
    api_information,
    information,
    recommend,
    message
  }

  if (flag == "RUN") {
    if (user.start_flag == false) { // API 처음 시작할때 메시지 출력
      user.start_flag = true
      return_object.message = await make_html("START", api_information.api_name)
    }
    let necessary_count = 0
    let match_count = 0
    for (let item in information) {
      let record = information[item]
      if (user[item]) continue // 만약 기본 세션이면 패스(예시 : 단코드)
      if (typeof record !== "object") continue
      if (record.necessary) {
        ++necessary_count
        if (record.result) {
          ++match_count
        } else {
          await recommend.push({
            display_name: record.display_name,
            parameter_type: item
          })
        }
      }
    }
    // API 필요 파라미터가 완료 되었음
    if (necessary_count > 0 && necessary_count == match_count) {
      return_object.flag = "END"
      return_object.message += await make_html("END", api_information.api_name)
      user.start_flag = false
      user.continue_flag = api_information.api_name
      user.api_information = null
      return return_object
    }

    return_object.flag = "RUN"
    let necessary_array = {
      'Y': [],
      'N': []
    }
    for (let item in recommend) {
      let parameter_type = recommend[item].parameter_type
      if (Recommend[parameter_type]) {
        for (let i in Recommend[parameter_type]) {
          if (Recommend[parameter_type][i].button == 'Y') {
            await necessary_array.Y.push(Recommend[parameter_type][i].word)
          } else {
            await necessary_array.N.push(Recommend[parameter_type][i].word)
          }
        }
      }
    }
    return_object.necessary_array = necessary_array
    return_object.message += await make_html("RUN", api_information.api_name, necessary_array, recommend)
    user.information = information
    return_object.information = information
    return return_object
  }

  // 정보 유지를 위한 플래그
  for (let item in Api[server]) {
    await recommend.push({
      display_name: Api[server][item].display_name,
      parameter_type: item,
      show: Api[server][item].show
    })
  }
  return_object.flag = flag
  if (flag == "LOGIN") {
    return_object.message = await make_html(flag)
  } else if (flag == "ESC" || flag == "CANCEL" || flag == "UNKNOWN") {
    information = {}
    return_object.message = await make_html(flag)
  }
  return_object.message += await make_html("HOME", recommend)
  user.start_flag = false
  user.information = information
  user.api_information = null
  return_object.information = information
  return return_object
}

async function except_parameter(parameter, query) {
  // yyyymm 처리
  if (parameter == 'yyyymm') {
    let year_ret = await parsing(Regexpr.year, query)
    let month_ret = await parsing(Regexpr.month, query)
    ret = []
    if (year_ret == null || month_ret == null) return null
    for (let i = 0; i < year_ret.length; i++) {
      for (let j = 0; j < month_ret.length; j++) {
        if (month_ret[j].return_value.length == 1) {
          month_ret[j].return_value = '0' + month_ret[j].return_value
        }
        await ret.push({
          parsing_value: year_ret[i].parsing_value + month_ret[j].parsing_value,
          return_value: year_ret[i].return_value + month_ret[j].return_value
        })
      }
    }
    if (ret.length)
      return ret
    return null
  }
  return null
}

async function make_html(flag, api_name, necessary_array, need) {
  let str = ""
  // API 시작, 진행, 종료
  if (flag == "START" || flag == "RUN" || flag == "END") {
    let response_array
    if (Response[api_name] == null || Response[api_name] == undefined) response_array = []
    else response_array = Response[api_name][flag]
    str += await make_response_text(response_array, need)

    if (necessary_array) {
      let tmp
      if (necessary_array.Y.length && necessary_array.N.length) {
        if (Response[api_name] == null || Response[api_name] == undefined) tmp = []
        else tmp = Response[api_name].ALL
        str += await make_response_text(tmp, need)
      } else if (necessary_array.Y.length) {
        if (Response[api_name] == null || Response[api_name] == undefined) tmp = []
        else tmp = Response[api_name].BUTTON
        str += await make_response_text(tmp, need)
      } else if (necessary_array.N.length) {
        if (Response[api_name] == null || Response[api_name] == undefined) tmp = []
        else tmp = Response[api_name].TEXT
        str += await make_response_text(tmp, need)
      }
      if (necessary_array.N.length) {
        let idx = 0
        str += `<div> ex) `
        for (let item in necessary_array.N) {
          if (idx++) str += ', '
          str += `${necessary_array.N[item]}`
        }
        str += `</div>`
      }
      for (let item in necessary_array.Y)
        str += `<button class='recommend'>${necessary_array.Y[item]}</button>`
    }
    return await server_message(str)
  }

  // 그 외
  let response_array = Response[flag]
  if (response_array == null || response_array.length == 0)
    str += `${flag}에서 Response가 존재하지 않습니다`

  // 텍스트 우선 처리
  str += await make_response_text(response_array)
  // 추천 API들
  let recommend = api_name
  if (recommend) {
    for (let idx in recommend) {
      let next = await Number(idx) + 1
      if (recommend[idx].show == 'Y')
        str += `<div><button id='API_${next}' class='recommend'> ${next}. ${recommend[idx].display_name}</button></div>`
    }
  }
  return await server_message(str)
}

// response_text 중복 함수
async function make_response_text(response_array, need) {
  let str = ""
  let need_str = ""
  if (need) {
    let i = 0
    for (let index in need) {
      if (i++) need_str += ", "
      need_str += need[index].display_name
    }
  }
  for (let i in response_array) {
    let response_text = response_array[i].response_text
    let style = response_array[i].style
    str += `<div`
    if (style)
      str += ` style='${style}'`
    str += `>${response_text}</div>`
  }
  str = await str.replace("{need}", need_str)
  return str
}

// 시간 구하기
async function getTime() {
  var currentTime = new Date()
  return (await currentTime.getHours() < 10 ? '0' + await currentTime.getHours() : await currentTime.getHours()) + ":" +
    (await currentTime.getMinutes() < 10 ? '0' + await currentTime.getMinutes() : await currentTime.getMinutes()) + ":" +
    (await currentTime.getSeconds() < 10 ? '0' + await currentTime.getSeconds() : await currentTime.getSeconds())
}

// 서버함수
async function server_message(str) {
  if (str == "") return ""
  let msg = "<div class='msg'>"
  msg += "<div class='user'>System</div>"
  msg += "<div class='content'>"
  msg += "<div class='data notme'>" + str + "</div>"
  msg += "<div class='time'>" + await getTime() + "</div>"
  msg += "</div>"
  msg += "</div>"
  return msg
}

module.exports = function() {
  return {
    init,
    make_html,
    flag_function,
    make_response_text,
    getTime,
    server_message
  }
}()
