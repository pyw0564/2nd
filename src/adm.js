const express = require('express')
var router = express.Router()

var read_database = require('./read_database')
var Api = read_database.Api
var Parameter = read_database.Parameter
var Regexpr = read_database.Regexpr
var Recommend = read_database.Recommend
var Response = read_database.Response
var sqlQuery = read_database.sqlQuery
var read_DB = read_database.read_DB

router.get('/', async function(req, res) {
  await read_DB()
  res.redirect('/adm/tables')
})

router.get("/view", function(req, res) {
  return res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>인쇄 미리보기</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <meta charset="utf-8">
        <script src="https://rd7.bankdata.co.kr/ReportingServer/html5/js/jquery-1.11.0.min.js"></script>
        <script src="https://rd7.bankdata.co.kr/ReportingServer/html5/js/crownix-viewer.min.js"></script>
        <link rel="stylesheet" type="text/css" href="https://rd7.bankdata.co.kr/ReportingServer/html5/css/crownix-viewer.min.css">
      </head>
      <body style="margin:0px; padding:0px;">
        <div id="crownix-viewer" style="position:absolute;width:100%;height:100%;"></div>
        <script>
          window.onload = function() {
            var rptData = "";
            var rptParam = "";
            if(opener == undefined || opener.document.getElementById("hdnPrintData") == null) {
              alert("인쇄할 자료가 없습니다");
              self.close();
            } else {
              rptData = opener.document.getElementById("hdnPrintData").value;
              if(opener.document.getElementById("hdnPrintParam") != null &&
                opener.document.getElementById("hdnPrintParam").value != "") {
                  rptParam = "/rv" + opener.document.getElementById("hdnPrintParam").value + " ";
                }
                rptParam += "/rnl [\`]";
            }
            var Util = m2soft.crownix.Util;
            var rptFile = Util.getUrlVar("rptfile");
            var viewer = new m2soft.crownix.Viewer("https://rd7.bankdata.co.kr/RepostingServer/service", "crownix-viewer");

            viewer.setRData(rptData);
            viewer.openFile(rptFile, rptParam, {timeout:600, pdfReaderNotFoundMessage: "Adobe Reader를 찾을 수 없습니다."});
          }
        </script>
      </body>
    </html>

    `)
})

router.get('/tables', async function(req, res) {
  const queryResult = await sqlQuery("SELECT * FROM API")
  res.render("adm", {
    type: "tables",
    tableList: queryResult,
    tables: Parameter,
    reg: Regexpr
  })
})

router.get('/regexps', async function(req, res) {
  const queryResult = await sqlQuery("SELECT * FROM regexp")
  await read_DB()
  res.render("adm", {
    type: "regexps",
    tableList: Api,
    tables: Parameter,
    reg: queryResult
  })
})

router.get('/:tableName/columns', async function(req, res) {
  const tableName = req.params.tableName
  let queryResult = await sqlQuery(`SELECT * FROM Parameter where api_name = '${tableName}'`)
  res.render("adm", {
    type: "columns",
    columns: queryResult,
    tableName: tableName,
    tableList: Api,
    tables: Parameter
  })
})

/* 로그 페이지 */
router.get('/logs', async function(req, res) {
  const queryResult = await sqlQuery("SELECT * FROM _log ORDER BY _time DESC")
  res.render("adm", {
    type: "logs",
    logs: queryResult
  })
})

/* 추천어 관리 페이지 */
router.get('/recommend', async function(req, res) {
  const queryResult = await sqlQuery("SELECT * FROM Recommend")
  console.log(queryResult)
  res.render("adm", {
    type: "recommend",
    recommend: queryResult
  })
})

/* 응답 텍스트 관리 페이지 */
router.get('/response', async function(req, res) {
  const queryResult = await sqlQuery("SELECT * FROM Response")
  console.log(queryResult)
  res.render("adm", {
    type: "response",
    response: queryResult
  })
})

router.post('/insert/table', async function(req, res) {
  const display_name = req.body.display_name
  const api_name = req.body.api_name
  const response = req.body.response
  const parameter_type = req.body.parameter_type
  const url = req.body.url
  const response_text = req.body.response_text
  const rest_method = req.body.rest_method
  const query = ` INSERT INTO API(display_name, api_name, response, parameter_type)
                  VALUES ('${display_name}', '${api_name}', '${response}', '${parameter_type}',
                '${url}', '${response_text}', '${rest_method}');`
  console.log(query);
  try {
    await sqlQuery(query)
  } catch (e) {
    console.log('테이블 등록실패')
    res.send(await alertAndRedirect('테이블 등록 실패', '/adm/tables'))
  }
  console.log('테이블 등록완료')
  res.send(await alertAndRedirect('테이블 등록이 완료되었습니다', '/adm/tables'))
})

router.post('/insert/regexp', async function(req, res) {
  const parameter_type = req.body.parameter_type
  const regexp = req.body.regexp
  const _option = req.body._option
  const return_value = req.body.return_value ? req.body.return_value : ""
  const start = req.body.start ? parseInt(req.body.start) : -1
  const _length = req.body._length ? parseInt(req.body._length) : -1
  const query = `
    INSERT INTO REGEXP(parameter_type, regexp, _option, return_value, start, _length)
    VALUES ('${parameter_type}', '${regexp}', '${_option}', '${return_value}', ${start}, ${_length})
  `
  await sqlQuery(query)
  console.log('정규표현식 등록완료')
  res.send(await alertAndRedirect('정규표현식 등록완료', '/adm/regexps'))
})

router.post('/insert/recommend', async function(req, res) {
  const parameter_type = req.body.parameter_type
  const word = req.body.word
  const button = req.body.button
  const query = `
    INSERT INTO Recommend(parameter_type, word, button)
    VALUES ('${parameter_type}', '${word}', '${button}')
  `
  await sqlQuery(query)
  console.log('추천어 등록완료')
  res.send(await alertAndRedirect('추천어 등록완료', '/adm/recommend'))
})

router.post('/insert/response', async function(req, res) {
  const flag = req.body.flag
  const _option = req.body._option
  const response_text = req.body.response_text
  const _order = req.body._order
  const query = `
    INSERT INTO response(flag, _option, response_text, _order)
    VALUES ('${flag}', '${_option}', '${response_text}', '${_order}')
  `
  await sqlQuery(query)
  console.log('응답 텍스트 등록완료')
  res.send(await alertAndRedirect('추천어 등록완료', '/adm/response'))
})

router.post('/insert/:tableName/row', async function(req, res) {
  const api_name = req.body.api_name
  const parameter = req.body.parameter
  const display_name = req.body.display_name
  const parameter_type = req.body.parameter_type
  const necessary = req.body.necessary
  const _order = req.body._order
  const tableName = req.params.tableName
  const query = `
    INSERT INTO Parameter(api_name, parameter, display_name, parameter_type, necessary, _order)
    VALUES ('${api_name}', '${parameter}', '${display_name}', '${parameter_type}', '${necessary}', '${order}')
  `
  console.log(query)
  await sqlQuery(query)
  console.log('테이블 속성 등록완료')
  res.send(await alertAndRedirect('테이블 속성 등록완료', `/adm/${api_name}/columns`))
})

router.post('/update/table', async function(req, res) {
  const prev = req.body.prev
  const display_name = req.body.display_name
  const api_name = req.body.api_name
  const response = req.body.response
  const parameter_type = req.body.parameter_type
  const url = req.body.url
  const response_text = req.body.response_text
  const rest_method = req.body.rest_method

  const query = `
    UPDATE API SET display_name='${display_name}', api_name='${api_name}', response='${response}', parameter_type='${parameter_type}',
     url = '${url}', response_text = '${response_text}', rest_method = '${rest_method}'
    WHERE api_name='${prev}';
    UPDATE Parameter SET api_name = '${api_name}'
    WHERE api_name='${prev}';
  `
  await sqlQuery(query)
  console.log('테이블 수정완료')
  res.send(await alertAndRedirect('테이블 수정완료', `/adm/tables`))
})

router.post('/update/recommend', async function(req, res) {
  const idx = req.body.idx
  const parameter_type = req.body.parameter_type
  const word = req.body.word
  const button = req.body.button

  const query = `
    UPDATE recommend SET parameter_type='${parameter_type}', word='${word}', button='${button}'
    WHERE idx=${idx};
  `
  await sqlQuery(query)
  console.log('추천어 수정완료')
  res.send(await alertAndRedirect('추천어 수정완료', `/adm/recommend`))
})

router.post('/update/response', async function(req, res) {
  const prev_flag = req.body.prev_flag
  const prev_order = req.body.prev_order
  const prev_option = req.body.prev_option
  const flag = req.body.flag
  const _option = req.body._option
  const response_text = req.body.response_text
  const _order = req.body._order

  const query = `
    UPDATE Response SET flag='${flag}', _option='${_option}', response_text='${response_text}', _order='${_order}'
    WHERE flag='${prev_flag}' and _order='${prev_order}' and _option='${prev_option}';
  `
  await sqlQuery(query)
  console.log('응답 텍스트 수정완료')
  res.send(await alertAndRedirect('응답 텍스트 수정완료', `/adm/response`))
})

router.post('/update/regexp', async function(req, res) {
  const idx = req.body.idx
  const parameter_type = req.body.parameter_type
  const regexp = req.body.regexp
  const _option = req.body._option
  const return_value = req.body.return_value ? req.body.return_value : ""
  const start = req.body.start ? parseInt(req.body.start) : -1
  const _length = req.body._length ? parseInt(req.body._length) : -1
  const query = `
    UPDATE REGEXP SET parameter_type='${parameter_type}', regexp='${regexp}', _option='${_option}', return_value='${return_value}', start=${start}, _length=${_length}
    WHERE idx=${idx};
  `
  await sqlQuery(query)
  console.log('정규표현식 수정완료')
  res.send(await alertAndRedirect('정규표현식 수정완료', `/adm/regexps`))
})

router.post('/update/:tableName/row', async function(req, res) {
  const prev = req.body.prev
  const api_name = req.body.api_name
  const parameter = req.body.parameter
  const display_name = req.body.display_name
  const parameter_type = req.body.parameter_type
  const necessary = req.body.necessary
  const tableName = req.params.tableName
  const _order = req.body._order
  const query = `
    UPDATE Parameter SET api_name='${api_name}', parameter='${parameter}', display_name='${display_name}', parameter_type='${parameter_type}', necessary='${necessary}', _order='${_order}'
    WHERE parameter='${prev}' and api_name='${tableName}';
  `
  await sqlQuery(query)
  console.log('테이블 속성 수정완료')
  res.send(await alertAndRedirect('테이블 속성 수정완료', `/adm/${api_name}/columns`))
})

router.post('/delete/table', async function(req, res) {
  const api_name = req.body.api_name
  if (api_name) {
    let query = `
      DELETE FROM API WHERE api_name = '${api_name}';
      DELETE FROM Parameter WHERE api_name = '${api_name}';
    `
    await sqlQuery(query)
    console.log('테이블 삭제완료')
    res.send(await alertAndRedirect('테이블 삭제완료', `/adm/tables`))
  } else {
    res.send(await alertAndRedirect('오류!', `/adm/tables`))
  }
})

router.post('/delete/regexp', async function(req, res) {
  const idx = parseInt(req.body.idx) ? parseInt(req.body.idx) : -1
  if (idx != -1) {
    let query = `DELETE FROM REGEXP WHERE idx = ${idx}`
    await sqlQuery(query)
    console.log('정규표현식 삭제완료')
    res.send(await alertAndRedirect('정규표현식 삭제완료', `/adm/regexps`))
  } else {
    res.send(await alertAndRedirect('오류!', `/adm/regexps`))
  }
})

router.post('/delete/recommend', async function(req, res) {
  const idx = parseInt(req.body.idx) ? parseInt(req.body.idx) : -1
  if (idx != -1) {
    let query = `DELETE FROM Recommend WHERE idx = ${idx}`
    await sqlQuery(query)
    console.log('추천어 삭제완료')
    res.send(await alertAndRedirect('추천어 삭제완료', `/adm/recommend`))
  } else {
    res.send(await alertAndRedirect('오류!', `/adm/regexps`))
  }
})

router.post('/delete/response', async function(req, res) {
  const flag = req.body.flag
  const _option = req.body._option
  const response_text = req.body.response_text
  const _order = req.body._order
  let query = `DELETE FROM Response WHERE flag = '${flag}' and _option='${_option}' and _order = '${_order}'`
  await sqlQuery(query)
  console.log('응답 텍스트 삭제완료')
  return res.send(await alertAndRedirect('응답 텍스트 삭제완료', `/adm/response`))
})

router.post('/delete/:tableName/row', async function(req, res) {
  const tableName = req.params.tableName
  const parameter = req.body.parameter
  if (tableName) {
    let query = `DELETE FROM Parameter WHERE parameter = '${parameter}' and api_name = '${tableName}'`
    await sqlQuery(query)
    console.log('테이블 속성삭제완료')
    res.send(await alertAndRedirect('테이블 속성삭제완료', `/adm/${tableName}/columns`))
  } else {
    res.send(await alertAndRedirect('오류!!', `/adm/${tableName}/columns`))
  }
})

async function alertAndRedirect(aler, href) {
  await read_DB()
  return `<script>
    alert("${aler}")
    location.href="${href}"
  </script>`
}

module.exports = router;
