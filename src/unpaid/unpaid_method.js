/* jshint esversion: 8 */
var inquire_unpaid_functions = {
  '고지년월': unpaid_goji_year_month,
  '구분': unpaid_gubun,
  '납기구분': unpaid_delivery_gubun,
  '동': unpaid_inquire_dong_one,
  '동_호': unpaid_dong_room,
  '미납개월': unpaid_unpaid_month,
  '입주구분': unpaid_move_in_gubun,
  '전체_관리비': unpaid_all_or_management,
  '정렬': unpaid_sort,
  '조건': unpaid_condition,
  '조회동': unpaid_inquire_dong,
  '조회조건': unpaid_inquire_condition,
  '출력조건': unpaid_print_condition,
};

// 기준년월
function unpaid_base_year_month() {
  // case 1 : YY년 MM월
  // case 2 : YY-MM
  let information_keys = ['기준년', '기준월'];
  let object_keys = ['baseYear', 'baseMonth'];
  let object = {};
  object_initialize(object, object_keys);

  let reg = /\d/;
  let list = ['년'];
  let list_indexes = find_string_with_list_for_index(list);
  for (let index in list_indexes['년']) {
    // 시작 년
    let fromYearIndex = list_indexes['년'][index];
    // 1980 <= 시작 년 <= 2100
    object.baseYear = front_number(fromYearIndex);
    if (object.baseYear < YEAR_MIN || object.baseYear > YEAR_MAX) continue;

    // 시작 월
    let fromMonthIndex = find_string_one_index('월', {
      start: fromYearIndex + 1,
      end: query.length - 1
    }, reg);

    // ERROR : 월을 찾지 못함
    if (fromMonthIndex == NOT_FOUND) continue;
    object.baseMonth = front_number(fromMonthIndex);
    if (object.baseMonth < MONTH_MIN || object.baseMonth > MONTH_MAX) continue;
    // 1 <= 시작 월 <= 12
    if (object.baseYear && object.baseMonth) {
      return information_nomalize(information_keys, object_keys, object);
    }
  }

  list = ['-'];
  list_indexes = find_string_with_list_for_index(list);

  for (let index in list_indexes['-']) {
    // 시작 년
    let fromBarIndex = list_indexes['-'][index];
    object.baseYear = front_number(fromBarIndex);
    // 1980 <= 시작 년 <= 2100
    if (object.baseYear < YEAR_MIN || object.baseYear > YEAR_MAX) continue;

    // 시작 월
    object.baseMonth = back_number(fromBarIndex);
    // 1 <= 시작 월 <= 12
    if (object.baseMonth < MONTH_MIN || object.baseMonth > MONTH_MAX) continue;
    visited_query[fromBarIndex] = 1;
    if (object.baseYear && object.baseMonth) {
      return information_nomalize(information_keys, object_keys, object);
    }
  }
  return information_nomalize(information_keys, object_keys, object);
}

// 고지년월
function unpaid_goji_year_month() {
  // case 1 : YY년 MM월
  // case 2 : YY-MM
  // case 3 : YY년 MM월부터 YY년 MM월 예) 2010년04월부터 2020년 3월까지
  // case 4 : YY년 MM월 ~ YY년 MM월 예) 2011년3월~7월
  // case 5 : YY-MM 부터 YY-MM 예) 2005-03 부터 2005-07
  // case 6 : YY-MM ~ YY-MM 예) 2005-03~2005-07
  let information_keys = ['고지년_시작', '고지년_종료', '고지월_시작', '고지월_종료'];
  let object_keys = ['fromYear', 'toYear', 'fromMonth', 'toMonth'];
  let object = {};
  object_initialize(object, object_keys);

  let reg = /\d/;
  let list = ['년'];
  let list_indexes = find_string_with_list_for_index(list);
  for (let index in list_indexes['년']) {
    // 시작 년
    let fromYearIndex = list_indexes['년'][index];
    object.fromYear = object.toYear = front_number(fromYearIndex);
    // 1980 <= 시작 년 <= 2100
    if (object.fromYear < YEAR_MIN || object.fromYear > YEAR_MAX) continue;

    // 시작 월
    let fromMonthIndex = find_string_one_index('월', {
      start: fromYearIndex + 1,
      end: query.length - 1
    }, reg);

    // ERROR : 월을 찾지 못함
    if (fromMonthIndex == NOT_FOUND) continue;
    object.fromMonth = object.toMonth = front_number(fromMonthIndex);
    // 1 <= 시작 월 <= 12
    if (object.fromMonth < MONTH_MIN || object.fromMonth > MONTH_MAX) continue;

    // 부터
    let fromIndex = find_string_one_index('부터', {
      start: fromMonthIndex + 1,
      end: query.length - 2
    }, reg);
    if (fromIndex != NOT_FOUND) {
      // 부터 -> 종료 년
      let toYearIndex = find_string_one_index('년', {
        start: fromIndex + 2,
        end: query.length - 1
      }, reg);
      // ERROR : 부터 -> 종료 년을 찾지 못함
      if (toYearIndex == NOT_FOUND) continue;
      let toYear = front_number(toYearIndex);
      if (toYear < YEAR_MIN || toYear > YEAR_MAX) continue;
      // ERROR : 종료 년이 시작 년보다 과거이다.
      if (toYear < object.fromYear) continue;

      // 부터 -> 종료 월
      let toMonthIndex = find_string_one_index('월', {
        start: toYearIndex + 1,
        end: query.length - 1
      }, reg);
      // ERROR : 부터 -> 종료 년을 찾지 못함
      if (toMonthIndex == NOT_FOUND) continue;
      let toMonth = front_number(toMonthIndex);
      if (toMonth < MONTH_MIN || toMonth > MONTH_MAX) continue;
      // ERROR : 종료 월이 시작 월보다 과거이다.
      if (toYear == object.fromYear && toMonth < object.fromMonth) continue;
      object.toYear = toYear;
      object.toMonth = toMonth;
      visited_query[fromIndex] = 1;
      return information_nomalize(information_keys, object_keys, object);
    }

    fromIndex = find_string_one_index('~', {
      start: fromMonthIndex + 1,
      end: query.length - 1
    }, reg);
    if (fromIndex != NOT_FOUND) {
      // ~ -> 종료 년
      let toYearIndex = find_string_one_index('년', {
        start: fromIndex + 2,
        end: query.length - 1
      }, reg);
      // ERROR : ~ -> 종료 년을 찾지 못함
      if (toYearIndex == NOT_FOUND) continue;
      let toYear = front_number(toYearIndex);
      if (toYear < YEAR_MIN || toYear > YEAR_MAX) continue;
      // ERROR : 종료 년이 시작 년보다 과거이다.
      if (toYear < object.fromYear) continue;

      // ~ -> 종료 월
      let toMonthIndex = find_string_one_index('월', {
        start: toYearIndex + 1,
        end: query.length - 1
      }, reg);
      // ERROR : ~ -> 종료 월을 찾지 못함
      if (toMonthIndex == NOT_FOUND) continue;
      let toMonth = front_number(toMonthIndex);
      if (toMonth < MONTH_MIN || toMonth > MONTH_MAX) continue;
      // ERROR : 종료 월이 시작 월보다 과거이다.
      if (toYear == object.fromYear && toMonth < object.fromMonth) continue;
      object.toYear = toYear;
      object.toMonth = toMonth;
      visited_query[fromIndex] = 1;
      return information_nomalize(information_keys, object_keys, object);
    }
    return information_nomalize(information_keys, object_keys, object);
  }
  list = ['-'];
  list_indexes = find_string_with_list_for_index(list);

  for (let index in list_indexes['-']) {
    // 시작 년
    let fromBarIndex = list_indexes['-'][index];
    object.fromYear = object.toYear = front_number(fromBarIndex);
    // 1980 <= 시작 년 <= 2100
    if (object.fromYear < YEAR_MIN || object.fromYear > YEAR_MAX) continue;

    // 시작 월
    object.fromMonth = object.toMonth = back_number(fromBarIndex);
    // 1 <= 시작 월 <= 12
    if (object.fromMonth < MONTH_MIN || object.fromMonth > MONTH_MAX) continue;

    // 부터
    let fromIndex = find_string_one_index('부터', {
      start: fromBarIndex + 1,
      end: query.length - 2
    }, reg);
    if (fromIndex != NOT_FOUND) {
      // 부터 -> 종료 년
      let toBarIndex = find_string_one_index('-', {
        start: fromIndex + 2,
        end: query.length - 1
      }, reg);
      // ERROR : 부터 -> 종료 년을 찾지 못함
      if (toBarIndex == NOT_FOUND) continue;
      let toYear = front_number(toBarIndex);
      if (toYear < YEAR_MIN || toYear > YEAR_MAX) continue;

      // 부터 -> 종료 월
      // ERROR : 부터 -> 종료 년을 찾지 못함
      let toMonth = back_number(toBarIndex);
      if (toMonth < MONTH_MIN || toMonth > MONTH_MAX) continue;
      if (toYear == object.fromYear && toMonth < object.fromMonth) continue;
      visited_query[fromBarIndex] = 1;
      visited_query[toBarIndex] = 1;
      visited_query[fromIndex] = 1;
      object.toYear = toYear;
      object.toMonth = toMonth;
      return information_nomalize(information_keys, object_keys, object);
    }

    fromIndex = find_string_one_index('~', {
      start: fromBarIndex + 1,
      end: query.length - 2
    }, reg);
    if (fromIndex != NOT_FOUND) {
      // ~ -> 종료 년
      let toBarIndex = find_string_one_index('-', {
        start: fromIndex + 2,
        end: query.length - 1
      }, reg);
      // ERROR : ~ -> 종료 년을 찾지 못함
      if (toBarIndex == NOT_FOUND) continue;
      let toYear = front_number(toBarIndex);
      if (toYear < YEAR_MIN || toYear > YEAR_MAX) continue;

      // ~ -> 종료 월
      // ERROR : ~ -> 종료 년을 찾지 못함
      let toMonth = back_number(toBarIndex);
      if (toMonth < 1 || toMonth > 12) continue;
      if (toYear == object.fromYear && toMonth < object.fromMonth) continue;
      visited_query[fromBarIndex] = 1;
      visited_query[toBarIndex] = 1;
      visited_query[fromIndex] = 1;
      object.toYear = toYear;
      object.toMonth = toMonth;
      return information_nomalize(information_keys, object_keys, object);
    }

    visited_query[fromBarIndex] = 1;
    return information_nomalize(information_keys, object_keys, object);
  }
  return information_nomalize(information_keys, object_keys, object);
}

// 구분
function unpaid_gubun() {
  let list = ['관리비'];
  let ret = find_string_with_list(list);
  // 임시 하드코딩
  information_nomalize('관리비', '관리비');
}

// 납기구분
function unpaid_delivery_gubun() {
  let list = ['납기후', '납기내'];
  let ret = find_string_with_list(list);
  information_nomalize('납기구분', ret);
}

// 동
function unpaid_inquire_dong_one() {
  let list = ['동'];
  let list_indexes = find_string_with_list_for_index(list);
  for (let listname in list_indexes)
    for (let index in list_indexes[listname]) {
      let ret = front_number(list_indexes[listname][index]);
      // 동의 수 범위 제한
      if (DONG_MIN <= parseInt(ret) && parseInt(ret) <= DONG_MAX) {
        return information_nomalize('동', ret);
      }
    }
  return information_nomalize('동', ret);
}

// 동_호
function unpaid_dong_room() {
  let information_keys = ['동', '호'];
  let object_keys = ['dong', 'room'];
  let object = {};
  object_initialize(object, object_keys);
  // case 1 : XX동 XX호
  let list = ['동'];
  let list_indexes = find_string_with_list_for_index(list);
  for (let listname in list_indexes)
    for (let index in list_indexes[listname]) {
      let ret = front_number(list_indexes[listname][index]);
      // 동의 수 범위 제한
      if (DONG_MIN <= parseInt(ret) && parseInt(ret) <= DONG_MAX) {
        object.dong = ret;
        break;
      }
    }

  list = ['호'];
  list_indexes = find_string_with_list_for_index(list);
  for (let listname in list_indexes)
    for (let index in list_indexes[listname]) {
      let ret = front_number(list_indexes[listname][index]);
      // 호의 수 범위 제한
      if (ROOM_MIN <= parseInt(ret) && parseInt(ret) <= ROOM_MAX) {
        object.room = ret;
        break;
      }
    }

  if (object.dong && object.room) {
    return information_nomalize(information_keys, object_keys, object);
  }

  // case 2 : dong - room
  list = ['-'];
  list_indexes = find_string_with_list_for_index(list);
  for (let listname in list_indexes)
    for (let index in list_indexes[listname]) {
      if (visited_query[list_indexes[listname][index]]) continue;
      let ret = front_number(list_indexes[listname][index]);
      // 동의 수 범위 제한
      if (DONG_MIN <= parseInt(ret) && parseInt(ret) <= DONG_MAX) {
        object.dong = ret;
      } else continue;

      ret = back_number(list_indexes[listname][i]);
      // 호의 수 범위 제한
      if (ROOM_MIN <= parseInt(ret) && parseInt(ret) <= ROOM_MAX) {
        object.room = ret;
      } else continue;
      return information_nomalize(information_keys, object_keys, object);
    }
  return information_nomalize(information_keys, object_keys, object);
}

// 미납개월
function unpaid_unpaid_month() {
  let information_keys = ['미납개월_시작', '미납개월_종료'];
  let object_keys = ['fromMonth', 'toMonth'];
  let object = {};
  object_initialize(object, object_keys);

  let list = ['~', '부터'];
  let list_indexes = find_string_with_list_for_index(list);
  // case 1 : XX~XX
  // case 2 : XX개월~XX개월
  // case 3 : XX개월부터 XX개월
  // case 4 : XX부터 XX까지

  for (let listName in list_indexes)
    for (let index in list_indexes[listName]) {
      let fromIndex = list_indexes[listName][index];
      if (visited_query[fromIndex]) continue;
      if (listName == '~') {
        // 시작 동
        let fromMonth = fromIndex;
        object.fromMonth = front_number(fromMonth, /개|월/);
        // 종료 동
        let toMonth = fromIndex;
        object.toMonth = back_number(toMonth);
        if (object.toMonth && object.fromMonth)
          return information_nomalize(information_keys, object_keys, object);
      } else if (listName == '부터') {
        // 시작 년
        let fromMonth = fromIndex;
        object.fromMonth = front_number(fromMonth, /개|월/);
        // 1980 <= 시작 년 <= 2100
        let toMonth = fromIndex + 1;
        object.toMonth = back_number(toMonth);
        if (object.toMonth && object.fromMonth)
          return information_nomalize(information_keys, object_keys, object);
      }
    }
  return information_nomalize(information_keys, object_keys, object);
}

// 입주구분
function unpaid_move_in_gubun() {
  let list = ['입주', '이사', '분리', '공가', '본사'];
  let ret = find_string_with_list(list);
  information_nomalize('입주구분', ret);
}

// 전체_관리비
function unpaid_all_or_management() {
  let list = ['관리비'];
  let ret = find_string_with_list(list);
  information_nomalize('전체_관리비', ret);
}

// 정렬
function unpaid_sort() {
  let list = ['수직', '수평', '지그재그', '역지그재그', '사용자정의'];
  let value = ['S1:수직입력', 'S2:수평입력', 'S3:지그재그', 'S4:역지그재그', 'S5:사용자정의'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('정렬', value[i]);

  return information_nomalize('정렬', ret);
}

// 조건
function unpaid_condition() {
  let list = ['월별1', '월별2', '월별3', '월별4', '집계', '상호', '누계', '80c', '상호2'];
  let value = ['세대월별1', '세대월별2', '세대월별3', '세대월별4', '세대집계', '세대집계(상호)', '세대누계', '세대월별(80c)', '세대집계(상호)II'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('조건', value[i]);

  return information_nomalize('조건', ret);
}

// 조회동
function unpaid_inquire_dong() {
  let information_keys = ['조회동_시작', '조회동_종료'];
  let object_keys = ['inquire_fromDong', 'inquire_toDong'];
  let object = {};
  object_initialize(object, object_keys);

  let list = ['~', '부터', '에서'];
  let list_indexes = find_string_with_list_for_index(list);
  // case 1 : XX~XX
  // case 2 : XX동~XX동
  // case 3 : XX동부터 XX동
  // case 4 : XX부터 XX까지
  for (let listName in list_indexes)
    for (let index in list_indexes[listName]) {
      let fromIndex = list_indexes[listName][index];
      if (visited_query[fromIndex]) continue;
      if (listName == '~') {
        let fromDong = front_number(fromIndex, /동/);
        let toDong = back_number(fromIndex, / /);
        console.log('조회동', fromDong, toDong);
        // 종료동이 시작동보다 빠를 경우
        if (fromDong > toDong) continue;
        if (fromDong && toDong) {
          object.inquire_fromDong = fromDong;
          object.inquire_toDong = toDong;
          return information_nomalize(information_keys, object_keys, object);
        }
      } else if (listName == '부터') {
        let fromDong = front_number(fromIndex, /동/);
        let toDong = back_number(fromIndex + 1, / /);
        // 종료동이 시작동보다 빠를 경우
        if (fromDong > toDong) continue;
        if (fromDong && toDong) {
          object.inquire_fromDong = fromDong;
          object.inquire_toDong = toDong;
          return information_nomalize(information_keys, object_keys, object);
        }
      }
    }
  return unpaid_inquire_dong_one();
}

// 조회조건
function unpaid_inquire_condition() {
  let list = ['세대별', '동별'];
  let value = ['[세대별]', '[동별]'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('조회조건', value[i]);

  return information_nomalize('조회조건', ret);
}

// 출력조건
function unpaid_print_condition() {
  let list = ['동별', '개월수별'];
  let value = ['동별', '개월수별'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('출력조건', value[i]);

  return information_nomalize('출력조건', ret);
}
