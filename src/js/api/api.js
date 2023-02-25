/** 登录接口
 * @param {Object} params
 * @returns 
 */
const login = (params) => {
  return request({
    url: "/ddd.com",
    data: params
  });
};
