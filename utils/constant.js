const { getLocalIPv4Address } = require("../utils/getLocalIPv4Address");
const localIPv4Address = getLocalIPv4Address();

const IP = localIPv4Address;

const ALLOW_PORT = "3000";

module.exports.ERROR = {
  DATABASE: "DataBase",
  NETWORK: "Network",
  UNAUTHORIZED: "Unauthorized",
  NOTFOUND: "NotFound",
};

module.exports.ERRMSG = {
  phoneErr: "手机号码不合法",
  passwordErr: "密码格式不正确 (密码只能是 6-20 位且只包含数字、字母、下划线)",
  re_passwordErr: "两次密码输入不一致",
  phoneOrPasswordErr: "手机号码或密码输入错误",
};

module.exports.IMGERR = {
  LENGTH: "图片不能超过9张",
  SIZE: "只允许上传小于10M的图片",
  EMPTY: "图片不能为空",
  TYPE: "只允许上传jpg、jpeg、png或gif类型的图片",
};
module.exports.IPV4 = localIPv4Address;
module.exports.ALLOW_ORIGIN = `http://${IP}:${ALLOW_PORT}`;
module.exports.EASYEXCHANGE = "mongodb://127.0.0.1:27017/easyexchange";
module.exports.EASYEXCHANGE_SESSION =
  "mongodb://127.0.0.1:27017/easyexchange_session";

module.exports.ORDER_STATUS = {
  OPEN: "open",
  PROCESS: "process",
  CLOSE: "close",
};
