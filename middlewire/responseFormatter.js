const { v4: uuid } = require("uuid");

const responseFormatter = function (req, res, next) {
  res.success = (data) => {
    res.status(200).json({
      code: 200, //响应状态码
      data: data, //响应数据
      message: null,
      timestamp: Date.now(),
      traceId: uuid(),
    });
  };

  res.fail = (message) => {
    res.status(500).json({
      code: 500, //响应状态码
      data: null,
      message: message, //响应错误
      timestamp: Date.now(),
      traceId: uuid(),
    });
  };

  res.badrequest = (message) => {
    res.status(400).json({
      code: 400, //响应状态码
      data: null,
      message: message, //响应错误
      timestamp: Date.now(),
      traceId: uuid(),
    });
  };

  res.unauthorized = (message) => {
    res.status(401).json({
      code: 401, //响应状态码
      data: null,
      message: message, //响应错误
      timestamp: Date.now(),
      traceId: uuid(),
    });
  };

  next();
};

module.exports = function () {
  return responseFormatter;
};
