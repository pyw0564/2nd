/* jshint esversion: 6 */

var inquire_inspect = {
  // 0. 조견표조회
  '0': function(s) {
    // 검침종류, 계산방식, 계산방식_동, 기타계절, 대가족/3자녀, 사용량 시작, 사용량 종료, 세대 수,
    // 세대구분 세대/상가, 소수점, 자동이체할인, 적용시작일_년, 적용시작일_월, 전기료감면, 필수사용량보장공제, 한전계약종별
    inquire_inspect_functions['사용량']();
    inquire_inspect_functions['적용시작일']();
    inquire_inspect_functions['검침종류']();
    inquire_inspect_functions['계산방식']();
    inquire_inspect_functions['계산방식_동']();
    inquire_inspect_functions['기타계절']();
    inquire_inspect_functions['대가족_3자녀']();
    inquire_inspect_functions['자동이체할인']();
    inquire_inspect_functions['세대_수']();
    inquire_inspect_functions['세대_상가']();
    inquire_inspect_functions['소수점']();
    inquire_inspect_functions['전기료감면']();
    inquire_inspect_functions['필수사용량보장공제']();
    inquire_inspect_functions['한전계약종별']();
  },
  // 1 : 사용량리스트
  '1': function(s) {
    // 검침시작년도, 검침 시작월, 세대_상가, 검침종류, 동시작, 동 종료, 입주구분, 입주구분_전체_일수,
    // 전체형, 정렬, 정방향, 조회방법
    inquire_inspect_functions['검침년월_시작']();
    inquire_inspect_functions['동_시작종료']();
    inquire_inspect_functions['세대_상가']();
    inquire_inspect_functions['검침종류']();
    inquire_inspect_functions['입주구분']();
    inquire_inspect_functions['입주구분_전체_일수']();
    inquire_inspect_functions['전체형']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['조회방법']();
    inquire_inspect_functions['정방향']();
  },
  // 2 : 사용량단계별
  '2': function(s) {
    // 검침시작년도, 검침 시작월, 검침종류
    // 전체형, 정렬, 정방향, 조회방법, 사용량시작, 사용량종료, 입주구분
    inquire_inspect_functions['검침년월_시작']();
    inquire_inspect_functions['사용량']();
    inquire_inspect_functions['전체형']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['조회방법']();
    inquire_inspect_functions['정방향']();
    inquire_inspect_functions['검침종류']();
    inquire_inspect_functions['입주구분']();
  },
  // 3 : 검침카드조회
  '3': function(s) {
    inquire_inspect_functions['검침년월']();
    inquire_inspect_functions['동_시작종료']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['조회방법']();
    inquire_inspect_functions['정방향']();
    inquire_inspect_functions['검침종류']();
    inquire_inspect_functions['입주구분']();
    inquire_inspect_functions['호']();
  },
  // 4 : TV수신료제외세대
  '4': function(s) {
    inquire_inspect_functions['검침년월_시작']();
    inquire_inspect_functions['동_시작종료']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['조회방법']();
    inquire_inspect_functions['정방향']();
    inquire_inspect_functions['검침종류']();
    inquire_inspect_functions['입주구분']();
    inquire_inspect_functions['호']();
  },
  // 5 : 1주택2가구세대
  '5': function(s) {
    inquire_inspect_functions['검침년월_시작']();
    inquire_inspect_functions['동_시작종료']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['조회방법']();
    inquire_inspect_functions['정방향']();
    inquire_inspect_functions['입주구분']();
  },
  // 6 : 수도감면세대
  '6': function(s) {
    inquire_inspect_functions['검침년월_시작']();
    inquire_inspect_functions['동_시작종료']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['정방향']();
    inquire_inspect_functions['입주구분']();
    inquire_inspect_functions['감면구분']();
  },
  // 7 : 전기감면세대
  '7': function(s) {
    inquire_inspect_functions['검침년월_시작']();
    inquire_inspect_functions['동_시작종료']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['정방향']();
    inquire_inspect_functions['입주구분']();
    inquire_inspect_functions['감면구분']();
  },
  // 8 : 대가족 할인 세대
  '8': function(s) {
    inquire_inspect_functions['검침년월_시작']();
    inquire_inspect_functions['동_시작종료']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['정방향']();
    inquire_inspect_functions['입주구분']();
    inquire_inspect_functions['301kw_이상만_출력']();
    inquire_inspect_functions['대가족_3자녀']();
    inquire_inspect_functions['공용사용량']();
    inquire_inspect_functions['감면구분']();
  },
  // 10. 오차범위 최대값
  '9': function(s) {
    inquire_inspect_functions['검침년월_시작']();
    inquire_inspect_functions['동_시작종료']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['정방향']();
    inquire_inspect_functions['입주구분']();
    inquire_inspect_functions['검침종류']();
    inquire_inspect_functions['조회구분']();
    inquire_inspect_functions['조회값']();
  },
  // 11. 년간검침현황
  '10': function(s) {
    inquire_inspect_functions['검침시작년도']();
    inquire_inspect_functions['동_시작종료']();
    inquire_inspect_functions['검침종류']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['정방향']();
    inquire_inspect_functions['항목_사용량_당월지침']();
  },
  // 12. 상가수도조견별
  '11': function(s) {
    inquire_inspect_functions['검침시작년도']();
    inquire_inspect_functions['동_시작종료']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['정방향']();
    inquire_inspect_functions['입주구분']();
    inquire_inspect_functions['조견종류']();
  },
  // 13. 주택용저압고압
  '12': function(s) {
    inquire_inspect_functions['검침시작년도']();
    inquire_inspect_functions['동_시작종료']();
    inquire_inspect_functions['검침종류']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['정방향']();
    inquire_inspect_functions['입주구분']();
    inquire_inspect_functions['필수사용량보장공제']();
    inquire_inspect_functions['자동이체할인']();
  },
  // 필수사용량보장공제
  '13': function(s) {
    inquire_inspect_functions['검침시작년도']();
    inquire_inspect_functions['동_시작종료']();
    inquire_inspect_functions['검침종류']();
    inquire_inspect_functions['정렬']();
    inquire_inspect_functions['정방향']();
    inquire_inspect_functions['입주구분']();
  }
};
