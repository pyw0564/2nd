const crypto = require('crypto');
const moment = require('moment');
const base64url = require('base64-url');
require('dotenv').config(__dirname + "/../../.env");

module.exports = function() {
  const algo = 'aes-128-cbc';
  const key = process.env.EncryptKey;

  function makePlainText(id, pw) {
    let now = moment().format('YYYYMMDDHHmmss');
    let pwHash = crypto.createHash('sha512').update(pw).digest('base64');

    return now + '&' + id + '&' + pwHash;
  }

  function encryptAES(value) {
    const cipher = crypto.createCipheriv(algo, key, key);
    let result = Buffer.concat([cipher.update(value), cipher.final()]);
    return result.toString('base64');
  }

  function encodeBase64(value) {
    let base = Buffer.from(value);

    return base.toString('base64');
  }

  function getToken(id, pw) {
    let plain = makePlainText(id, pw);
    let AES = encryptAES(plain);
    return encodeBase64(AES);
  }

  function getXAuth(data) {
    let NONCE = process.env.NONCE;
    let msg = "";

    if (data.token) {
      msg = data.token;
    } else {
      let keys = Object.keys(data);
      for (let i = 0; i < keys.length; i++) {
        msg += data[keys[i]];
      }
    }

    let value = msg + NONCE;
    let hmac = crypto.createHmac("sha256", process.env.HmacKey);
    let hash = hmac.update(value).digest('base64');
    return base64url.escape(hash);
  }

  return {
    getToken,
    getXAuth
  }
}();
