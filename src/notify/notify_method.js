/* jshint esversion: 8 */

// 관리비
function notify_gubun() {
  let list = ['관리비'];
  let ret = find_string_with_list(list);
  if (ret) return ret;
  return '관리비';
}

// 양식
function notify_form(){
  let list = ['양식1', '양식2', '양식3', '양식4','빈양식1', '빈양식2', '빈양식3', '빈양식4'];
  let value = ['양식1', '양식2', '양식3', '양식4','빈양식1', '빈양식2', '빈양식3', '빈양식4'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];

  return null;
}

// 인쇄양식
function notify_print_form(){
  let list = ['일반', '가스', '일반(A4)', '임대(가로)', '임대(세로)'];
  let value = ['일반', '가스', '일반(A4)', '임대(가로)', '임대(세로)'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];

  return null;
}

// 고지년월
function notify_goji_year_month() {
  // case 1 : YY년 MM월
  // case 2 : YY-MM
  // case 3 : YY년 MM월부터 YY년 MM월 예) 2010년04월부터 2020년 3월까지
  // case 4 : YY년 MM월 ~ YY년 MM월 예) 2011년3월~7월
  // case 5 : YY-MM 부터 YY-MM 예) 2005-03 부터 2005-07
  // case 6 : YY-MM ~ YY-MM 예) 2005-03~2005-07

  let object = {};
  let list = ['년'];
  let listIndexes = find_string_with_list_for_index(list);
  for (let i in listIndexes['년']) {
    let reg = /\d/;
    // 시작 년
    let fromYearIndex = listIndexes['년'][i];
    object.fromYear = object.toYear = nomalize(front_number(fromYearIndex));
    // 1980 <= 시작 년 <= 2100
    if (object.fromYear < 1980 || object.fromYear > 2100) continue;

    // 시작 월
    let fromMonthIndex = find_string_one_index('월', {
      start: fromYearIndex + 1,
      end: query.length - 1
    }, reg);

    // ERROR : 월을 찾지 못함
    if (fromMonthIndex == -1) continue;
    object.fromMonth = object.toMonth = nomalize(front_number(fromMonthIndex));
    // 1 <= 시작 월 <= 12
    if (object.fromMonth < 1 || object.fromMonth > 12) continue;

    // 부터
    let fromIndex = find_string_one_index('부터', {
      start: fromMonthIndex + 1,
      end: query.length - 2
    }, reg);
    if (fromIndex > 0) {
      // 부터 -> 종료 년
      let toYearIndex = find_string_one_index('년', {
        start: fromIndex + 2,
        end: query.length - 1
      }, reg);
      // ERROR : 부터 -> 종료 년을 찾지 못함
      if (toYearIndex == -1) continue;
      let toYear = nomalize(front_number(toYearIndex));
      if (toYear < 1980 || toYear > 2100) continue;
      if (toYear < object.fromYear) continue;

      // 부터 -> 종료 월
      let toMonthIndex = find_string_one_index('월', {
        start: toYearIndex + 1,
        end: query.length - 1
      }, reg);
      // ERROR : 부터 -> 종료 년을 찾지 못함
      if (toMonthIndex == -1) continue;
      let toMonth = nomalize(front_number(toMonthIndex));
      if (toMonth < 1 || toMonth > 12) continue;
      if (toYear == object.fromYear && toMonth < object.fromMonth) continue;
      object.toYear = toYear;
      object.toMonth = toMonth;
      visited_query[fromIndex] = 1;
      return object;
    }

    fromIndex = find_string_one_index('~', {
      start: fromMonthIndex + 1,
      end: query.length - 1
    }, reg);
    if (fromIndex > 0) {
      // ~ -> 종료 년
      let toYearIndex = find_string_one_index('년', {
        start: fromIndex + 2,
        end: query.length - 1
      }, reg);
      // ERROR : ~ -> 종료 년을 찾지 못함
      if (toYearIndex == -1) continue;
      let toYear = nomalize(front_number(toYearIndex));
      if (toYear < 1980 || toYear > 2100) continue;
      if (toYear < object.fromYear) continue;

      // ~ -> 종료 월
      let toMonthIndex = find_string_one_index('월', {
        start: toYearIndex + 1,
        end: query.length - 1
      }, reg);
      // ERROR : ~ -> 종료 년을 찾지 못함
      if (toMonthIndex == -1) continue;
      let toMonth = nomalize(front_number(toMonthIndex));
      if (toMonth < 1 || toMonth > 12) continue;
      if (toYear == object.fromYear && toMonth < object.fromMonth) continue;
      object.toYear = toYear;
      object.toMonth = toMonth;
      visited_query[fromIndex] = 1;
      return object;
    }
    return object;
  }
  list = ['-'];
  listIndexes = find_string_with_list_for_index(list);

  for (let i in listIndexes['-']) {
    let reg = /\d/;
    // 시작 년
    let fromBarIndex = listIndexes['-'][i];
    object.fromYear = object.toYear = nomalize(front_number(fromBarIndex));
    // 1980 <= 시작 년 <= 2100
    if (object.fromYear < 1980 || object.fromYear > 2100) continue;

    // 시작 월
    object.fromMonth = object.toMonth = nomalize(back_number(fromBarIndex));
    // 1 <= 시작 월 <= 12
    if (object.fromMonth < 1 || object.fromMonth > 12) continue;

    // 부터
    let fromIndex = find_string_one_index('부터', {
      start: fromBarIndex + 1,
      end: query.length - 2
    }, reg);
    if (fromIndex > 0) {
      // 부터 -> 종료 년
      let toBarIndex = find_string_one_index('-', {
        start: fromIndex + 2,
        end: query.length - 1
      }, reg);
      // ERROR : 부터 -> 종료 년을 찾지 못함
      if (toBarIndex == -1) continue;
      let toYear = nomalize(front_number(toBarIndex));
      if (toYear < 1980 || toYear > 2100) continue;

      // 부터 -> 종료 월
      // ERROR : 부터 -> 종료 년을 찾지 못함
      let toMonth = nomalize(back_number(toBarIndex));
      if (toMonth < 1 || toMonth > 12) continue;
      if (toYear == object.fromYear && toMonth < object.fromMonth) continue;
      visited_query[fromBarIndex] = 1;
      visited_query[toBarIndex] = 1;
      visited_query[fromIndex] = 1;
      object.toYear = toYear;
      object.toMonth = toMonth;
      return object;
    }

    fromIndex = find_string_one_index('~', {
      start: fromBarIndex + 1,
      end: query.length - 2
    }, reg);
    if (fromIndex > 0) {
      // ~ -> 종료 년
      let toBarIndex = find_string_one_index('-', {
        start: fromIndex + 2,
        end: query.length - 1
      }, reg);
      // ERROR : ~ -> 종료 년을 찾지 못함
      if (toBarIndex == -1) continue;
      let toYear = nomalize(front_number(toBarIndex));
      if (toYear < 1980 || toYear > 2100) continue;

      // ~ -> 종료 월
      // ERROR : ~ -> 종료 년을 찾지 못함
      let toMonth = nomalize(back_number(toBarIndex));
      if (toMonth < 1 || toMonth > 12) continue;
      if (toYear == object.fromYear && toMonth < object.fromMonth) continue;
      visited_query[fromBarIndex] = 1;
      visited_query[toBarIndex] = 1;
      visited_query[fromIndex] = 1;
      object.toYear = toYear;
      object.toMonth = toMonth;
      return object;
    }
    visited_query[fromBarIndex] = 1;
    visited_query[fromIndex] = 1;
    return object;
  }
  return null;
}

// 정렬
function notify_sort() {
  let list = ['수직입력', '수평입력', '지그재그', '역지그재그', '사용자정의'];
  let value = ['S1:수직입력', 'S2:수평입력', 'S3:지그재그', 'S4:역지그재그', 'S5:사용자정의'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 조회동
function notify_inquire_dong() {
  let object = {};
  let list = ['~', '부터', '에서'];
  let listIndexes = find_string_with_list_for_index(list);
  // case 1 : XX~XX
  // case 2 : XX동~XX동
  // case 3 : XX동부터 XX동
  // case 4 : XX부터 XX까지

  for (let listName in listIndexes)
    for (let i in listIndexes[listName]) {
      let fromIndex = listIndexes[listName][i];
      if (visited_query[fromIndex]) continue;
      if (listName == '~') {
        // 시작 동
        let fromDong = fromIndex;
        object.inquire_fromDong = nomalize(front_number(fromDong, /동/));
        // 종료 동
        let toDong = fromIndex;
        object.inquire_toDong = nomalize(back_number(toDong, / /));
        if (object.inquire_toDong && object.inquire_fromDong) return object;
        console.log(object);
      } else if (listName == '부터') {
        // 시작 년
        let fromDong = fromIndex;
        object.inquire_fromDong = nomalize(front_number(fromDong, /동/));
        // 1980 <= 시작 년 <= 2100
        let toDong = fromIndex + 1;
        object.inquire_toDong = nomalize(back_number(toDong, / /));
        if (object.inquire_toDong && object.inquire_fromDong) return object;
      }
    }
  return null;
}

// 입주구분
function notify_move_in_gubun() {
  let list = ['입주', '이사', '분리', '공가', '본사'];
  let ret = find_string_with_list(list);
  if (ret) return ret;

  return null;
}

// 납기구분
function notify_delivery_gubun() {
  let list = ['납기후', '납기내'];
  let ret = find_string_with_list(list);
  if (ret) return ret;

  return null;
}

// 동
function notify_dong_room() {
  let object = {};
  // case 1 : XX동 XX호
  let list = ['동'];
  let listIndexes = find_string_with_list_for_index(list);
  for (let listname in listIndexes)
    for (let i in listIndexes[listname]) {
      let ret = nomalize(front_number(listIndexes[listname][i]));
      // 동의 수 범위 제한
      if (1 <= parseInt(ret) && parseInt(ret) <= 9999) {
        object.dong = ret;
        break;
      }
    }

  list = ['호'];
  listIndexes = find_string_with_list_for_index(list);
  for (let listname in listIndexes)
    for (let i in listIndexes[listname]) {
      let ret = nomalize(front_number(listIndexes[listname][i]));
      // 호의 수 범위 제한
      if (1 <= parseInt(ret) && parseInt(ret) <= 9999) {
        object.room = ret;
        break;
      }
    }
  if (object.dong && object.room) return object;

  // case 2 : dong - room
  list = ['-'];
  listIndexes = find_string_with_list_for_index(list);
  for (let listname in listIndexes)
    for (let i in listIndexes[listname]) {
      if (visited_query[listIndexes[listname][i]]) continue;
      let ret = nomalize(front_number(listIndexes[listname][i]));
      // 호의 수 범위 제한
      if (1 <= parseInt(ret) && parseInt(ret) <= 9999) {
        object.dong = ret;
      } else continue;
      ret = nomalize(back_number(listIndexes[listname][i]));
      // 호의 수 범위 제한
      if (1 <= parseInt(ret) && parseInt(ret) <= 9999) {
        object.room = ret;
      } else continue;
      return object;
    }
  return null;
}

// 조건
function notify_condition() {
  let list = ['월별1', '월별2', '월별3', '월별4', '집계', '상호', '누계', '80c', '상호2'];
  let value = ['세대월별1', '세대월별2', '세대월별3', '세대월별4', '세대집계', '세대집계(상호)', '세대누계', '세대월별(80c)', '세대집계(상호)II'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];

  return null;
}

// 출력조건
function notify_print_condition() {
  let list = ['동별', '개월수별'];
  let value = ['동별', '개월수별'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];

  return null;
}

// 조회조건
function notify_inquire_condition() {
  let list = ['세대별', '동별'];
  let value = ['[세대별]', '[동별]'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];

  return null;
}

// 전체_관리비
function notify_all_or_management() {
  let list = ['관리비'];
  return find_string_with_list(list);
}

// 정방향_역방향
function notify_forward_reverse() {
  let list = ['정방향', '역방향'];
  let value = ['정방향', '역방향'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 조회동 1개
function notify_inquire_dong_one() {
  let list = ['동'];
  let listIndexes = find_string_with_list_for_index(list);
  for (let listname in listIndexes)
    for (let i in listIndexes[listname]) {
      let ret = nomalize(front_number(listIndexes[listname][i]));
      // 동의 수 범위 제한
      if (1 <= parseInt(ret) && parseInt(ret) <= 9999) return ret;
    }
  return null;
}

// 미납개월
function notify_notify_month() {
  let object = {};
  let list = ['~', '부터'];
  let listIndexes = find_string_with_list_for_index(list);
  // case 1 : XX~XX
  // case 2 : XX개월~XX개월
  // case 3 : XX개월부터 XX개월
  // case 4 : XX부터 XX까지

  for (let listName in listIndexes)
    for (let i in listIndexes[listName]) {
      let fromIndex = listIndexes[listName][i];
      if (visited_query[fromIndex]) continue;
      if (listName == '~') {
        // 시작 동
        let fromMonth = fromIndex;
        object.fromMonth = nomalize(front_number(fromMonth, /개|월/));
        // 종료 동
        let toMonth = fromIndex;
        object.toMonth = nomalize(back_number(toMonth));
        if (object.toMonth && object.fromMonth) return object;
      } else if (listName == '부터') {
        // 시작 년
        let fromMonth = fromIndex;
        object.fromMonth = nomalize(front_number(fromMonth, /개|월/));
        // 1980 <= 시작 년 <= 2100
        let toMonth = fromIndex + 1;
        object.toMonth = nomalize(back_number(toMonth));
        if (object.toMonth && object.fromMonth) return object;
      }
    }
  return null;
}
