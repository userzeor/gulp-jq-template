function getUrlParams(url = window.location.href) {
  const Params = {};
  if (url.indexOf("?") > 0) {
    //判断是否有qurey
    let parmas = url.slice(url.indexOf("?") + 1); //截取出query
    const paramlists = parmas.split("&"); //分割键值对
    for (const param of paramlists) {
      let a = param.split("=");
      Object.assign(Params, { [a[0]]: a[1] }); //将键值对封装成对象
    }
  }
  return Params;
}

const myCrypto = {
    MD5:(word) =>{
        return CryptoJS.MD5(word)
    },
    Encrypt:(word)=>{
        let keyStr = CryptoJS.enc.Utf8.parse("test@01234567890"),
            ivStr = CryptoJS.enc.Utf8.parse("0000000000000000"),
            srcs = CryptoJS.enc.Utf8.parse(JSON.stringify(word));
        let encrypted = CryptoJS.AES.encrypt(srcs, keyStr, { iv: ivStr, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        return encrypted.ciphertext.toString().toUpperCase();
    },
    Decrypt:(word) => {
        let keyStr = CryptoJS.enc.Utf8.parse("test@01234567890"),
            ivStr = CryptoJS.enc.Utf8.parse("0000000000000000"),
            encryptedHexStr = CryptoJS.enc.Hex.parse(word)
        let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
        let decrypt = CryptoJS.AES.decrypt(srcs, keyStr, {
            iv: ivStr,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        })
        let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
        if (decryptedStr)
            return JSON.parse(decryptedStr.toString())
        else
            return false
    }
}

if (typeof Object.assign != "function") {
  Object.assign = function (target) {
    "use strict";
    if (target == null) {
      throw new TypeError("Cannot convert undefined or null to object");
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}
