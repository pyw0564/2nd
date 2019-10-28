// 시간 받아오기
function getTime() {
  var currentTime = new Date()
  return (currentTime.getHours() < 10 ? '0' + currentTime.getHours() : currentTime.getHours()) + ":" +
    (currentTime.getMinutes() < 10 ? '0' + currentTime.getMinutes() : currentTime.getMinutes()) + ":" +
    (currentTime.getSeconds() < 10 ? '0' + currentTime.getSeconds() : currentTime.getSeconds())
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
  $("#chat_body").scrollTop($("#chat_content").height())
  return text
}

// 1. 파싱 보여주는 함수
function parsing_view() {
  let text = client_message()
  let xhr = new XMLHttpRequest()
  xhr.open('POST', '/parsing', true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify({
    text: text
  }))

  xhr.addEventListener('load', function() {
    let ret = JSON.parse(xhr.responseText)
    server_message_function(ret)
    var offset = $("#chat_content .msg").last().offset()
    $("#chat_body").scrollTop(offset.top * 2)
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
  $("#chat_content").append(msg)

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

    var offset = $("#chat_content .msg").last().offset()
    $("#chat_body").scrollTop(offset.top * 2)
  })
}


$(document).ready(function() {
  // 클릭 이벤트 처리
  $("#chat_submit_btn").on("click", function() {
    parsing_view()
  })
  // 엔터 이벤트 처리
  $("#chat_data").keydown(function(e) {
    if (e.which == 13) {
      parsing_view()
    }
  })
})
