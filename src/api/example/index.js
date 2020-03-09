const moment = require('moment');
const crypto = require('crypto');

const algo = 'aes-128-cbc';
const key = process.env.EncryptKey;

module.exports = function() {
  function getToken(...args) {
    let plain = makePlainText(args);
    let AES = encryptAES(plain);
    return encodeBase64(AES);
  }

  function makePlainText(args) {
    let now = moment().format('YYYYMMDDHHmmss');
    // let result = now;
    let result = "";

    for (let i = 0; i < args.length; i++) {
      if (i) result += '&'
      result += args[i];
    }
    return result;
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

  return getToken;
}();
