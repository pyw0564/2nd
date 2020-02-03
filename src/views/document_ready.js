/* 로그인 관련 */
$(document).ready(function() {
  /* 정보보기 버튼 */
  let information_flag = false
  // $("#inforamtion_body").css('display', 'none')
  $("#information_button").click(function(e) {
    information_flag = !information_flag
    if (information_flag) {
      $("#information_button").css("background-color", "blue")
      $("#information_button").text("정보끄기")
      $("#information").css('display', 'block')
    } else {
      $("#information_button").css("background-color", "#399aff")
      $("#information_button").text("정보보기")
      $("#information").css('display', 'none')
    }
  })

  /* 로그아웃 버튼 */
  $("#logout").click(function(e) {
    let xhr = new XMLHttpRequest()
    xhr.open('GET', '/logout', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send()
    xhr.addEventListener('load', function() {
      location.href = '/logout'
    })
  })
})


$(document).ready(function() {
  // 추천어 버튼 처리
  $("body").on('click', '.recommend', function(e) {
    $("#chat_data").text(e.target.innerText)
    parsing_ajax("PARSE")
  })

  // 마우스 이벤트 처리
  var buffer = [""]
  var idx = 0
  $("#chat_submit_btn").on("click", function() {
    idx = 0
    buffer.splice(1, 0, $("#chat_data").text())
    parsing_ajax("PARSE")
  })

  // 키보드 이벤트 처리
  $("#chat_data").keydown(function(e) {
    if (e.which == 27) { // ESC KEY
      parsing_ajax("ESC")
    } else if (e.which == 13) { // ENTER KEY
      idx = 0
      buffer.splice(1, 0, $("#chat_data").text())
      parsing_ajax("PARSE")
    } else if (e.which == 38) { // UP KEY
      if (idx == buffer.length) return
      let currMsg = buffer[++idx]
      $("#chat_data").text(currMsg)
    } else if (e.which == 40) { // DOWN KEY
      if (idx == 0) return
      let currMsg = buffer[--idx]
      idx = (idx + buffer.length) % buffer.length
      $("#chat_data").text(currMsg)
    }
  })

  // 새창 이벤트 처리
  $("a").click(function(e) {
    e.preventDefault()
    window.open($(this).attr("href"), 'aa')
  })

  // ??
  setInterval(function() {
    if ($(".loading")) {
      $(".loading").each(function() {
        var deg = (($(this).data("rotate") || 0) + 30) % 360
        var rotate = "rotate(" + deg + "deg)"
        $(this).data("rotate", deg)
        $(this).css({
          '-webkit-transform': rotate,
          '-moz-transform': rotate,
          '-o-transform': rotate,
          '-ms-transform': rotate,
          'transform': rotate
        })
      })
    }
  }, 100)
})
