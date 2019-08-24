/* jshint esversion: 6 */

var inquire_inspect = {
  // 0. 조견표조회
  '0': function(s) {
    // 검침종류, 계산방식, 계산방식_동, 기타계절, 대가족/3자녀, 사용량 시작, 사용량 종료, 세대 수,
    // 세대구분 세대/상가, 소수점, 자동이체할인, 적용시작일_년, 적용시작일_월, 전기료감면, 필수사용량보장공제, 한전계약종별
    if (!flag) {
      information['시작사용량'] = null;
      information['종료사용량'] = null;
      information['검침_시작년도'] = null;
      information['검침_시작월'] = null;
      information['검침종류'] = null;
      information['계산방식'] = null;
      information['계산방식_동'] = null;
      information['기타계절'] = null;
      information['대가족_3자녀'] = null;
      information['자동이체할인'] = null;
      information['세대_수'] = null;
      information['세대_상가'] = null;
      information['소수점'] = null;
      information['전기료감면'] = null;
      information['필수사용량보장공제'] = null;
      information['한전계약종별'] = null;
    }
    let ret;
    ret = inspect_usage();
    if (ret) {
      information['시작사용량'] = ret.inspect_fromUsage;
      information['종료사용량'] = ret.inspect_toUsage;
    }

    ret = inspect_year_month();
    if (ret) {
      information['검침_시작년도'] = ret.fromYear;
      information['검침_시작월'] = ret.fromMonth;
    }

    ret = inspect_type();
    if (ret) information['검침종류'] = ret;

    ret = inspect_calculation_method();
    if (ret) information['계산방식'] = ret;

    ret = inspect_calculation_method_dong();
    if (ret) information['계산방식_동'] = ret;

    ret = inspect_season();
    if (ret) information['기타계절'] = ret;

    ret = inspect_long_family();
    if (ret) information['대가족_3자녀'] = ret;

    ret = inspect_autotransfer_discount();
    if (ret) information['자동이체할인'] = ret;

    ret = inspect_sede_num();
    if (ret) information['세대_수'] = ret;

    ret = inspect_HSgubun();
    if (ret) information['세대_상가'] = ret;

    ret = inspect_decimal_point();
    if (ret) information['소수점'] = ret;

    ret = inspect_electricity_charges_discount();
    if (ret) information['전기료감면'] = ret;

    ret = inspect_usage_guarantee_deduction();
    if (ret) information['필수사용량보장공제'] = ret;

    ret = insepct_contract();
    if (ret) information['한전계약종별'] = ret;
  },
  // 1 : 사용량리스트
  '1': function(s) {
    // 검침시작년도, 검침 시작월, 세대_상가, 검침종류, 동시작, 동 종료, 입주구분, 입주구분_전체_일수,
    // 전체형, 정렬, 정방향, 조회방법
    if (!flag) {
      information['검침_시작년도'] = null;
      information['검침_시작월'] = null;
      information['시작동'] = null;
      information['종료동'] = null;
      information['세대_상가'] = null;
      information['검침종류'] = null;
      information['입주구분'] = null;
      information['입주구분_전체_일수'] = null;
      information['전체형_단축형'] = null;
      information['정렬'] = null;
      information['조회방법'] = null;
      information['정방향_역방향'] = null;
      information['전기료감면'] = null;
    }
    let ret;
    ret = inspect_year_month();
    if (ret) {
      information['검침_시작년도'] = ret.fromYear;
      information['검침_시작월'] = ret.fromMonth;
    }

    ret = inspect_dong();
    if (ret) {
      information['시작동'] = ret.inquire_fromDong;
      information['종료동'] = ret.inquire_toDong;
    }

    ret = inspect_HSgubun();
    if (ret) information['세대_상가'] = ret;

    ret = inspect_type();
    if (ret) information['검침종류'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['입주구분'] = ret;

    ret = inspect_movie_in_gubun_option();
    if (ret) information['입주구분_전체_일수'] = ret;

    ret = inspect_entire_to_shorten();
    if (ret) information['전체형_단축형'] = ret;

    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_inquire_method();
    if (ret) information['조회방법'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;
  },
  // 2 : 사용량단계별
  '2': function(s) {
    // 검침시작년도, 검침 시작월, 검침종류
    // 전체형, 정렬, 정방향, 조회방법, 사용량시작, 사용량종료, 입주구분
    if (!flag) {
      information['검침_시작년도'] = null;
      information['검침_시작월'] = null;
      information['시작사용량'] = null;
      information['종료사용량'] = null;
      information['전체형_단축형'] = null;
      information['정렬'] = null;
      information['조회방법'] = null;
      information['정방향_역방향'] = null;
      information['검침종류'] = null;
      information['입주구분'] = null;
    }
    let ret;
    ret = inspect_year_month();
    if (ret) {
      information['검침_시작년도'] = ret.fromYear;
      information['검침_시작월'] = ret.fromMonth;
    }
    ret = inspect_usage();
    if (ret) {
      information['시작사용량'] = ret.inspect_fromUsage;
      information['종료사용량'] = ret.inspect_toUsage;
    }

    ret = inspect_entire_to_shorten();
    if (ret) information['전체형_단축형'] = ret;

    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_inquire_method();
    if (ret) information['조회방법'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;

    ret = inspect_type();
    if (ret) information['검침종류'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['입주구분'] = ret;

    console.log('사용량단계별', information);
  },
  // 3 : 검침카드조회
  '3': function(s) {
    if (!flag) {
      information['검침_시작년도'] = null;
      information['검침_종료년도'] = null;
      information['검침_시작월'] = null;
      information['검침_종료월'] = null;
      information['시작동'] = null;
      information['종료동'] = null;
      information['정렬'] = null;
      information['조회방법'] = null;
      information['정방향_역방향'] = null;
      information['검침종류'] = null;
      information['입주구분'] = null;
      information['호'] = null;
    }
    let ret;
    ret = inspect_year_month();
    if (ret) {
      information['검침_시작년도'] = ret.fromYear;
      information['검침_종료년도'] = ret.toYear;
      information['검침_시작월'] = ret.fromMonth;
      information['검침_종료월'] = ret.toMonth;
    }

    ret = inspect_dong();
    if (ret) {
      information['시작동'] = ret.inquire_fromDong;
      information['종료동'] = ret.inquire_toDong;
    }

    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_inquire_method();
    if (ret) information['조회방법'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;

    ret = inspect_type();
    if (ret) information['검침종류'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['입주구분'] = ret;

    ret = inspect_room_number();
    if (ret) information['호'] = ret;
  },
  // 4 : TV수신료제외세대
  '4': function(s) {
    if (!flag) {
      information['검침_시작년도'] = null;
      information['검침_시작월'] = null;
      information['시작동'] = null;
      information['종료동'] = null;
      information['정렬'] = null;
      information['조회방법'] = null;
      information['정방향_역방향'] = null;
      information['검침종류'] = null;
      information['입주구분'] = null;
    }
    let ret;
    ret = inspect_year_month();
    if (ret) {
      information['검침_시작년도'] = ret.fromYear;
      information['검침_시작월'] = ret.fromMonth;
    }

    ret = inspect_dong();
    if (ret) {
      information['시작동'] = ret.inquire_fromDong;
      information['종료동'] = ret.inquire_toDong;
    }

    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_inquire_method();
    if (ret) information['조회방법'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;

    ret = inspect_type();
    if (ret) information['검침종류'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['입주구분'] = ret;
  },
  // 5 : 1주택2가구세대
  '5': function(s) {
    if (!flag) {
      information['검침_시작년도'] = null;
      information['검침_시작월'] = null;
      information['시작동'] = null;
      information['종료동'] = null;
      information['정렬'] = null;
      information['정방향_역방향'] = null;
      information['입주구분'] = null;
    }
    let ret;
    ret = inspect_year_month();
    if (ret) {
      information['검침_시작년도'] = ret.fromYear;
      information['검침_시작월'] = ret.fromMonth;
    }
    ret = inspect_dong();
    if (ret) {
      information['시작동'] = ret.inquire_fromDong;
      information['종료동'] = ret.inquire_toDong;
    }

    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['입주구분'] = ret;
  },
  // 6 : 수도감면세대
  '6': function(s) {
    if (!flag) {
      information['검침_시작년도'] = null;
      information['검침_시작월'] = null;
      information['시작동'] = null;
      information['종료동'] = null;
      information['정렬'] = null;
      information['정방향_역방향'] = null;
      information['입주구분'] = null;
      information['감면구분'] = null;
    }
    let ret = inspect_year_month();
    if (ret) {
      information['검침_시작년도'] = ret.fromYear;
      information['검침_시작월'] = ret.fromMonth;
    }
    ret = inspect_dong();
    if (ret) {
      information['시작동'] = ret.inquire_fromDong;
      information['종료동'] = ret.inquire_toDong;
    }
    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['입주구분'] = ret;

    ret = inspect_reduction();
    if (ret) information['감면구분'] = ret;
  },
  // 7 : 전기감면세대
  '7': function(s) {
    if (!flag) {
      information['검침_시작년도'] = null;
      information['검침_시작월'] = null;
      information['시작동'] = null;
      information['종료동'] = null;
      information['정렬'] = null;
      information['정방향_역방향'] = null;
      information['입주구분'] = null;
      information['감면구분'] = null;
    }
    let ret;
    ret = inspect_year_month();
    if (ret) {
      information['검침_시작년도'] = ret.fromYear;
      information['검침_시작월'] = ret.fromMonth;
    }
    ret = inspect_dong();
    if (ret) {
      information['시작동'] = ret.inquire_fromDong;
      information['종료동'] = ret.inquire_toDong;
    }
    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['입주구분'] = ret;

    ret = inspect_reduction();
    if (ret) information['감면구분'] = ret;
  },
  // 8 : 대가족 할인 세대
  '8': function(s) {
    if (!flag) {
      information['검침_시작년도'] = null;
      information['검침_시작월'] = null;
      information['시작동'] = null;
      information['종료동'] = null;
      information['정렬'] = null;
      information['정방향_역방향'] = null;
      information['입주구분'] = null;
      information['감면구분'] = null;
      information['_301kw_이상만_출력'] = null;
      information['대가족_3자녀'] = null;
      information['공용사용량'] = null;
    }
    let ret;
    ret = inspect_year_month();
    if (ret) {
      information['검침_시작년도'] = ret.fromYear;
      information['검침_시작월'] = ret.fromMonth;
    }
    ret = inspect_dong();
    if (ret) {
      information['시작동'] = ret.inquire_fromDong;
      information['종료동'] = ret.inquire_toDong;
    }
    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['입주구분'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['_301kw_이상만_출력'] = inspect_over_301kw;

    ret = inspect_move_in_gubun();
    if (ret) information['대가족_3자녀'] = inspect_long_family;

    ret = inspect_move_in_gubun();
    if (ret) information['공용사용량'] = inspect_public_use;
  },
  // 10. 오차범위 최대값
  '9': function(s) {
    if (!flag) {
      information['검침_시작년도'] = null;
      information['검침_시작월'] = null;
      information['시작동'] = null;
      information['종료동'] = null;
      information['정렬'] = null;
      information['정방향_역방향'] = null;
      information['입주구분'] = null;
      information['검침종류'] = null;
      information['조회구분'] = null;
      information['조회값'] = null;
    }
    let ret;
    ret = inspect_year_month();
    if (ret) {
      information['검침_시작년도'] = ret.fromYear;
      information['검침_시작월'] = ret.fromMonth;
    }
    ret = inspect_dong();
    if (ret) {
      information['시작동'] = ret.inquire_fromDong;
      information['종료동'] = ret.inquire_toDong;
    }
    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['입주구분'] = ret;

    ret = inspect_type();
    if (ret) information['검침종류'] = ret;

    ret = inspect_inquire_gubun();
    if (ret) information['조회구분'] = ret;

    ret = inspect_inquire_value();
    if (ret) information['조회값'] = ret;
  },
  // 11. 년간검침현황
  '10': function(s) {
    if (!flag) {
      information['시작동'] = null;
      information['종료동'] = null;
      information['검침_시작년도'] = null;
      information['검침종류'] = null;
      information['정렬'] = null;
      information['정방향_역방향'] = null;
      information['항목_사용량_당월지침'] = null;
    }
    let ret;
    ret = inspect_dong();
    if (ret) {
      information['시작동'] = ret.inquire_fromDong;
      information['종료동'] = ret.inquire_toDong;
    }
    ret = inspect_year_one();
    if (ret) information['검침_시작년도'] = ret;

    ret = inspect_type();
    if (ret) information['검침종류'] = ret;

    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;

    ret = inspect_item_option();
    if (ret) information['항목_사용량_당월지침'] = ret;
  },
  // 12. 상가수도조견별
  '11': function(s) {
    if (!flag) {
      information['검침_시작년도'] = null;
      information['검침_시작월'] = null;
      information['시작동'] = null;
      information['종료동'] = null;
      information['검침종류'] = null;
      information['정렬'] = null;
      information['정방향_역방향'] = null;
      information['입주구분'] = null;
      information['조견종류'] = null;
    }
    let ret;
    ret = inspect_year_month();
    if (ret) {
      information['검침_시작년도'] = ret.fromYear;
      information['검침_시작월'] = ret.fromMonth;
    }

    ret = inspect_dong();
    if (ret) {
      information['시작동'] = ret.inquire_fromDong;
      information['종료동'] = ret.inquire_toDong;
    }
    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['입주구분'] = ret;

    ret = inspect_item_option();
    if (ret) information['조견종류'] = ret;
  },
  // 13. 주택용저압고압
  '12': function(s) {
    if (!flag) {
      information['시작동'] = null;
      information['종료동'] = null;
      information['검침_시작년도'] = null;
      information['검침종류'] = null;
      information['정렬'] = null;
      information['정방향_역방향'] = null;
      information['입주구분'] = null;
      information['필수사용량보장공제'] = null;
      information['자동이체할인'] = null;
    }
    let ret;
    ret = inspect_dong();
    if (ret) {
      information['시작동'] = ret.inquire_fromDong;
      information['종료동'] = ret.inquire_toDong;
    }
    ret = inspect_year_one();
    if (ret) information['검침_시작년도'] = ret;

    ret = inspect_type();
    if (ret) information['검침종류'] = ret;

    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['입주구분'] = ret;

    ret = inspect_usage_guarantee_deduction();
    if (ret) information['필수사용량보장공제'] = ret;

    ret = inspect_autotransfer_discount();
    if (ret) information['자동이체할인'] = ret;
  },
  // 필수사용량보장공제
  '13': function(s) {
    if (!flag) {
      information['시작동'] = null;
      information['종료동'] = null;
      information['검침_시작년도'] = null;
      information['검침종류'] = null;
      information['정렬'] = null;
      information['정방향_역방향'] = null;
      information['입주구분'] = null;
    }
    let ret;
    ret = inspect_dong();
    if (ret) {
      information['시작동'] = ret.inquire_fromDong;
      information['종료동'] = ret.inquire_toDong;
    }
    ret = inspect_year_one();
    if (ret) information['검침_시작년도'] = ret;

    ret = inspect_type();
    if (ret) information['검침종류'] = ret;

    ret = inspect_sort();
    if (ret) information['정렬'] = ret;

    ret = inspect_forward_reverse();
    if (ret) information['정방향_역방향'] = ret;

    ret = inspect_move_in_gubun();
    if (ret) information['입주구분'] = ret;
  }
};
