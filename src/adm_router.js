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
  console.log(req)
  console.log(req.query)
  return res.send(`
    <!DOCTYPE html>
    <!DOCTYPE html>
    <html>
      <head>
        <title>인쇄 미리보기</title>
        <meta name="viewport" content="width=defice-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <meta charset="utf-8">
        <script src="https://rd7.bankdata.co.kr/ReportingServer/html5/js/jquery-1.11.0.min.js"></script>
        <script src="https://rd7.bankdata.co.kr/ReportingServer/html5/js/crownix-viewer.min.js"></script>
        <link rel="stylesheet" type="text/css" href="https://rd7.bankdata.co.kr/ReportingServer/html5/css/crownix-viewer.min.css">
      </head>
      <body style="margin:0px; padding:0px;">
        <div id="crownix-viewer" style="position:absolute;width:100%;height:100%;"></div>
        <script>
          window.onload = function(){
            var rptData = '';
            var rptParam = '';
            if (opener == undefined || opener.document.getElementById('hdnPrintData') == null) {
              alert('인쇄할 자료가 없습니다.');
              self.close();
            } else {
              rptData = opener.document.getElementById('hdnPrintData').value;
              if (opener.document.getElementById('hdnPrintParam') != null &&
                opener.document.getElementById('hdnPrintParam').value != '') {
                rptParam = '/rv ' + opener.document.getElementById('hdnPrintParam').value + ' ';
              }
              rptParam += '/rnl [\`]'; //줄바꿈문자
            }
            var Util = m2soft.crownix.Util;
            //var rptFile = Util.getUrlVar('rptfile');
            var rptFile = "${req.query.rptfile}";
            var viewer = new m2soft.crownix.Viewer('https://rd7.bankdata.co.kr/ReportingServer/service', 'crownix-viewer');

            viewer.setRData(rptData);
            viewer.openFile(rptFile, rptParam, { timeout: 600, pdfReaderNotFoundMessage: 'Adobe Reader를 찾을 수 없습니다.' });
          };
        </script>
      </body>
    </html>


    `)
})

// 테이블 메인
router.get('/:tableName', async function(req, res) {
  try {
    const tableName = req.params.tableName
    let queryResult = await sqlQuery(`SELECT * FROM ${tableName}`)
    let columns = await sqlQuery(`SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`)

    return res.render("./administer/adm", {
      type: tableName,
      object: queryResult,
      columns
    })
  } catch (e) {
    return res.send(await alertAndRedirect('잘못된 접근 입니다.', '/adm/api'))
  }
})

// 등록
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
      if (value.match(/'/)) value = await replace_quotes(req.body[item])
      query += `'${value}'`
    }
    query += ")"
    await sqlQuery(query)
    return res.send(await alertAndRedirect(`${tableName} 등록 완료`, `/adm/${tableName}`))
  } catch (e) {
    return res.send(await alertAndRedirect(`${tableName} 등록 중 오류발생! PK, NULL값 확인`, `/adm/${tableName}`))
  }
})

// 수정
router.post('/update/:tableName', async function(req, res) {
  try {
    const tableName = req.params.tableName
    let query = `UPDATE ${tableName} SET `
    let idx = 0
    for (let item in req.body) {
      if (item.substr(0, 5) == "prev_") continue
      if (idx++) query += ", "
      let value = req.body[item]
      if (value.match(/'/)) value = await replace_quotes(value)
      query += `${item}='${value}'`
    }
    query += " WHERE "
    idx = 0
    for (let item in req.body) {
      if (item.substr(0, 5) == "prev_") continue
      if (idx++) query += "and "
      let value = req.body["prev_"+item]
      if (value.match(/'/)) value = await replace_quotes(value)
      query += `${item}='${value}' `
    }
    await sqlQuery(query)
    return res.send(await alertAndRedirect(`${tableName} 수정 완료`, `/adm/${tableName}`))
  } catch (e) {
    return res.send(await alertAndRedirect(`${tableName} 수정 중 오류발생! PK, NULL값 확인`, `/adm/${tableName}`))
  }
})

// 삭제
router.post('/delete/:tableName', async function(req, res) {
  try {
    const tableName = req.params.tableName
    let query = `DELETE FROM ${tableName} WHERE `
    let idx = 0
    for (let item in req.body) {
      if (item.substr(0, 5) == "prev_") continue
      if (idx++) query += "and "
      let value = req.body[item]
      if (value.match(/'/)) value = await replace_quotes(value)
      query += `${item}='${value}' `
    }
    await sqlQuery(query)
    return res.send(await alertAndRedirect(`${tableName} 삭제 완료`, `/adm/${tableName}`))
  } catch (e) {
    return res.send(await alertAndRedirect(`${tableName} 삭제 중 오류발생!`, `/adm/${tableName}`))
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
