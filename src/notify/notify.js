/* jshint esversion: 6 */

/* 고지내역조회 */
var inquire_notify = {
  // 0 : 고지서
  '0': function(s) {
    if (!flag) {
      information['관리비'] = null;
      information['양식'] = null;
      information['동'] = null;
      information['호'] = null;
      information['입주구분'] = null;
      // information['부과년월'] = null;
      // information['인쇄년월'] = null;
      // information['마감일'] = null;
      // information['발행일'] = null;
    }
    let ret;

    ret = notify_gubun();
    if (ret) information['관리비'] = ret;

    ret = notify_form();
    if (ret) information['양식'] = null;

    ret = notify_move_in_gubun();
    if (ret) information['입주구분'] = null;

    ret = notify_dong_room();
    if (ret) {
      information['동'] = null;
      information['호'] = null;
    }

  },
  // 1 : 세대조정집계표
  '1': function(s) {
    if (!flag) {
      information['관리비'] = null;
      information['동'] = null;
      information['입주구분'] = null;
      information['정방향'] = null;
      information['인쇄양식'] = null;
      information['정렬'] = null;
      information['부과세대만_인쇄'] = null;
      // information['부과년월'] = null;
      // information['인쇄년월'] = null;
    }
    let ret;

    ret = notify_gubun();
    if (ret) information['관리비'] = ret;

    ret = notify_inquire_dong_one();
    if(ret) information['동'] = null;

    ret = notify_move_in_gubun();
    if (ret) information['입주구분'] = null;

    ret = notify_forward_reverse();
    if (ret) information['정방향'] = null;

    ret = notify_print_form();
    if (ret) information['인쇄양식'] = null;

    ret = notify_sort();
    if (ret) information['정렬'] = null;

    ret = information['부과세대만_인쇄'] = null;


  },
  // 2. 동별전체조정집계표
  '2': function(s) {

  },
  // 3. 부과내역서
  '3': function(s) {
    if (!flag) {
      information['기준년'] = null;
      information['기준월'] = null;
      information['미납개월_시작'] = null;
      information['미납개월_종료'] = null;
      information['조회동'] = null;
      information['전체_관리비'] = null;
      information['입주구분'] = null;
      information['납기구분'] = null;
      information['정렬'] = null;
      information['조회조건'] = null;
    }
    let ret;

    ret = notify_goji_year_month();
    if (ret) {
      information['기준년'] = ret.fromYear;
      information['기준월'] = ret.fromMonth;
    }

    ret = notify_notify_month();
    if (ret) {
      information['미납개월_시작'] = ret.fromMonth;
      information['미납개월_종료'] = ret.toMonth;
    }

    ret = notify_inquire_dong_one();
    if (ret) information['조회동'] = ret;


    ret = notify_all_or_management();
    if (ret) information['전체_관리비'] = ret;


    ret = notify_move_in_gubun();
    if (ret) information['입주구분'] = ret;


    ret = notify_delivery_gubun();
    if (ret) information['납기구분'] = ret;

    ret = notify_sort();
    if (ret) information['정렬'] = ret;


    ret = notify_inquire_condition();
    if (ret) information['조회조건'] = ret;
  },
  // 4. 구지항목별예외세대
  '4': function(s) {},
  // 5. 주차요금현황
  '5': function(s) {
    if (!flag) {
      information['고지년_시작'] = null;
      information['고지년_종료'] = null;
      information['고지월_시작'] = null;
      information['고지월_종료'] = null;
      information['조회동_시작'] = null;
      information['조회동_종료'] = null;
      information['정렬'] = null;
      information['입주구분'] = null;
      information['납기구분'] = null;
    }
    let ret;
    ret = notify_goji_year_month();
    if (ret) {
      information['고지년_시작'] = ret.fromYear;
      information['고지년_종료'] = ret.toYear;
      information['고지월_시작'] = ret.fromMonth;
      information['고지월_종료'] = ret.toMonth;
    }

    ret = notify_move_in_gubun();
    if (ret) information['입주구분'] = ret;

    ret = notify_delivery_gubun();
    if (ret) information['납기구분'] = ret;

    ret = notify_inquire_dong();
    if (ret) {
      information['조회동_시작'] = ret.inquire_fromDong;
      information['조회동_종료'] = ret.inquire_toDong;
    } else {
      ret = notify_inquire_dong_one();
      if (ret) {
        information['조회동_시작'] = ret;
        information['조회동_종료'] = ret;
      }
    }

    ret = notify_sort();
    if (ret) information['정렬'] = ret;
  },
  // 6. 년간고지현황(단지별, 동별, 호별)
  '6': function(s) {
    if (!flag) {
      information['구분'] = null;
      information['고지년_시작'] = null;
      information['고지년_종료'] = null;
      information['고지월_시작'] = null;
      information['고지월_종료'] = null;
      information['조회동_시작'] = null;
      information['조회동_종료'] = null;
      information['동'] = null;
      information['호'] = null;
      information['정렬'] = null;
      information['입주구분'] = null;
      information['납기구분'] = null;
      information['조건'] = null;
    }
    let ret;

    ret = notify_gubun();
    if (ret) information['구분'] = ret;

    ret = notify_goji_year_month();
    if (ret) {
      information['고지년_시작'] = ret.fromYear;
      information['고지년_종료'] = ret.toYear;
      information['고지월_시작'] = ret.fromMonth;
      information['고지월_종료'] = ret.toMonth;
    }

    ret = notify_inquire_dong();
    if (ret) {
      information['조회동_시작'] = ret.inquire_fromDong;
      information['조회동_종료'] = ret.inquire_toDong;
    }

    ret = notify_dong_room();
    if (ret) {
      information['동'] = ret.dong;
      information['호'] = ret.room;
    }

    ret = notify_sort();
    if (ret) information['정렬'] = ret;

    ret = notify_move_in_gubun();
    if (ret) information['입주구분'] = ret;

    ret = notify_delivery_gubun();
    if (ret) information['납기구분'] = ret;

    ret = notify_condition();
    if (ret) information['조건'] = ret;

  },
  // 7. 가수금현황
  '7': function(s) {
    if (!flag) {
      information['구분'] = null;
      information['고지년_시작'] = null;
      information['고지년_종료'] = null;
      information['고지월_시작'] = null;
      information['고지월_종료'] = null;
      information['조회동_시작'] = null;
      information['조회동_종료'] = null;
      information['동'] = null;
      information['호'] = null;
      information['정렬'] = null;
      information['입주구분'] = null;
      information['납기구분'] = null;
      information['조건'] = null;
    }
    let ret;

    ret = notify_gubun();
    if (ret) information['구분'] = ret;

    ret = notify_goji_year_month();
    if (ret) {
      information['고지년_시작'] = ret.fromYear;
      information['고지년_종료'] = ret.toYear;
      information['고지월_시작'] = ret.fromMonth;
      information['고지월_종료'] = ret.toMonth;
    }

    ret = notify_inquire_dong();
    if (ret) {
      information['조회동_시작'] = ret.inquire_fromDong;
      information['조회동_종료'] = ret.inquire_toDong;
    }

    ret = notify_dong_room();
    if (ret) {
      information['동'] = ret.dong;
      information['호'] = ret.room;
    }

    ret = notify_sort();
    if (ret) information['정렬'] = ret;

    ret = notify_move_in_gubun();
    if (ret) information['입주구분'] = ret;

    ret = notify_delivery_gubun();
    if (ret) information['납기구분'] = ret;

    ret = notify_condition();
    if (ret) information['조건'] = ret;

  }
};
