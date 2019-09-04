/* jshint esversion: 8 */
const express = require('express');
const fs = require('fs');
const scanf = require('scanf');
const sscanf = require('scanf').sscanf;
var app = express();
var sql = require('mssql');

var sqlConfig = {
  user: 'sa',
  password: '1111',
  server: 'DESKTOP-T86S6M5\\SQLEXPRESS',
};
// [{ Key : TableName }]
var tableList = [];
// sedeinfo : [ {dancode:dan}, {dongcode:dong}, {roomno:room}, {relation:rel}, {name:name} ]};
var tables = {};
// { TableName : [parameter, display_name, parameter_type], ... }
var reg = {};
var init;

app.use('/', express.static(__dirname));
app.set('view engine', 'pug');
app.set('views', './views');

app.locals.pretty = true;
app.get('/', async function(req, res) {
  if (init == null) {
    await read_DB();
    init = 'complete';
  }
  let info = {
    tableList: tableList,
    tables: tables,
    reg: reg
  }
  res.render('chat', info);
});

async function read_DB() {
  try {
    await console.log("sql connecting......");
    let pool = await sql.connect(sqlConfig);
    let result = await pool.request().query('select * from test.dbo.tables'); // subject is my database table name
    for (let i = 0; i < result.recordset.length; i++) {
      let record = result.recordset[i];
      tableList.push({
        key: record.tableKey,
        tableName: record.tableName
      });
      let result_table = await pool.request().query(`select * from test.dbo.${record.tableName}`);
      tables[record.tableName] = [];
      for (let j = 0; j < result_table.recordset.length; j++) {
        let table = result_table.recordset[j];
        let obj = {};
        for (let item in table) {
          obj[item] = table[item];
        }
        tables[record.tableName].push(obj);
      }
    }
    result = await pool.request().query('select * from test.dbo.regexps'); // subject is my database table name
    for (let i = 0; i < result.recordset.length; i++) {
      let record = result.recordset[i];
      if (reg[record.parameter_type] == null) {
        reg[record.parameter_type] = [];
      }
      reg[record.parameter_type].push({
        regexp: record.regexp,
        return_value: record.return_value,
        start: record.start,
        _length: record._length,
        _option: record._option
      });
    }
  } catch (err) {
    await console.log(err);
  }
  console.log('테이블리스트', tableList);
  console.log('테이블', tables);
  console.log('정규식', reg);
}

app.listen(3000, function(err) {
  console.log("connected 3000 port");
});
