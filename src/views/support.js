// 시간 받아오기
function getTime() {
  var currentTime = new Date()
  return (currentTime.getHours() < 10 ? '0' + currentTime.getHours() : currentTime.getHours()) + ":" +
    (currentTime.getMinutes() < 10 ? '0' + currentTime.getMinutes() : currentTime.getMinutes()) + ":" +
    (currentTime.getSeconds() < 10 ? '0' + currentTime.getSeconds() : currentTime.getSeconds())
}

// 로그 처리
function log(text) {
  $.ajax({
    url: "/insertLog",
    method: "post",
    dataType: "json",
    data: {
      "text": text
    }
  })
}

// 문자열이 정수로만 이루어 져있는가?
function isDigit(query) {
  if (query == null || query == "") return false
  for (let i in query) {
    if (0 <= Number(query[i]) && Number(query[i]) <= 9) continue
    else return false
  }
  return true
}

// 스크롤 내리기
function scroll_bottom() {
  var offset = $("#chat_content .msg").last().offset()
  $("#chat_body").scrollTop(offset.top * 10000)
}

// ?
function extractDomain(url) {
  var domain;
  //find & remove protocol (http, ftp, etc.) and get domain
  if (url.indexOf("://") > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }
  //find & remove port number
  domain = domain.split(':')[0];
  return domain;
}
