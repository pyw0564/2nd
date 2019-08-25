/* jshint esversion: 8 */
const NOT_FOUND = -1;
const NEED_BLANK_SIDE = 1;
const SEGMENT = 2;
const YEAR_MIN = 1980;
const YEAR_MAX = 2100;
const MONTH_MIN = 1;
const MONTH_MAX = 12;
const DONG_MIN = 1;
const DONG_MAX = 9999;
const ROOM_MIN = 1;
const ROOM_MAX = 9999;
const USE_MIN = 1;
const USE_MAX = 9999;
const SEDAE_MIN = 1;
const SEDAE_MAX = 9999;
const MIN = 1;
const MAX = 9999;

var information = {}; // 파싱한 정보 객체
var query; // 입력 문자열
var visited_query = []; // 문자열 중복처리
var flag; // 정보 유지를 위한 플래그

var list_inspect = []; // 검침 항목 리스트
var list_inspect_key = []; // 검침 항목 - 키값 리스트
var list_content_size_inspect = []; // 검침 항목 리스트 - 크기
var list_inspect_url = []; // 검침 항목 - url 리스트
for (let i = 0; i < ret_list_inspect.length; i++) list_inspect.push(ret_list_inspect[i].item);
for (let i = 0; i < ret_list_inspect.length; i++) list_inspect_key.push(ret_list_inspect[i].name);
for (let i = 0; i < ret_list_inspect.length; i++) list_content_size_inspect.push(list_inspect_key[i].length);
for (let i = 0; i < ret_list_inspect.length; i++) list_inspect_url.push(ret_list_inspect[i].url);

var list_unpaid = []; // 미납 항목 리스트
var list_unpaid_key = []; // 미납 항목 - 키값 리스트
var list_content_size_unpaid = []; // 미납 항목 리스트 - 크기
var list_unpaid_url = []; // 미납 항목 - url 리스트
for (let i = 0; i < ret_list_unpaid.length; i++) list_unpaid.push(ret_list_unpaid[i].item);
for (let i = 0; i < ret_list_unpaid.length; i++) list_unpaid_key.push(ret_list_unpaid[i].name);
for (let i = 0; i < ret_list_unpaid.length; i++) list_content_size_unpaid.push(list_unpaid_key[i].length);
for (let i = 0; i < ret_list_unpaid.length; i++) list_unpaid_url.push(ret_list_unpaid[i].url);

var list_notify = []; // 미납 항목 리스트
var list_notify_key = []; // 미납 항목 - 키값 리스트
var list_content_size_notify = []; // 미납 항목 리스트 - 크기
var list_notify_url = []; // 미납 항목 - url 리스트
for (let i = 0; i < ret_list_notify.length; i++) list_notify.push(ret_list_notify[i].item);
for (let i = 0; i < ret_list_notify.length; i++) list_notify_key.push(ret_list_notify[i].name);
for (let i = 0; i < ret_list_notify.length; i++) list_content_size_notify.push(list_notify_key[i].length);
for (let i = 0; i < ret_list_notify.length; i++) list_notify_url.push(ret_list_notify[i].url);

var list_clear = [];
for (let i = 0; i < ret_list_clear.length; i++) list_clear.push(ret_list_clear[i]);

function init(q) {
  query = "          " + q + "          "; // underflow, overflow protected
  // CLEAR
  let listIndexes = find_string_with_list(list_clear);
  if (listIndexes) {
    console.log("CLEAR EXECUTE");
    information = {
      message: "정보가 초기화 되었습니다"
    };
    flag = null;
    return information;
  }

  // Flag
  if (flag) {
    console.log("FLAG EXECUTE");
    flag(query);
    not_enter();
    return information;
  }

  // initialize
  information = {};
  visited_unpaid = [];
  for (let i = 0; i < query.length; i++) visited_unpaid.push(0);

  // 검침
  for (let i = 0; i < query.length; i++)
    for (let j = 0; j < list_inspect_key.length; j++)
      if (list_inspect_key[j] != '-' && q.substr(i, list_content_size_inspect[j]) === list_inspect_key[j]) {
        inquire_inspect[j](query);
        information['사이트항목'] = list_inspect[j];
        information['주소URL'] = list_inspect_url[j];
        flag = inquire_inspect[j];
        not_enter();
        return information;
      }

  // 고지
  for (let i = 0; i < query.length; i++)
    for (let j = 0; j < list_notify_key.length; j++)
      if (list_notify_key[j] != '-' && q.substr(i, list_content_size_notify[j]) === list_notify_key[j]) {
        inquire_notify[j](query);
        information['사이트항목'] = list_notify[j];
        information['주소URL'] = list_notify_url[j];
        flag = inquire_notify[j];
        not_enter();
        return information;
      }

  // 미납
  if (find_string_one_index('미납') != -1)
    for (let i = 0; i < query.length; i++)
      for (let j = 0; j < list_unpaid_key.length; j++)
        if (list_unpaid_key[j] != '-' && q.substr(i, list_content_size_unpaid[j]) === list_unpaid_key[j]) {
          inquire_unpaid[j](query);
          information['사이트항목'] = list_unpaid[j];
          information['주소URL'] = list_unpaid_url[j];
          flag = inquire_unpaid[j];
          not_enter();
          return information;
        }

  information.message = "입력 값을 제대로 확인하여 주십시오";
  return information;
}

function not_enter() {
  information['미입력'] = [];
  for (let i in information)
    if (information[i] == null)
      information['미입력'].push(i);
}

// 숫자인가?
function isdigit(c) {
  return ('0' <= c && c <= '9');
}

// 단어가 있는지 없는지 유무만 판단한다.
function find_string_with_list(list, option) {
  for (let i in list) {
    let ret;
    if (option == NEED_BLANK_SIDE) ret = find_string_with_NEED_BLANK(list[i]);
    else ret = find_string_one_index(list[i]);
    if (ret != -1) return list[i];
  }
  return null;
}

// 단어가 있다면 단어가 위치한 인덱스 값을 반환한다.
function find_string_with_list_for_index(list, option, segment) {
  let ret_index = {};
  for (let i in list) {
    let ret;
    if (option == NEED_BLANK_SIDE) ret = find_string_with_NEED_BLANK(list[i]);
    else if (option == SEGMENT) ret = find_string_all_index(list[i], segment);
    else ret = find_string_all_index(list[i]);
    if (ret) ret_index[list[i]] = ret;
  }
  return ret_index;
}

// 문자열이 있는위치를 모두 반환한다 [구간], [정규표현식]
function find_string_all_index(s, segment, reg) {
  let ret = [];
  let l = 0;
  let r = query.length - s.length;
  let add = 1;
  if (segment) {
    l = segment.start;
    r = segment.end;
    if (l > r) {
      l = segment.end;
      r = segment.start;
      add = -1;
    }
  }
  for (let i = l;; i += add) {
    if (i == r) {
      if (query.substr(i, s.length) === s) ret.push(i);
      break;
    }
    if (query.substr(i, s.length) === s) ret.push(i);
    if (reg && continue_string(i, reg)) continue;
  }
  return ret;
}

// 문자열이 있는 위치를 하나만 반환한다 [구간], [정규표현식]
function find_string_one_index(s, segment, reg) {
  let l = 0;
  let r = query.length - s.length;
  let add = 1;
  if (segment) {
    l = segment.start;
    r = segment.end;
    if (l > r) {
      l = segment.end;
      r = segment.start;
      add = -1;
    }
  }
  for (let i = l;; i += add) {
    if (i == r) {
      if (query.substr(i, s.length) == s) return i;
      break;
    }
    if (query.substr(i, s.length) == s) return i;
    if (reg && continue_string(i, reg)) continue;
  }
  return -1;
}

// 양쪽에 공백을 포함한 문자열이 있는가 ?
function find_string_with_NEED_BLANK(s) {
  for (let i = 0; i < query.length - s.length - 1; i++)
    if (query.substr(i, s.length) == s && query[i - 1] == ' ' && query[i + s.length] == ' ')
      return i;
  return -1;
}

// 어떤 문자열 기준으로 앞의 숫자 추출
function front_number(index, reg) {
  let ret = '';
  for (let i = index - 1; i >= 0; i--) {
    if (reg && continue_string(i, reg)) continue;
    if (!isdigit(query[i])) break;
    ret = query[i] + ret;
  }
  nomalize(ret);
  return ret;
}

// 어떤 문자열 기준으로 뒤의 숫자 추출
function back_number(index, reg) {
  let ret = '';
  for (let i = index + 1; i < query.length; i++) {
    if (reg && continue_string(i, reg)) continue;
    if (!isdigit(query[i])) break;
    ret = ret + query[i];
  }
  nomalize(ret);
  return ret;
}

// 정규식과 일치하면 continue 한다.
function continue_string(index, reg) {
  return reg.exec(query.substr(index, 1));
}

// 숫자를 정규화 한다.
function nomalize(s) {
  for (let i = 0; i < s.length; i++)
    if (s[i] != '0') return s.substr(i, s.length - i);
}

// 추출한 정보를 정규화 한다.
function information_nomalize(key, value, object) {
  if (typeof(key) == 'object') {
    for (let i = 0; i < key.length; i++) {
      if (information[key[i]] && object[value[i]] == null) continue;
      information[key[i]] = object[value[i]];
    }
  } else {
    if (information[key] && value == null) return;
    information[key] = value;
  }
}

// Object를 초기화 한다.
function object_initialize(_object, _keys) {
  for (let key in _keys) {
    _object[key] = null;
  }
}
