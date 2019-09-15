const sql = require('mssql');
require('dotenv').config({ path: __dirname + '/../' + '.env' })
var tableList = []
var tables = {}
var reg = {}
const sqlConfig = {
  user: process.env.DB_USER ? process.env.DB_USER : 'njuser', // mssql username
  password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'imc0029', // mssql password
  server: process.env.DB_SERVER ? process.env.DB_SERVER : '211.239.22.183', // 서버 주소
  database: process.env.DB_DATABASE ? process.env.DB_DATABASE : 'DAU_CRAWLER', // 사용할 database 이름
  stream: 'true', // ???
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433, // 서버 port 설정
  autoSchemaSync: true, // ???
  option: {
    encrypt: 'false' // ???
  },
  pool: {
    max: 100,
    min: 0,
    idleTimeoutMillis: 30000
  }
}
async function read_DB() {
  try {
    await console.log("SQL connecting......");
    let pool = await sql.connect(sqlConfig);
    let result = await pool.request().query('SELECT * FROM tables'); // subject is my database table name

    for (let i = 0; i < result.recordset.length; i++) {
      let record = result.recordset[i];
      tableList.push({
        key: record.tableKey,
        tableName: record.tableName
      });
      let result_table = await pool.request().query(`SELECT * FROM ${record.tableName}`);
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
    result = await pool.request().query('SELECT * FROM regexps'); // subject is my database table name
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

exports.tableList = tableList
exports.tables = tables
exports.reg = reg
exports.sqlConfig = sqlConfig
exports.read_DB = read_DB
