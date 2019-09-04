/* jshint esversion: 8 */
const express = require('express');
const fs = require('fs');
const scanf = require('scanf');
const sscanf = require('scanf').sscanf;

var app = express();
// 인증 토큰 발급 받기
app.use('/inspect', express.static('src/inspect'));
app.use('/unpaid', express.static('src/unpaid'));
app.use('/', express.static(__dirname));
app.set('view engine', 'pug');
app.set('views', './views');
app.get('/', function(req, res) {
  let data = {};
  // 검침
  let s = fs.readFileSync('inspect/inspect_list.txt', {
    encoding: 'utf8'
  }, function(err, s) {});

  data.list_inspect = [];
  while (s) {
    let ret = getline(s);
     // 주석처리
    if (ret[0] == '#') {
      s = sscanf_nomalize(s, ret);
      continue;
    }
    ret = sscanf(s, '%s %s %s', 'item', 'name', 'url');
    for (let i in ret) s = sscanf_nomalize(s, ret[i]);
    data.list_inspect.push({
      item: ret.item,
      name: ret.name,
      url: ret.url
    });
  }


  // 미납
  s = fs.readFileSync('unpaid/unpaid_list.txt', {
    encoding: 'utf8'
  }, function(err, s) {});

  data.list_unpaid = [];
  while (s) {
    let ret = getline(s);
     // 주석처리
    if (ret[0] == '#') {
      s = sscanf_nomalize(s, ret);
      continue;
    }
    ret = sscanf(s, '%s %s %s', 'item', 'name', 'url');
    for (let i in ret) s = sscanf_nomalize(s, ret[i]);
    data.list_unpaid.push({
      item: ret.item,
      name: ret.name,
      url: ret.url
    });
  }



  console.log(s, data);
  res.render('run', {
    list: data
  });
});

function getline(s) {
  let ret = '';
  for (let i = 0; i < s.length; i++) {
    let c = Buffer.from(s[i], 'ascii');
    if (s[i] == '\n' || c[0] == 10 || c[0] == 13)
      return ret;
    ret += s[i];
  }
  return ret;
}
function nomalize(s) {
  for (let i = 0; i < s.length; i++) {
    let c = Buffer.from(s[i], 'ascii');
    if (s[i] != ' ' && s[i] != '\0' && c[0] != 10 && c[0] != 13) {
      return s.substr(i, s.length - i);
    }
  }
  return null;
}
function sscanf_nomalize(data, ret) {
  for (let i = 0; i < data.length; i++){
    if (data.substr(i, ret.length) == ret) {
      return nomalize(data.substr(i + ret.length, data.length - i));
    }
  }
}
app.listen(1234, function(err) {
  console.log("connected 3000 port");
});
