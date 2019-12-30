// 시간 받아오기
function getTime() {
  var currentTime = new Date()
  return (currentTime.getHours() < 10 ? '0' + currentTime.getHours() : currentTime.getHours()) + ":" +
    (currentTime.getMinutes() < 10 ? '0' + currentTime.getMinutes() : currentTime.getMinutes()) + ":" +
    (currentTime.getSeconds() < 10 ? '0' + currentTime.getSeconds() : currentTime.getSeconds())
}

// 스클로 내리기
function scroll_bottom() {
  var offset = $("#chat_content .msg").last().offset()
  $("#chat_body").scrollTop(offset.top * 10)
}

// client_message 보여주는 함수
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
}

// 1. 파싱 보여주는 함수
function parsing_view() {
  let text = $("#chat_data").text()
  client_message()
  $.ajax({
    url: "/insertLog",
    method: "post",
    dataType: "json",
    data: {
      "text": text
    },
  });
  let xhr = new XMLHttpRequest()
  xhr.open('POST', '/parsing', true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify({
    text: text
  }))

  xhr.addEventListener('load', function() {
    let res = JSON.parse(xhr.responseText)
    server_message_function(res)
    scroll_bottom()
  })
}

// 2. ajax server_message 함수
function server_message_function(res) {
  let flag = res.flag
  let recommend = res.recommend
  let object = res.object
  let clear_flag = false
  console.log(res)
  let str = ""
  if (flag == 'success') {
    let information = ""
    if (object && object.message) information += object.message + '<br>'
    for (let item in object) {
      let record = object[item]
      if (typeof record === 'object') {
        if (record.necessary) {
          if (record.result) {
            console.log(res)
            information += "<div class='necessary'>" + record.display_name + "-> "
            if (Array.isArray(record.result)) {
              for (let i in record.result) {
                information += record.result[i].parsing_value + " "
              }
            } else {
              information += record.result + " "
            }
          } else {
            information += "<div class='not_necessary'>" + record.display_name + "-> [must]"
          }
          information += "</div>"
        }
      }
    }
    $("#inforamtion_body").html(information)
    return rest_api_ajax(object)
  } else if (flag == 'home') {
    console.log("HOME")
    str += "<div>안녕하세요. 원하는 기능을 선택해주세요.<div/>"
    let idx = 1
    for (let item in recommend) {
      str += `<div><button class='recommend'> ${idx}. ${recommend[item]}</button></div>`
      idx += 1
    }
    $("#inforamtion_body").html("")
  } else if (flag == 'not') {
    str += `<div>[`
    let idx = 0
    for (let item in recommend) {
      if (idx) str += ','
      str += `${recommend[item].display_name}`
      idx += 1
    }
    str += `]의 정보가 필요합니다.</div>`
    str += `<div>`
    let necessary_array = res.necessary_array
    console.log(necessary_array)
    if (necessary_array.length) {
      str += `<div>추천어를 누르시거나, 정보를 입력해주세요!</div>`
      for (let item in necessary_array) {
        str += `<button class='recommend'>${necessary_array[item]}</button>`
      }
    } else {
      str += `<div>정보를 직접 입력해주세요!</div>`
    }
    str += `</div>`

    let information = ""
    if (object && object.message) information += object.message + '<br>'
    for (let item in object) {
      let record = object[item]
      if (typeof record === 'object') {
        if (record.necessary) {
          if (record.result) {
            console.log(res)
            information += "<div class='necessary'>" + record.display_name + "-> "
            if (Array.isArray(record.result)) {
              for (let i in record.result) {
                information += record.result[i].parsing_value + " "
              }
            } else {
              information += record.result + " "
            }
          } else {
            information += "<div class='not_necessary'>" + record.display_name + "-> [must]"
          }
          information += "</div>"
        }
      }
    }
    $("#inforamtion_body").html(information)
  } else {
    str += res.message
  }

  msg = "<div class='msg'>"
  msg += "<div class='user'>System</div>"
  msg += "<div class='content'>"
  msg += "<div class='data notme'>" + str + "</div>"
  msg += "<div class='time'>" + getTime() + "</div>"
  msg += "</div>"
  msg += "</div>"
  $(".load").remove()
  console.log(res)
  $("#chat_content").append(msg)
  scroll_bottom()
  $.ajax({
    url: "/insertLog",
    method: "post",
    dataType: "json",
    data: {
      "text": str
    },
  });
}

// 3. rest api 통신 함수
function rest_api_ajax(object) {
  // console.log("rest api 도착")
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
    if (response == 'Y') {
      // console.log(object.information)
      str = "<a href='"
      str += "/chat/response/" + object.information.api_name + "?"
      str += "data="
      str += JSON.stringify(object)
      str += "' target='_blank'>"
      str += "결과보기(새창)"
      str += "</a>"
      $.ajax({
        url: "/insertLog",
        method: "post",
        dataType: "json",
        data: {
          "text": "결과보기(새창)"
        },
      });
    } else {
      str = "조회를 할 수 없거나 결과가 없습니다."
      $.ajax({
        url: "/insertLog",
        method: "post",
        dataType: "json",
        data: {
          "text": "조회를 할 수 없거나 결과가 없습니다."
        },
      });
    }
    msg = "<div class='msg'>"
    msg += "<div class='user'>System</div>"
    msg += "<div class='content'>"
    msg += "<div class='data notme'>" + str + "</div>"
    msg += "<div class='time'>" + getTime() + "</div>"
    msg += "</div>"
    msg += "</div>"

    $("#chat_content").append(msg)

    console.log(msg)
    scroll_bottom()
    cancel_ajax('API COMPLETE')
  })
}

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

function cancel_ajax(flag) {
  let xhr = new XMLHttpRequest()
  xhr.open('POST', '/cancel', true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify({
    flag: flag
  }))
  console.log(flag)
  xhr.addEventListener('load', function() {
    let ret = JSON.parse(xhr.responseText)
    server_message_function(ret)
    scroll_bottom()
  })

}
$(document).ready(function() {
  // 클릭 이벤트 처리
  var buffer = [""]
  var idx = 0
  $("#chat_submit_btn").on("click", function() {
    idx = 0
    buffer.splice(1, 0, $("#chat_data").text())
    parsing_view()
  })
  $("a").click(function(e) {
    e.preventDefault()
    window.open($(this).attr("href"), 'aa')
  })
  setInterval(function() {
    if ($(".loading")) {
      $(".loading").each(function() {
        var deg = (($(this).data("rotate") || 0) + 30) % 360;
        var rotate = "rotate(" + deg + "deg)"
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
    if (e.which == 27) { // ESC
      cancel_ajax('ESC')
      $("#chat_data").text('다른거 할래요')
      $("#inforamtion_body").html('')
      parsing_view()
    } else if (e.which == 13) { // ENTER
      idx = 0
      buffer.splice(1, 0, $("#chat_data").text())
      parsing_view()
    } else if (e.which == 38) { // UP
      if (idx == buffer.length) return
      let currMsg = buffer[++idx]
      $("#chat_data").text(currMsg)
    } else if (e.which == 40) { // DOWN
      if (idx == 0) return
      let currMsg = buffer[--idx]
      idx = (idx + buffer.length) % buffer.length
      $("#chat_data").text(currMsg)
    }
  })
  // button 처리
  $("body").on('click', '.recommend', function(e) {
    $("#chat_data").text(e.target.innerText)
    parsing_view()
  })
})
