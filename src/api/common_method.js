/* jshint esversion: 8 */
var information = {}; // 파싱한 정보 객체
var query; // 입력 문자열
var flag; // 정보 유지를 위한 플래그
function init(q) {
  // CLEAR
  if (q == '취소') {
    console.log("CLEAR EXECUTE");
    information = {
      message: "정보가 초기화 되었습니다"
    };
    flag = null;
    return information;
  }

  information = find_table(q);
  console.log(information);
  return information;
}
// 1step
function find_table(query) {
  if (flag) {
    console.log("FLAG EXECUTE");
    return parameters(flag.table, query);
  }
  for (let i = 0; i < tableList.length; i++) {
    let key = tableList[i].key;
    let tableName = tableList[i].tableName;
    if (query.indexOf(key) !== -1) {
      return parameters(tables[tableName], query);
    }
  }
  return null;
}

// 2step
function parameters(table, query) {
  let ret = information;
  if (flag){
    ret['message'] = "FLAG가 실행되어 고정중입니다."
  }
  flag = { table: table };
  for (let i = 0; i < table.length; i++) {
    let parameter = table[i].parameter;
    let display_name = table[i].display_name;
    let parameter_type = table[i].parameter_type;
    let parsing_ret = parsing(reg[parameter_type], query);
    if (parsing_ret == null && ret[parameter] != null) continue;
    ret[parameter] = parsing_ret;
  }
  return ret;
}

// 3step
function parsing(regs, query) {
  if (regs == null) return null;
  for (let i = 0; i < regs.length; i++) {
    let reg = regs[i];
    let regexp = new RegExp(reg.regexp, reg.reg_option);
    console.log('정규표현식 ->', regexp);
    let parsing_array = query.match(regexp);
    if (parsing_array == null) continue;
    if (parsing_array.length == 1) {
      let ret = reg.return_value === null ? query.substr(reg.start, reg._length) : reg.return_value;
      query = query.substr(0, reg.start) + query.substr(reg.start + reg._length, query.length);
      return ret;
    } else if (parsing_array.length > 1) {
      console.log("정규표현식 결과가 2개이상이므로 모호합니다");
    }
  }
  return null;
}
