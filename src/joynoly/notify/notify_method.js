/* jshint esversion: 8 */
var inquire_notify_functions = {
  '고지항목': notify_notify_list,
  '구분': notify_gubun,
  '년': notify_year,
  '단가생성': notify_unit_price_create,
  '동': notify_dong,
  '동별인쇄': notify_each_dong_print,
  //   '마감일' : ,
  //   '발행일' : ,
  '부과구분': notify_impose_gubun,
  '부과년월': notify_impose_year_month,
  '부과세대': notify_impose_sedae,
  '부과세대만인쇄': notify_impose_sedae_print,
  '부과여부': notify_impose_possible,
  '상가제외': notify_except_shoppingmall,
  '양식': notify_form,
  '월': notify_month,
  //   '인쇄년월' : ,
  '인쇄양식': notify_print_form,
  '입주구분': notify_move_in_gubun,
  //   '전체관리' : ,
  '정렬': notify_sort,
  '정방향_역방향': notify_forward_reverse,
  '조회구분': notify_inquire_gubun,
  '조회기간': notify_inquire_year_month,
  '조회동': notify_inquire_dong,
  '조회방식': notify_inquire_method,
  '차량대수': notify_car_num,
  '호': notify_room
};

// 고지항목
function notify_notify_list() {
  let list = ['전체', '승강기전기료', '공동전기료', '산업용전기료', '가로등전기료', '공동수도료', '일반관리비', '청소용역비', '장기수선충당금', '생활폐기물수수', '승강기유지비', '수선유지비', '화재보험료', '수선충당금', '난방기본료', '난방공동료', '방청제', '위탁관리수수료', '소독비', '공청유지보수료', '공인회계감사비', '경비용역비', '통신용역비', '가수금', '온수료'];
  let value = ['전체', '승강기전기료', '공동전기료', '산업용전기료', '가로등전기료', '공동수도료', '일반관리비', '청소용역비', '장기수선충당금', '생활폐기물수수', '승강기유지비', '수선유지비', '화재보험료', '수선충당금', '난방기본료', '난방공동료', '방청제', '위탁관리수수료', '소독비', '공청유지보수료', '공인회계감사비', '경비용역비', '통신용역비', '가수금', '온수료'];
  let ret = find_string_with_list(list, NEED_BLANK_SIDE);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('고지항목', value[i]);

  return information_nomalize('고지항목', ret);
}

// 구분
function notify_gubun() {
  let list = ['관리비'];
  let ret = find_string_with_list(list);
  // 임시 하드코딩
  information_nomalize('관리비', '관리비');
}

// 년
function notify_year() {
  let list = ['년'];
  let list_indexes = find_string_with_list_for_index(list);
  for (let listname in list_indexes)
    for (let index in list_indexes[listname]) {
      let ret = front_number(list_indexes[listname][index]);
      // 동의 수 범위 제한
      if (DONG_MIN <= parseInt(ret) && parseInt(ret) <= DONG_MAX) {
        return information_nomalize('년', ret);
      }
    }
  return information_nomalize('년', null);
}

// 단가생성
function notify_unit_price_create() {
  let list = ['단가생성', '자료생성'];
  let value = ['단가생성', '자료생성'];
  let ret = find_string_with_list(list, NEED_BLANK_SIDE);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('단가생성', value[i]);

  return information_nomalize('단가생성', ret);
}

// 동
function notify_dong() {
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
  return information_nomalize('동', null);
}

// 동별인쇄
function notify_each_dong_print() {
  let list = ['동별인쇄'];
  let ret = find_string_with_list(list);
  return information_nomalize('동별인쇄', ret != null);
}

// 마감일
// 발행일

// 부과구분
function notify_impose_gubun() {
  let list = ['평당', '세대당'];
  let value = ['평당', '세대당'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('부과구분', value[i]);

  return information_nomalize('부과구분', ret);
}

// 정방향_역방향
function notify_forward_reverse() {
  let list = ['정방향', '역방향'];
  let value = ['정방향', '역방향'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('정방향_역방향', value[i]);

  return information_nomalize('정방향_역방향', ret);
}

// 부과년월
function notify_impose_year_month() {
  // case 1 : YY년 MM월
  // case 2 : YY-MM
  let information_keys = ['부과_년', '부과_월'];
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

// 부과세대
function notify_impose_sedae() {
  let list = ['부과', '제외', '예외', '전체'];
  let value = ['부과세대', '제외세대', '예외세대', '전체세대'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('부과세대', value[i]);

  return information_nomalize('부과세대', ret);
}

// 부과세대만인쇄
function notify_impose_sedae_print() {
  let list = ['부과세대'];
  let ret = find_string_with_list(list);
  return information_nomalize('부과세대만인쇄', ret != null);
}

// 부과여부
function notify_impose_possible() {
  let list = ['부과세대', '미부과세대'];
  let value = ['부과세대', '미부과세대'];
  let ret = find_string_with_list(list, NEED_BLANK_SIDE);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('부과여부', value[i]);

  return information_nomalize('부과여부', '전체');
}

// 상가제외
function notify_except_shoppingmall() {
  let list = ['상가제외'];
  let ret = find_string_with_list(list);
  return information_nomalize('상가제외', ret != null);
}

// 양식
function notify_form() {
  let list = ['양식1', '양식2', '양식3', '양식4', '비양식1', '비양식2', '비양식3', '비양식4'];
  let value = ['양식1', '양식2', '양식3', '양식4', '비양식1', '비양식2', '비양식3', '비양식4'];
  let ret = find_string_with_list(list, NEED_BLANK_SIDE);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('양식', value[i]);

  return information_nomalize('양식', ret);
}

//   월
function notify_month() {
  let list = ['월'];
  let list_indexes = find_string_with_list_for_index(list);
  for (let listname in list_indexes)
    for (let index in list_indexes[listname]) {
      let ret = front_number(list_indexes[listname][index]);
      // 동의 수 범위 제한
      if (DONG_MIN <= parseInt(ret) && parseInt(ret) <= DONG_MAX) {
        return information_nomalize('월', ret);
      }
    }
  return information_nomalize('월', null);
}

//  인쇄년월

// 인쇄양식
function notify_print_form() {
  let list = ['일반', '가스', 'A4', '가로', '세로'];
  let value = ['일반', '가스', '일반(A4)', '임대(가로)', '임대(세로)'];
  let ret = find_string_with_list(list, NEED_BLANK_SIDE);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('인쇄양식', value[i]);

  return information_nomalize('인쇄양식', ret);
}

// 입주구분
function notify_move_in_gubun() {
  let list = ['입주', '이사', '분리', '공가', '본사'];
  let ret = find_string_with_list(list);
  information_nomalize('입주구분', ret);
}

// 전체관리

// 정렬
function notify_sort() {
  let list = ['수직', '수평', '지그재그', '역지그재그', '사용자정의'];
  let value = ['수직입력', '수평입력', '지그재그', '역지그재그', '사용자정의'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('정렬', value[i]);

  return information_nomalize('정렬', ret);
}

// 정방향_역방향
function notify_forward_reverse() {
  let list = ['정방향', '역방향'];
  let value = ['정방향', '역방향'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('정방향_역방향', value[i]);

  return information_nomalize('정방향_역방향', ret);
}

// 조회구분
function notify_inquire_gubun() {
  let list = ['기초정보', '월별주차비'];
  let value = ['기초정보', '월별주차비'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('조회구분', value[i]);

  return information_nomalize('조회구분', ret);
}

// 조회기간
function notify_inquire_year_month() {
  // case 1 : YY년 MM월
  // case 2 : YY-MM
  // case 3 : YY년 MM월부터 YY년 MM월 예) 2010년04월부터 2020년 3월까지
  // case 4 : YY년 MM월 ~ YY년 MM월 예) 2011년3월~7월
  // case 5 : YY-MM 부터 YY-MM 예) 2005-03 부터 2005-07
  // case 6 : YY-MM ~ YY-MM 예) 2005-03~2005-07
  let information_keys = ['조회년_시작', '조회년_종료', '조회월_시작', '조회월_종료'];
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

// 조회동
function notify_inquire_dong() {
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
  return information_nomalize(information_keys, object_keys, object);
}

// 조회방식
function notify_inquire_method() {
  let list = ['동별', '세대별', '대수별'];
  let value = ['동별현황', '세대별현황', '대수별현황'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return information_nomalize('계절', value[i]);

  return information_nomalize('계절', ret);
}

// 차량대수
function notify_car_num() {
  let list = ['차량'];
  let listIndexes = find_string_with_list_for_index(list);
  for (let listname in listIndexes)
    for (let index in listIndexes[listname]) {
      let ret = back_number(listIndexes[listname][index], / /);
      // 사용량의 수 범위 제한
      if (USE_MIN <= parseInt(ret) && parseInt(ret) <= USE_MAX)
        return information_nomalize('차량대수', ret);
    }
  return information_nomalize('차량대수', null);
}

// 호
function notify_room() {
  let list = ['호'];
  let list_indexes = find_string_with_list_for_index(list);
  for (let listname in list_indexes)
    for (let index in list_indexes[listname]) {
      let ret = front_number(list_indexes[listname][index]);
      // 동의 수 범위 제한
      if (DONG_MIN <= parseInt(ret) && parseInt(ret) <= DONG_MAX) {
        return information_nomalize('호', ret);
      }
    }
  return information_nomalize('호', null);
}
