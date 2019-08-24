/* jshint esversion: 8 */

// 검침 종류
function inspect_type() {
  let list = ['전기', '전기2', '전기-수도', '수도', '수도2', '수도-온수', '수도-정수', '온수',
    '정수', '난방', '난방기본', '가스', '기타1', '기타2', '기타3', '기타4', '기타5', '유형1', 'ALL'
  ];
  let value = ['전기', '전기2', '전기-수도', '수도', '수도2', '수도-온수', '수도-정수', '온수',
    '정수', '난방', '난방기본', '가스', '기타1', '기타2', '기타3', '기타4', '기타5', '유형1', 'ALL'
  ];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 세대 구분 household, shopping mall
function inspect_HSgubun() {
  let list = ['세대', '상가'];
  let value = ['세대', '상가'];
  let ret = find_string_with_list(list, NEED_BLANK_SIDE);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 계산방식
function inspect_calculation_method() {
  let list = ['사용금액', '누진금액', '동별금액'];
  let value = ['사용금액', '누진금액', '동별금액'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// _301kw_이상만_출력
function inspect_over_301kw() {
  let list = ['301kw'];
  return find_string_with_list(list) !== null;
}

// 계산방식_동
function inspect_calculation_method_dong() {
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

// 계절
function inspect_season() {
  let list = ['기타계절', '여름철'];
  let value = ['기타계절', '여름철'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 대가족_3자녀
function inspect_long_family() {
  let list = ['N', 'Y', 'T', 'L', 'B', '전체', '대가족', '3자녀', '생명유지', '출산기구'];
  let value = ['N', 'Y', 'T', 'L', 'B', '전체', '대가족', '3자녀', '생명유지', '출산기구'];
  let ret = find_string_with_list(list, NEED_BLANK_SIDE);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 사용량
function inspect_usage() {
  let object = {};
  let list = ['~', '부터'];
  let listIndexes = find_string_with_list_for_index(list);
  // case 1 : XX~XX
  // case 2 : XX부터 XX까지
  for (let listName in listIndexes)
    for (let i in listIndexes[listName]) {
      let fromIndex = listIndexes[listName][i];
      if (visited_query[fromIndex]) continue;
      if (listName == '~') {
        // 시작 사용량
        let fromDong = fromIndex;
        object.inspect_fromUsage = nomalize(front_number(fromDong));
        // 종료 사용량
        let toDong = fromIndex;
        object.inspect_toUsage = nomalize(back_number(toDong, / /));
        if (object.inspect_toUsage && object.inspect_fromUsage) return object;
        console.log(object);
      } else if (listName == '부터') {
        // 시작 사용량
        let fromDong = fromIndex;
        object.inspect_fromUsage = nomalize(front_number(fromDong));
        let toDong = fromIndex + 1;
        object.inspect_toUsage = nomalize(back_number(toDong, / /));
        if (object.inspect_toUsage && object.inspect_fromUsage) return object;
      }
    }
  return null;
}

// 세대_수
function inspect_sede_num() {
  let list = ['세대수'];
  let listIndexes = find_string_with_list_for_index(list);
  for (let listname in listIndexes)
    for (let i in listIndexes[listname]) {
      let ret = nomalize(back_number(listIndexes[listname][i] + 2, / /));
      if (1 <= parseInt(ret) && parseInt(ret) <= 9999) return ret;
    }
  return null;
}

// 소수점
function inspect_decimal_point() {
  let list = ['소수점'];
  return find_string_with_list(list) !== null;
}

// 자동이체할인
function inspect_autotransfer_discount() {
  let list = ['할인'];
  let value = ['Y'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 적용시작일_년, 검침_시작년도, 검침_시작월
function inspect_year_month() {
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

// 전기료감면
function inspect_electricity_charges_discount() {
  let list = ['전기료감면'];
  let value = ['B', 'S', 'H', 'Y', 'C', 'N'];
  let listIndexes = find_string_with_list_for_index(list);

  for (let listName in listIndexes)
    for (let i in listIndexes[listName]) {
      let fromIndex = listIndexes[listName][i];
      for (let j = 0; j < value.length; j++){
        if (find_string_one_index(value[j], {
            start: fromIndex + 1,
            end: query.length - 1
          }, / /) != -1) return value[j];
        }
    }
  return null;
}

// 필수사용량보장공제
function inspect_usage_guarantee_deduction() {
  let list = ['공제사용안함', '공제사용'];
  let value = ['Y', 'N'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 한전계약종별
function insepct_contract() {
  let list = ['저압', '고압'];
  let value = ['주택용(저압)', '주택용(고압)'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 동 ~ 동
function inspect_dong() {
  let object = {};
  let list = ['~', '부터'];
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
function inspect_move_in_gubun() {
  let list = ['입주', '이사', '분리', '공가', '본사'];
  let value = ['입주', '이사', '분리', '공가', '본사'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 입주구분_전체_일수
function inspect_movie_in_gubun_option() {
  let list = ['일수', '전체'];
  let value = ['일수', '전체'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 전체형_단축형
function inspect_entire_to_shorten() {
  let list = ['전체형', '단축형'];
  let value = ['전체형', '단축형'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 정렬
function inspect_sort() {
  let list = ['수직입력', '수평입력', '지그재그', '역지그재그', '사용자정의'];
  let value = ['수직입력', '수평입력', '지그재그', '역지그재그', '사용자정의'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 조회방법
function inspect_inquire_method() {
  let list = ['세대별', '동별', '동별2', '80', '라인별', '미터별평균', '미터별2', '입력누락'];
  let value = ['세대별', '동별', '동별2', '세대별(80)', '라인별', '평방미터별평균', '평발미터별2', '입력누락동체크'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 정방향_역방향
function inspect_forward_reverse() {
  let list = ['정방향', '역방향'];
  let value = ['정방향', '역방향'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 감면구분
function inspect_reduction() {
  //  [Y:상,하수도] [부산지역- S:상수도] [양산- H:상,하수도 50%] [경주지역- J:전입세대,W:전입세대,상,하수도]
  //         [T:감면금액2] [P:중복감면(Y + T)] [D:감면금액2 두배(T x 2)]
  //  [B:사회복지시설] [S:생계·의료급여 수급자] [H:주거·교육급여 수급자]
  //          [Y:독립유공자,국가유공자,5.18유공자,장애인] [C:차상위계층]
  let list = ['B', 'C', 'Y', 'S', 'H', 'T', 'P', 'D', 'J', 'W', 'D', 'E', 'F', '전체'];
  let value = ['B', 'C', 'Y', 'S', 'H', 'T', 'P', 'D', 'J', 'W', 'D', 'E', 'F', '전체'];
  let ret = find_string_with_list(list, NEED_BLANK_SIDE);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 조회구분
function inspect_inquire_gubun() {
  let list = ['오차범위최대', '사용량최대', '오차', '최대값2', '당월', '계량기', '사용량'];
  let value = ['오차범위최대값', '사용량최대값', '오차|사용량최대값', '오차|사용량최대값2', '당월-전월=사용량', '계량기고장세대', '사용량 -값'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 항목_사용량_당월지침
function inspect_item_option() {
  let list = ['사용량', '당월지침'];
  let value = ['사용량', '당월지침'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 조견종류
function inspect_look_kinds() {
  let list = ['톤당', '업무용', '영업용'];
  let value = ['톤당', '업무용', '영업용'];
  let ret = find_string_with_list(list);
  for (let i in list)
    if (ret == list[i])
      return value[i];
  return null;
}

// 년 1개
function inspect_year_one() {
  let list = ['년'];
  let listIndexes = find_string_with_list_for_index(list);
  for (let listname in listIndexes)
    for (let i in listIndexes[listname]) {
      let ret = nomalize(front_number(listIndexes[listname][i]));
      // 호의 수 범위 제한
      if (1 <= parseInt(ret) && parseInt(ret) <= 9999) return ret;
    }
  return null;
}


// 조회값
function inspect_inquire_value() {
  let list = ['조회값'];
  let listIndexes = find_string_with_list_for_index(list);
  for (let listname in listIndexes)
    for (let i in listIndexes[listname]) {
      let ret = nomalize(back_number(listIndexes[listname][i], / /));
      // 호의 수 범위 제한
      if (1 <= parseInt(ret) && parseInt(ret) <= 9999) return ret;
    }
  return null;
}

// 공용사용량
function inspect_public_use() {
  let list = ['공용사용량'];
  let listIndexes = find_string_with_list_for_index(list);
  for (let listname in listIndexes)
    for (let i in listIndexes[listname]) {
      let ret = nomalize(back_number(listIndexes[listname][i], / /));
      // 호의 수 범위 제한
      if (1 <= parseInt(ret) && parseInt(ret) <= 9999) return ret;
    }
  return null;
}
