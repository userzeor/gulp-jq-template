// 设置请求拦截器
$.ajaxSetup({
  beforeSend: function (xhr, settings) {
    console.log(settings)
    // if (settings.url.indexOf("匹配的url") > 0) {
    //   return false;
    // }
    // 返回 true 表示不进行拦截
    return true;
  },
});

/**
 * 请求函数
 * @param {Object} options 
 * @returns {Promise<Object>}
 */
const request = (options) => {
  // 设置请求
  return $.ajax({
    url: '/* @echo BASE_URL */' + options.url,
    ...options
  });
};
