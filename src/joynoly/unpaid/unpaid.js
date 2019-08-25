/* jshint esversion: 6 */

var inquire_unpaid = {
  // 0 : 동별미납내역
  '0': function(s) {
    inquire_unpaid_functions['구분']();
    inquire_unpaid_functions['조회동']();
    inquire_unpaid_functions['입주구분']();
    inquire_unpaid_functions['납기구분']();
    inquire_unpaid_functions['출력조건']();
  },
  // 1 : 고지항목별미납내역
  '1': function(s) {

  },
  // 2.장기미납및독촉장
  '2': function(s) {

  },
  // 3.시점별미납내역
  '3': function(s) {
    inquire_unpaid_functions['기준년월']();
    inquire_unpaid_functions['미납개월']();
    inquire_unpaid_functions['조회동']();
    inquire_unpaid_functions['전체_관리비']();
    inquire_unpaid_functions['입주구분']();
    inquire_unpaid_functions['납기구분']();
    inquire_unpaid_functions['조회조건']();
    inquire_unpaid_functions['정렬']();
  },
  // 4.시점별미납및입금내역
  '4': function(s) {},
  // 5.월분미납내역
  '5': function(s) {
    inquire_unpaid_functions['고지년월']();
    inquire_unpaid_functions['입주구분']();
    inquire_unpaid_functions['납기구분']();
    inquire_unpaid_functions['조회동']();
    inquire_unpaid_functions['정렬']();
  },
  // 6. 세대별미납내역
  '6': function(s) {
    inquire_unpaid_functions['구분']();
    inquire_unpaid_functions['고지년월']();
    inquire_unpaid_functions['조회동']();
    inquire_unpaid_functions['동_호']();
    inquire_unpaid_functions['정렬']();
    inquire_unpaid_functions['입주구분']();
    inquire_unpaid_functions['납기구분']();
    inquire_unpaid_functions['조건']();
  }
};
