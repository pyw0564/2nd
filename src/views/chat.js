// 1. 파싱 보여주는 함수
function parsing_ajax(flag) {
  // 입력한 텍스트
  let text = $("#chat_data").text()
  console.log("입력한 텍스트", text)

  // 숫자로 API 처리
  if (isDigit(text)) {
    if ($(`#API_${text}`).text()) {
      $("#chat_data").text($(`#API_${text}`).text())
      return parsing_ajax("PARSE")
    }
  }

  // 만약 FLAG가 PARSE이면 클라이언트 메시지 처리 및 로그
  if (flag == "PARSE") {
    client_message()
  }

  // AJAX 처리
  let xhr = new XMLHttpRequest()
  xhr.open('POST', "/parsing", true)
  xhr.setRequestHeader("Content-Type", "application/json")
  xhr.send(JSON.stringify({
    flag: flag,
    text: text
  }))

  xhr.addEventListener("load", function() {
    // 받은 메시지로 다음 함수 진행
    let responseText = JSON.parse(xhr.responseText)
    server_message_function(responseText)
  })
}

// 2. ajax server_message 함수
function server_message_function(object) {
  let flag = object.flag
  let information = object.information
  let recommend = object.recommend
  let str = ""

  // 정보보기 함수 처리
  information_function(object)
  // API 완료
  server_message(information.message)

  if (flag == "END") // 만약 API 통신이 끝났다면 3단계로
    return rest_api_ajax(information)
}

// 3. rest api 통신 함수
function rest_api_ajax(object) {
  var url = '/chat/response'
  var xhr = new XMLHttpRequest()
  xhr.open('POST', url, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify({
    object
  }))
  xhr.addEventListener('load', function(evt) {
    let res = JSON.parse(evt.currentTarget.response)
    server_message(res)
    parsing_ajax("HOME")
  })
}

// 클라이언트 메시지 보여주는 함수
function client_message() {
  let text = $("#chat_data").text()
  let name = $("#userId").text()
  let msg = ""
  $("#chat_data").text("")
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

  log(text)
  scroll_bottom()
}

// 서버 메시지 보여주는 함수
function server_message(msg) {
  $(".load").remove()
  $("#chat_content").append(msg)
  scroll_bottom()
  log(msg)
}

// 정보보기 담당 함수
function information_function(object) {
  let flag = object.flag
  let recommend = object.recommend
  let information = object.information
  let str = ""
  if (flag == "LOGIN" || flag == 'ESC' || flag == 'CANCEL') {
    str += `<table id='infomation_table'>`
    str += `<tr>`
    str += `<td>정보없음`
    str += `</td>`
    str += `</tr>`
    str += "</table>"
    $("#inforamtion_body").html(str)
    return
  }
  if (flag == 'HOME' || flag == 'UNKNOWN') {
    return
  }
  if (information) str += `<div id='information_message'>${information.API_information.display_name}</div>`
  str += `<table id='infomation_table'>`
  for (let item in information) {
    let record = information[item]
    if (typeof record === 'object') {
      if (record.necessary) {
        str += `<tr>`
        if (record.result) {
          str += `<td class='necessary'>${record.display_name}`
          str += `<td class='necessary'>`
          if (Array.isArray(record.result)) {
            for (let i in record.result)
              str += record.result[i].parsing_value + " "
          } else {
            str += record.result + " "
          }
          str += `</td>`
        } else {
          str += `<td class='not_necessary'>${record.display_name}</td>`
          str += `<td class='not_necessary'></td>`
        }
        str += `</tr>`
      }
    }
  }
  str += "</table>"
  $("#inforamtion_body").html(str)
}
