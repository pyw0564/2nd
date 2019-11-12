// 시간 받아오기
function getTime() {
  var currentTime = new Date()
  return (currentTime.getHours() < 10 ? '0' + currentTime.getHours() : currentTime.getHours()) + ":" +
    (currentTime.getMinutes() < 10 ? '0' + currentTime.getMinutes() : currentTime.getMinutes()) + ":" +
    (currentTime.getSeconds() < 10 ? '0' + currentTime.getSeconds() : currentTime.getSeconds())
}

function scroll_bottom() {
  var offset = $("#chat_content .msg").last().offset()
  $("#chat_body").scrollTop(offset.top * 10)
}

// client_message 함수
function client_message() {
  var text = $("#chat_data").text()
  $("#chat_data").text("")
  var name = $("#userId").text()
  var msg = ""
  msg = "<div class='msg'>"
  msg += "<div class='user' style='text-align:right;'>" + name + "</div>"
  msg += "<div class='content' style='justify-content:flex-end;'>"
  msg += "<div class='time'>" + getTime() + "</div>"
  msg += "<div class='data me'>" + text + "</div>"
  msg += "</div>"
  msg += "</div>"
  $("#chat_content").append(msg)

  str = "<img src='img/loading.png' width='30' class='loading'>"

  msg = "<div class='msg load'>"
  msg += "<div class='user'>System</div>"
  msg += "<div class='content'>"
  msg += "<div class='data notme'>" + str + "</div>"
  msg += "<div class='time'>" + getTime() + "</div>"
  msg += "</div>"
  msg += "</div>"
  $("#chat_content").append(msg)

  scroll_bottom()
  return text
}

// 1. 파싱 보여주는 함수
function parsing_view(esc) {
  let text
  if (esc) {
    text = '취소'
  } else {
    text = client_message()
  }
  let xhr = new XMLHttpRequest()
  xhr.open('POST', '/parsing', true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify({
    text: text
  }))

  xhr.addEventListener('load', function() {
    let ret = JSON.parse(xhr.responseText)
    server_message_function(ret)
    scroll_bottom()
  })
}

// 2. ajax server_message 함수
function server_message_function(ret) {
  let str = ""
  let necessary_count = 0, match_count = 0
  if (ret && ret.message) str = ret.message + '<br>'
  for (let item in ret) {
    let low = ret[item]
    if (typeof low === 'object') {
      if (low.necessary) {
        ++necessary_count
        if (low.result) {
          str += "<div class='necessary'>" + low.display_name + "-> " + low.result
          ++match_count
        } else {
          str += "<div class='not_necessary'>" + low.display_name + "-> [must]"
        }
        str += "</div>"
      }
    }
  }
  msg = "<div class='msg'>"
  msg += "<div class='user'>System</div>"
  msg += "<div class='content'>"
  msg += "<div class='data notme'>" + str + "</div>"
  msg += "<div class='time'>" + getTime() + "</div>"
  msg += "</div>"
  msg += "</div>"
  $(".load").remove()
  $("#chat_content").append(msg)

  scroll_bottom()

  if (necessary_count > 0 && necessary_count == match_count) {
    rest_api_ajax(ret)
  }
}

// 3. rest api 통신 함수
function rest_api_ajax(object) {
  console.log("rest api 도착")
  var url = '/chat/response'
  var xhr = new XMLHttpRequest()
  let data = {
    data: object
  }
  xhr.open('POST', url, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify(data))
  xhr.addEventListener('load', function(evt) {
    /*
      rest api 정보 처리하는 곳
    */
    let response = JSON.parse(evt.currentTarget.response)
    let str = ""
    if (response.response_code == "OK" && response.message == "success") {
      let result = response.result
      let keys = Object.keys(result[0])
      str = "<table border='1'>"
      str += "<thead>"
      str += "<tr>"
      for(let tmp in keys) {
        str += "<th>"
        str += keys[tmp]
        str += "</th>"
      }
      str += "</tr>"
      str += "</thead>"
      str += "<tbody>"
      for(let tmp in result) {
        str += "<tr>"
        for(let values in result[tmp]) {
          str += "<td>"
          str += result[tmp][values]
          str += "</td>"
        }
        str += "</tr>"
      }
      str += "</tbody>"
      str += "</table>"
      str = "<a href='"
      str += "/chat/response/" + object.information.api_name + "?"
      let api_keys = Object.keys(object)
      for( let tmp in api_keys) {
        if(api_keys[tmp] != "message") {
          if (object[api_keys[tmp]].result != null)
            str += api_keys[tmp] + "=" + object[api_keys[tmp]].result + "&"
        }
      }
      str += "' target='_blank'>"
      str += "결과보기(새창)"
      str += "</a>"
    } else {
      str = "조회를 할 수 없거나 결과가 없습니다."
    }
    msg = "<div class='msg'>"
    msg += "<div class='user'>System</div>"
    msg += "<div class='content'>"
    msg += "<div class='data notme'>" + str + "</div>"
    msg += "<div class='time'>" + getTime() + "</div>"
    msg += "</div>"
    msg += "</div>"
    $("#chat_content").append(msg)

    scroll_bottom()

    let text = '취소'
    let xhr = new XMLHttpRequest()
    xhr.open('POST', '/parsing', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify({
      text: text
    }))

    xhr.addEventListener('load', function() {
      let ret = JSON.parse(xhr.responseText)
      server_message_function(ret)
      scroll_bottom()
    })
  })
}

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}
$(document).ready(function() {
  // 클릭 이벤트 처리
  var buffer = [""]
  var idx = 0
  $("#chat_submit_btn").on("click", function() {
    idx = 0
    buffer.splice(1,0,$("#chat_data").text())
    parsing_view()
  })
  $("a").click(function(e) {
    e.preventDefault()
    window.open($(this).attr("href"), 'aa')
  })
  setInterval(function(){
    if($(".loading")) {
      $(".loading").each(function() {
        var deg = (($(this).data("rotate") || 0)+30)%360;
        var rotate = "rotate("+deg+"deg)"
        $(this).data("rotate", deg);
        $(this).css({
          '-webkit-transform': rotate,
          '-moz-transform': rotate,
          '-o-transform': rotate,
          '-ms-transform': rotate,
          'transform': rotate
        });
      })
    }
  }, 100)
  // 엔터 이벤트 처리
  $("#chat_data").keydown(function(e) {
    if (e.which == 27) {
      parsing_view(e.which)
    }
    else if (e.which == 13) {
      idx = -1
      buffer.splice(1,0,$("#chat_data").text())
      parsing_view()
    }
    else if (e.which == 38) {
      if (idx == buffer.length) return
      let currMsg = buffer[++idx]
      $("#chat_data").text(currMsg)
    }
    else if (e.which == 40) {
      if (idx == 0) return
      let currMsg = buffer[--idx]
      idx = (idx + buffer.length) % buffer.length
      $("#chat_data").text(currMsg)
    }
  })
})
