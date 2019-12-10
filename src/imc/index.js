const cryptor = require('./cryptor');
const axios = require('axios');

module.exports = function() {
  function getHeaders(XAuth) {
    return {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Authorization": XAuth
      }
    }
  }
  async function post(url, data, head) {
    return (await axios.post(process.env.url + "/" + process.env.agencycode + url, data, head)).data;
  }
  async function get(url, head) {
    console.log('URL', process.env.url + "/" + process.env.agencycode + url, head)
    return (await axios.get(process.env.url + "/" + process.env.agencycode + url, head)).data;
  }
  // 사용자인증
  async function authorize(id, pw) {
    if (id == undefined || pw == undefined) {
      console.log("imc authorize: id or pw equal undefined");
      return;
    }
    let token = cryptor.getToken(id, pw);
    let XAuth = cryptor.getXAuth({
      token: token
    });

    let head = getHeaders(XAuth);
    let data = {
      ssotoken: token
    }

    return await post("/chatbot/auth/authorize", data, head);
  }

  async function rest_api_function(data, url, method) {
    if (data == undefined) {
      console.log(`imc ${url} : data undefined`)
      return
    }
    let XAuth = cryptor.getXAuth(data)
    let head = getHeaders(XAuth)
    console.log("data", data)
    if (method == 'post') {
      return await post(url, data, head)
    } else if (method == 'get') {
      return await get(url, head)
    }
  }
  return {
    authorize,
    rest_api_function
  }
}();
