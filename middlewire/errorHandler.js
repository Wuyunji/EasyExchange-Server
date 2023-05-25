const { ERROR } = require("../utils/constant");

const errorHandler = (err, req, res, next) => {
  console.log(err);
  const message = err.message;
  switch (message) {
    case ERROR.DATABASE:
      res.fail("网络不稳定，请稍后重试");
      break;
    case ERROR.NETWORK:
      res.fail("网络不稳定，请稍后重试");
      break;
    case ERROR.UNAUTHORIZED:
      res.unauthorized("请重新登录");
      break;
    case ERROR.NOTFOUND:
      res.fail("数据不存在");
      break;
    default:
      res.fail("未知的错误");
  }

  next();
};

module.exports = function () {
  return errorHandler;
};
