const { ERROR } = require("../utils/constant");
const userModel = require("../model/userModel");

const sessionChecker = function (req, res, next) {
  const { _id } = req.session;
  if (_id) {
    userModel
      .findOne({ _id })
      .then((data) => {
        if (data) {
          // 查询到有效的id
          next();
        } else {
          // 没查到id或用户篡改了cookie
          throw new Error(ERROR.UNAUTHORIZED);
        }
      })
      .catch((err) => {
        console.log(err);
        throw new Error(ERROR.DATABASE);
      });
  } else {
    // 用户的cookie过期了 或 清除了浏览器缓存 或 没有登录过
    throw new Error(ERROR.UNAUTHORIZED);
  }
};

module.exports = function () {
  return sessionChecker;
};
