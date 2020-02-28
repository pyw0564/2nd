const crypto = require('crypto');

const algo = 'aes-128-cbc';
const key = process.env.EncryptKey;


module.exports = function() {
  function decrypt(ssotoken) {
    let base = debase(ssotoken);
    let decipher = crypto.createDecipheriv(algo, key, key);
    return Buffer.concat([decipher.update(base), decipher.final()]);
  }

  function debase(data) {
    return Buffer.from(Buffer.from(data, 'base64').toString(), 'base64');
  }

  function json(ssotoken) {
    let de = decrypt(ssotoken).toString('utf8');
    let args = de.split('&');
    return {
      time: args[0],
      userid: args[1],
      username: args[2],
      service: args[3],
      dancode: args[4],
      usergubun: args[5]
    }
  }
  return {
    decrypt,
    json
  };
}();
