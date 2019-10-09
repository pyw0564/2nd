// 시간 받아오기
function getTime() {
  var currentTime = new Date()
  return (currentTime.getHours() < 10 ? '0'+currentTime.getHours() : currentTime.getHours()) + ":" +
    (currentTime.getMinutes() < 10 ? '0'+currentTime.getMinutes() : currentTime.getMinutes()) + ":" +
    (currentTime.getSeconds() < 10 ? '0'+currentTime.getSeconds() : currentTime.getSeconds())
}

// client_message 함수
function client_message(){
  var text = $("#chat_data").text()
  $("#chat_data").text("")
  var name = $("#userId").text()
  var msg = ""
  msg = "<div class='msg'>"
  msg += "<div class='user' style='text-align:right;'>"+name+"</div>"
  msg += "<div class='content' style='justify-content:flex-end;'>"
  msg += "<div class='time'>"+getTime()+"</div>"
  msg += "<div class='data me'>"+text+"</div>"
  msg += "</div>"
  msg += "</div>"

  $("#chat_content").append(msg)
  $("#chat_body").scrollTop($("#chat_content").height())
  return text
}

// ajax server_message 함수
function run_ajax(text){
    let ret = init(text);
    let str = ""
    if (ret && ret.message) str = ret.message + '<br>'
    let flag = true
    for (let item in ret) {
      let low = ret[item]
      if (typeof low === 'object') {
        if(low.necessary) {
          str += "<div class='necessary'>" + low.display_name + "-> "
          if(low.result) str += low.result
          else {
            flag = false
            str += "[must]"
          }
          str += "</div>"
        } else {
          str += "<div class='not_necessary'>" + low.display_name + "-> " +
            (low.result ? low.result : "[option]") + "</div>"
        }
      }
    }
    // 테스트용 if삭제
    // if(!flag){
      str += "<div id='choose'>"
      str += "<div id='yes' class='choose_button'> 확인 </div>"
      str += "<div id='no' class='choose_button'> 취소 </div>"
      str += "</div>"
    // }
    msg = "<div class='msg'>"
    msg += "<div class='user'>System</div>"
    msg += "<div class='content'>"
    msg += "<div class='data notme'>"+str+"</div>"
    msg += "<div class='time'>"+getTime()+"</div>"
    msg += "</div>"
    msg += "</div>"
    $("#chat_content").append(msg);
    $("#chat_body").scrollTop($("#chat_content").height())
}

// 파싱 보여주는 함수
function parsing_view() {
  let text = client_message()
  // 비동기 통신
  $.ajax({
    success: run_ajax(text)
  })
}

$(document).ready(function(){

  // 확인 처리
  $('body').on('click', '#yes', function(){
    alert("API받으면 구현할꺼에요~")
  })

  // 취소 처리
  $('body').on('click', '#no', function(){
    run_ajax('취소')
    alert("응 취소~")
  })

  // 클릭 이벤트 처리
  $("#chat_submit_btn").on("click", function () {
    parsing_view()
  })

  // 엔터 이벤트 처리
  $("#chat_data").keydown(function(e) {
    if(e.which == 13) {
      parsing_view()
    }
  })
})
