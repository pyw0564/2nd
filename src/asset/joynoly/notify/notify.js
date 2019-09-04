/* jshint esversion: 6 */

/* 고지내역조회 */
var inquire_notify = {
  // 0 : 고지서
  // 구분, 부과년월, 동, 호, 양식, 인쇄년월, 마감일, 발행일, 동별인쇄
  '0': function(s) {
    inquire_notify_functions['구분']();
    inquire_notify_functions['부과년월']();
    inquire_notify_functions['동']();
    inquire_notify_functions['호']();
    inquire_notify_functions['양식']();
    // inquire_notify_functions['인쇄년월']();
    // inquire_notify_functions['마감일']();
    // inquire_notify_functions['발행일']();
    inquire_notify_functions['동별인쇄']();

  },
  // 1 : 세대조정집계표
  // 구분, 부과년월, 동, 입주구분, 정방향, 인쇄양식, 인쇄년월, 정렬방법, 부과세대만인쇄
  '1': function(s) {
    inquire_notify_functions['구분']();
    inquire_notify_functions['부과년월']();
    inquire_notify_functions['동']();
    inquire_notify_functions['입주구분']();
    inquire_notify_functions['정방향_역방향']();
    inquire_notify_functions['인쇄양식']();
    // inquire_notify_functions['인쇄년월']();
    inquire_notify_functions['정렬']();
    inquire_notify_functions['부과세대만인쇄']();

  },
  // 2. 동별전체조정집계표
  // 구분, 부과년월, 입주구분, 인쇄양식, 인쇄년월, 조회동, 상가제외
  '2': function(s) {
    inquire_notify_functions['구분']();
    inquire_notify_functions['부과년월']();
    inquire_notify_functions['입주구분']();
    inquire_notify_functions['인쇄양식']();
    // inquire_notify_functions['인쇄년월']();
    inquire_notify_functions['조회동']();
    inquire_notify_functions['상가제외']();
  },
  // 3. 부과내역서
  // 부과년월, 고지항목, 부과구분
  '3': function(s) {
    inquire_notify_functions['부과년월']();
    inquire_notify_functions['고지항목']();
    inquire_notify_functions['부과구분']();
  },
  // 4. 고지항목별예외세대
  // 년, 월, 고지항목, 부과세대, 정렬, 정방향, 단가생성
  '4': function(s) {
    inquire_notify_functions['년']();
    inquire_notify_functions['월']();
    inquire_notify_functions['고지항목']();
    inquire_notify_functions['정렬']();
    inquire_notify_functions['정방향_역방향']();
    inquire_notify_functions['단가생성']();
  },
  // 5. 주차요금현황
  // 조회구분, 동, 부과여부, 정렬, 부과년월, 조회방식, 차량대수, 정방향
  '5': function(s) {
    inquire_notify_functions['조회구분']();
    inquire_notify_functions['동']();
    inquire_notify_functions['부과여부']();
    inquire_notify_functions['정렬']();
    inquire_notify_functions['부과년월']();
    inquire_notify_functions['조회방식']();
    inquire_notify_functions['차량대수']();
    inquire_notify_functions['정방향_역방향']();
  },
  // 6. 년간고지현황(단지별, 동별, 호별)
  // 고지항목, 조회기간, 동, 호, 입주구분
  '6': function(s) {
    inquire_notify_functions['고지항목']();
    inquire_notify_functions['조회기간']();
    inquire_notify_functions['동']();
    inquire_notify_functions['호']();
    inquire_notify_functions['입주구분']();
  },
  // 7. 가수금현황
  // 부과년월 ,정렬방법, 정방향
  '7': function(s) {
      inquire_notify_functions['부과년월']();
      inquire_notify_functions['정렬']();
      inquire_notify_functions['정방향_역방향']();
  }
};
