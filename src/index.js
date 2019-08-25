/* jshint esversion: 8 */
const express = require('express');
const fs = require('fs');
const scanf = require('scanf');
const sscanf = require('scanf').sscanf;

var app = express();
// 인증 토큰 발급 받기
app.use('/', express.static(__dirname));
app.set('view engine', 'pug');
app.set('views', './views');

app.locals.pretty = true;
app.get('/', function(req, res) {
  let data = {};
  // 검침
  let s = fs.readFileSync('./joynoly/inspect/inspect_list.txt', {
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
    for (let i in ret) {
      ret[i] = nomalize_back(ret[i]);
      s = sscanf_nomalize(s, ret[i]);
    }
    data.list_inspect.push({
      item: ret.item,
      name: ret.name,
      url: ret.url
    });
  }

  // 미납
  s = fs.readFileSync('./joynoly/unpaid/unpaid_list.txt', {
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
    for (let i in ret) {
      ret[i] = nomalize_back(ret[i]);
      s = sscanf_nomalize(s, ret[i]);
    }
    data.list_unpaid.push({
      item: ret.item,
      name: ret.name,
      url: ret.url
    });
  }

  // 고지
  s = fs.readFileSync('./joynoly/notify/notify_list.txt', {
    encoding: 'utf8'
  }, function(err, s) {});

  data.list_notify = [];
  while (s) {
    let ret = getline(s);
    // 주석처리
    if (ret[0] == '#') {
      s = sscanf_nomalize(s, ret);
      continue;
    }
    ret = sscanf(s, '%s %s %s', 'item', 'name', 'url');
    for (let i in ret) {
      ret[i] = nomalize_back(ret[i]);
      s = sscanf_nomalize(s, ret[i]);
    }
    data.list_notify.push({
      item: ret.item,
      name: ret.name,
      url: ret.url
    });
  }


  // 취소
  s = fs.readFileSync('joynoly/clear_list.txt', {
    encoding: 'utf8'
  }, function(err, s) {});
  data.list_clear = [];
  while (s) {
    let ret = getline(s);
    // 주석처리
    if (ret[0] == '#') {
      s = sscanf_nomalize(s, ret);
      continue;
    }
    ret = sscanf(s, '%s', 'name');
    for (let i in ret) {
      ret[i] = nomalize_back(ret[i]);
      s = sscanf_nomalize(s, ret[i]);
    }
    data.list_clear.push(nomalize_back(ret.name));
  }

  res.render('chat', {
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

function nomalize_back(s) {
  for (let i = s.length - 1; i >= 0; i--) {
    let c = Buffer.from(s[i], 'ascii');
    if (s[i] != ' ' && s[i] != '\0' && c[0] != 10 && c[0] != 13) {
      return s.substr(0, i + 1);
    }
  }
  return null;
}

function sscanf_nomalize(data, ret) {
  for (let i = 0; i < data.length; i++) {
    if (data.substr(i, ret.length) == ret) {
      return nomalize(data.substr(i + ret.length, data.length - i));
    }
  }
}
app.listen(3000, function(err) {
  console.log("connected 3000 port");
});
