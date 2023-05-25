// 引入express-session模块
const session = require("express-session");
// 引入connect-mongo 用于session持久化
const MongoStore = require("connect-mongo");
const { EASYEXCHANGE_SESSION } = require("../utils/constant");

const sessionHandler = session({
  name: "_id", //返回给客户端我的cookie的key
  secret: "easyexchange", //参与加密的字符串
  saveUninitialized: false, //是否在存储内容之前创建session会话 默认true
  resave: true, //是否在请求时强制重新保存session
  store: MongoStore.create({
    mongoUrl: EASYEXCHANGE_SESSION,
    touchAfter: 24 * 3600,
  }),
  cookie: {
    httpOnly: false, //设置js脚本是否能读取cookie
    maxAge: 1000 * 60 * 60, //60分钟
  },
});

module.exports = function () {
  return sessionHandler;
};
