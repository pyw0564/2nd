const cryptor = require('./cryptor')
const axios = require('axios')
const decryptor = require('./decryptor')

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
    console.log('URL', process.env.url + "/" + process.env.agencycode + url)
    return (await axios.post(process.env.url + "/" + process.env.agencycode + url, data, head)).data
  }

  async function get(url, data, head) {
    console.log('URL', process.env.url + "/" + process.env.agencycode + url)
    return (await axios.get(process.env.url + "/" + process.env.agencycode + url, head)).data
  }

  // 사용자인증
  async function authorize(object) {
    const {
      id,
      pw,
      dancode,
      service
    } = object
    if (id == undefined || pw == undefined) {
      console.log("imc authorize: id or pw is undefined")
      return
    }
    let token = cryptor.getToken(object)
    let XAuth = cryptor.getXAuth({
      token
    })
    let head = getHeaders(XAuth);
    let data = {
      ssotoken: token
    }
    return await post("/chatbot/auth/authorize", data, head)
  }

  // 단지코드 변경
  async function change_dancode(object) {
    const {
      id,
      dancode,
      service
    } = object
    let token = cryptor.getToken(object)
    let XAuth = cryptor.getXAuth({
      token
    })
    let head = getHeaders(XAuth);
    let data = {
      ssotoken: token
    }
    return await post("/chatbot/auth/danchange", data, head)
  }

  // rest api 함수
  async function rest_api_function(data, order, url, method) {
    if (data == undefined) {
      console.log(`imc ${url} : data undefined`)
      return
    }
    let XAuth = cryptor.getXAuth(data, order)
    let head = getHeaders(XAuth)
    if (method == 'post') {
      return await post(url, data, head)
    } else if (method == 'get') {
      return await get(url, data, head)
    }
  }

  return {
    decryptor,
    authorize,
    rest_api_function,
    change_dancode
  }
}();
