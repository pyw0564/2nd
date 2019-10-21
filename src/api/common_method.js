/* jshint esversion: 8 */
var information = {} // 파싱한 정보 객체
var flag // 정보 유지를 위한 플래그
function init(query) {
  // CLEAR
  if (query == '취소') {
    console.log("CLEAR EXECUTE")
    information = {
      message: "정보가 초기화 되었습니다"
    }
    flag = null
    return information
  }
  if (flag) {
    console.log("FLAG EXECUTE")
    return find_parameters(flag.api_name, query)
  }
  information = {}
  information = find_api(query)
  console.log(information)
  return information
}

// 1step -> api 골라내기
function find_api(query) {
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
        let ret = find_parameters(api_name, query)
        ret.response = response
        return ret
      }
    }
  }
  return null
}

// 2step -> parameter 마다 파싱
function find_parameters(api_name, query) {
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
    if(parameter == 'dancode') {
      ret.dancode = {
        display_name : display_name,
        result : 1413,
        necessary : necessary
      }
      continue;
    }
    let parsing_ret = parsing(Regexpr[parameter_type], query)
    if (parsing_ret == null && information[parameter] != null) continue
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
