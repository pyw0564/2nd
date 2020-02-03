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
  return res.redirect('/adm/api')
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

// 완료
router.get('/:tableName', async function(req, res) {
  try {
    const tableName = req.params.tableName
    let queryResult = await sqlQuery(`SELECT * FROM ${tableName}`)
    return res.render("./administer/adm", {
      type: tableName,
      object: queryResult
    })
  } catch (e) {
    return res.send(await alertAndRedirect('잘못된 접근 입니다.', '/adm/api'))
  }
})

// 완료
router.post('/insert/:tableName', async function(req, res) {
  try {
    const tableName = req.params.tableName
    let query = `INSERT INTO ${tableName}(`
    let idx = 0
    for (let item in req.body) {
      if (item.substr(0, 5) == "prev_") continue
      if (idx++) query += ", "
      query += item
    }
    query += ") VALUES ("
    idx = 0
    for (let item in req.body) {
      if (item.substr(0, 5) == "prev_") continue
      if (idx++) query += ", "
      let value = req.body[item]
      if (item == 'style') value = await replace_quotes(req.body[item])
      query += `'${value}'`
    }
    query += ")"
    await sqlQuery(query)
    return res.send(await alertAndRedirect(`${tableName} 등록 완료`, `/adm/${tableName}`))
  } catch (e) {
    return res.send(await alertAndRedirect(`${tableName} 등록 중 오류발생! PK, NULL값 확인`, `/adm/${tableName}`))
  }
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
  const parameter_type = req.body.parameter_type
  const word = req.body.word
  const button = req.body.button
  const prev_parameter_type = req.body.prev_parameter_type
  const prev_word = req.body.prev_word
  const prev_prev_button = req.body.prev_button
  try {
    const query = `
      UPDATE recommend SET parameter_type='${parameter_type}', word='${word}', button='${button}'
      WHERE parameter_type='${prev_parameter_type}' and word='${prev_word}' and button='${prev_prev_button}';
    `
    await sqlQuery(query)
    return res.send(await alertAndRedirect('recommend 수정완료', `/adm/recommend`))
  } catch (e) {
    return res.send(await alertAndRedirect('recommend 수정 오류발생', `/adm/recommend`))
  }
})

router.post('/update/response', async function(req, res) {
  const prev_flag = req.body.prev_flag
  const prev__order = req.body.prev__order
  const prev__option = req.body.prev__option
  const flag = req.body.flag
  const _option = req.body._option
  const response_text = req.body.response_text
  const _order = req.body._order
  const style = await replace_quotes(req.body.style)

  try {
    let query = `
      UPDATE Response SET flag='${flag}', _option='${_option}', response_text='${response_text}', _order='${_order}', style='${style}'
      WHERE flag='${prev_flag}' and _order='${prev__order}' and _option='${prev__option}';
    `
    await sqlQuery(query)
    return res.send(await alertAndRedirect('Response 수정완료', `/adm/response`))
  } catch (e) {
    return res.send(await alertAndRedirect('Response 수정 오류발생', '/adm/response'))
  }
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

router.post('/update/:tableName', async function(req, res) {
  const api_name = req.body.api_name
  const parameter = req.body.parameter
  const display_name = req.body.display_name
  const parameter_type = req.body.parameter_type
  const necessary = req.body.necessary
  const _order = req.body._order

  const prev_api_name = req.body.prev_api_name
  const prev_parameter = req.body.prev_parameter
  const prev_display_name = req.body.prev_display_name
  const prev_parameter_type = req.body.prev_parameter_type
  const prev_necessary = req.body.prev_necessary
  const prev__order = req.body.prev__order

  const tableName = req.params.tableName
  try {
    const query = `
      UPDATE Parameter SET api_name='${api_name}', parameter='${parameter}', display_name='${display_name}', parameter_type='${parameter_type}', necessary='${necessary}', _order='${_order}'
      WHERE api_name='${prev_api_name}' and parameter='${prev_parameter}';
    `
    await sqlQuery(query)
    return res.send(await alertAndRedirect('테이블 속성 수정완료', `/adm/${api_name}`))
  } catch (e) {
    return res.send(await alertAndRedirect('테이블 속성 오류발생', `/adm/${api_name}`))
  }
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
  const parameter_type = req.body.parameter_type
  const word = req.body.word
  const button = req.body.button
  try {
    let query = `DELETE FROM Recommend WHERE parameter_type='${parameter_type}' and word='${word}' and button='${button}';`
    await sqlQuery(query)
    return res.send(await alertAndRedirect('recommend 삭제완료', `/adm/recommend`))
  } catch (e) {
    return res.send(await alertAndRedirect('recommend 삭제 오류발생', `/adm/recommend`))
  }
})

router.post('/delete/response', async function(req, res) {
  const flag = req.body.flag
  const _option = req.body._option
  const response_text = req.body.response_text
  const _order = req.body._order
  const style = await replace_quotes(req.body.style)

  try {
    let query = `DELETE FROM Response WHERE flag = '${flag}' and _option='${_option}' and _order = '${_order}'`
    await sqlQuery(query)
    return res.send(await alertAndRedirect('Response 삭제완료', `/adm/response`))
  } catch (e) {
    return res.send(await alertAndRedirect('Response 삭제 오류발생', '/adm/response'))
  }
})

router.post('/delete/:tableName', async function(req, res) {
  const api_name = req.body.api_name
  const parameter = req.body.parameter
  const display_name = req.body.display_name
  const parameter_type = req.body.parameter_type
  const necessary = req.body.necessary
  const _order = req.body._order

  try {
    let query = `DELETE FROM Parameter WHERE parameter = '${parameter}' and api_name = '${api_name}'`
    await sqlQuery(query)
    return res.send(await alertAndRedirect('테이블 속성 삭제완료', `/adm/${api_name}`))
  } catch (e) {
    return res.send(await alertAndRedirect('테이블 속성 삭제 오류발생!!', `/adm/${api_name}`))
  }
})

async function alertAndRedirect(aler, href) {
  await read_DB()
  return `<script>
    alert("${aler}")
    location.href="${href}"
  </script>`
}

async function replace_quotes(text) {
  return text.replace(/'/gi, "''")
}
module.exports = router;
