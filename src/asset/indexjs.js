/* jshint esversion: 8 */
const express = require('express');
const fs = require('fs');
const scanf = require('scanf');
const sscanf = require('scanf').sscanf;
var sql = require('mssql');

var sqlConfig = {
  user: 'sa',
  password: '1111',
  server: 'DESKTOP-T86S6M5\\SQLEXPRESS',
};
var tableList = [];
// [{ Key : TableName }]
var tables = {};
  // sedeinfo : [ {dancode:dan}, {dongcode:dong}, {roomno:room}, {relation:rel}, {name:name} ]};

// { TableName : [parameter, display_name, parameter_type], ... }
var reg = { };
var init;
async function read_DB() {
  try {
    // await console.log("sql connecting......");
    let pool = await sql.connect(sqlConfig);
    let result = await pool.request().query('select * from test.dbo.tables'); // subject is my database table name
    for(let i = 0; i < result.recordset.length; i++){
      let record = result.recordset[i];
      tableList.push({key : record.tableKey, tableName : record.tableName });
      let result_table = await pool.request().query(`select * from test.dbo.${record.tableName}`);
      tables[record.tableName] = [];
      for(let j = 0; j < result_table.recordset.length; j++){
        let table = result_table.recordset[j];
        let obj = {};
        for(let item in table){
          obj[item] = table[item];
        }
        tables[record.tableName].push(obj);
      }
    }
    result = await pool.request().query('select * from test.dbo.regexps'); // subject is my database table name
    for(let i = 0; i < result.recordset.length; i++){
      let record = result.recordset[i];
      if(reg[record.parameter_type] == null){
        reg[record.parameter_type] = [];
      }
      reg[record.parameter_type].push({
        regexp : record.regexp,
        return_value : record.return_value,
        start : record.start,
        length : record.length,
        _option : record._option
      });
    }
  } catch (err) {
    // await console.log(err);
  }
  console.log('테이블리스트',tableList);
  console.log('테이블',tables);
  console.log('정규식',reg);
}


function parsing(reg, query) {
  for (let i = 0; i < reg.length; i++) {
    let regs = new RegExp(reg[i].regexp, reg[i].reg_option);
    console.log('정규식 추출',regs);
    let parsing_array = query.match(regs);
    console.log(parsing_array, parsing_array.length);
    console.log('추출된 값',query.substr(reg.start, reg.length));
    if (parsing_array.length == 0) continue;
    else if (parsing_array.length > 1) console.log("두개 이상이므로 모호합니다");
    else {
      query = query.substr(0, reg.start) + query.substr(reg.start + reg.length, query.length);
      return reg[i].return_value === null ? query.substr(reg.start, reg.length) : reg.return_value;
    }
  }
}

function parameters(table, query) {
  let ret = {};
  for (let i = 0; i < table.length; i++) {
    let parameter = table[i].parameter;
    let display_name = table[i].display_name;
    let parameter_type = table[i].parameter_type;
    ret[parameter] = parsing(reg[parameter_type], query);
  }
  return ret;
}

function find_table(query) {
  for (let i = 0; i < tableList.length; i++) {
    let key = tableList[i].key;
    let tableName = tableList[i].tableName;
    if (query.indexOf(key) !== -1) {
      return parameters(tables[tableName], query);
    }
  }
  return null;
}

var app = express();
app.use('/', express.static(__dirname));
app.set('view engine', 'pug');
app.set('views', './views');

app.locals.pretty = true;
app.get('/', function(req, res) {
  if(init == null){
    read_DB();
    init = 'complete';
  }


  // 취소
  let data = {};
  // 검침
  let s = fs.readFileSync('./joynoly/inspect/inspect_list.txt', {
    encoding: 'utf8'
  }, function(err, s) {});

  // data.list_inspect = [];
  // while (s) {
  //   let ret = getline(s);
  //   // 주석처리
  //   if (ret[0] == '#') {
  //     s = sscanf_nomalize(s, ret);
  //     continue;
  //   }
  //   ret = sscanf(s, '%s %s %s', 'item', 'name', 'url');
  //   for (let i in ret) {
  //     ret[i] = nomalize_back(ret[i]);
  //     s = sscanf_nomalize(s, ret[i]);
  //   }
  //   data.list_inspect.push({
  //     item: ret.item,
  //     name: ret.name,
  //     url: ret.url
  //   });
  // }
  //
  // // 미납
  // s = fs.readFileSync('./joynoly/unpaid/unpaid_list.txt', {
  //   encoding: 'utf8'
  // }, function(err, s) {});
  //
  // data.list_unpaid = [];
  // while (s) {
  //   let ret = getline(s);
  //   // 주석처리
  //   if (ret[0] == '#') {
  //     s = sscanf_nomalize(s, ret);
  //     continue;
  //   }
  //   ret = sscanf(s, '%s %s %s', 'item', 'name', 'url');
  //   for (let i in ret) {
  //     ret[i] = nomalize_back(ret[i]);
  //     s = sscanf_nomalize(s, ret[i]);
  //   }
  //   data.list_unpaid.push({
  //     item: ret.item,
  //     name: ret.name,
  //     url: ret.url
  //   });
  // }
  //
  // // 고지
  // s = fs.readFileSync('./joynoly/notify/notify_list.txt', {
  //   encoding: 'utf8'
  // }, function(err, s) {});
  //
  // data.list_notify = [];
  // while (s) {
  //   let ret = getline(s);
  //   // 주석처리
  //   if (ret[0] == '#') {
  //     s = sscanf_nomalize(s, ret);
  //     continue;
  //   }
  //   ret = sscanf(s, '%s %s %s', 'item', 'name', 'url');
  //   for (let i in ret) {
  //     ret[i] = nomalize_back(ret[i]);
  //     s = sscanf_nomalize(s, ret[i]);
  //   }
  //   data.list_notify.push({
  //     item: ret.item,
  //     name: ret.name,
  //     url: ret.url
  //   });
  // }
  // s = fs.readFileSync('joynoly/clear_list.txt', {
  //   encoding: 'utf8'
  // }, function(err, s) {});
  // data.list_clear = [];
  // while (s) {
  //   let ret = getline(s);
  //   // 주석처리
  //   if (ret[0] == '#') {
  //     s = sscanf_nomalize(s, ret);
  //     continue;
  //   }
  //   ret = sscanf(s, '%s', 'name');
  //   for (let i in ret) {
  //     ret[i] = nomalize_back(ret[i]);
  //     s = sscanf_nomalize(s, ret[i]);
  //   }
  //   data.list_clear.push(nomalize_back(ret.name));
  // }

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
