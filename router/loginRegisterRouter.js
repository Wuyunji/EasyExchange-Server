const { Router } = require("express");
const bodyParser = require("body-parser");
const md5 = require("md5");
const userModel = require("../model/userModel");
const { ERROR, ERRMSG } = require("../utils/constant");

const router = new Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post("/register", (req, res) => {
  // 1.获取输入
  const { phone, password, re_password } = req.body;
  // 2.验证数据
  const phoneReg = /^\d{11}$/;
  const passwordReg = /^[a-zA-Z0-9_]{6,20}$/;
  const errMsg = {};
  if (!phoneReg.test(phone)) {
    errMsg.phoneErr = ERRMSG.phoneErr;
  }
  if (!passwordReg.test(password)) {
    errMsg.passwordErr = ERRMSG.passwordErr;
  }
  if (password !== re_password) {
    errMsg.re_passwordErr = ERRMSG.re_passwordErr;
  }
  if (Object.keys(errMsg).length !== 0) {
    res.success({ status: false, errMsg });
    return;
  }

  // 3.数据库写入
  userModel
    .findOne({ phone })
    .then((data) => {
      if (data) {
        console.log(`手机号码${phone}注册失败，因为手机号码已被注册`);
        errMsg.phoneErr = `手机号码已被注册`;
        res.success({ status: false, errMsg });
        return;
      }
      userModel
        .create({
          phone,
          password: md5(password), //对密码加密
        })
        .then(() => {
          console.log(`手机号码${phone}注册成功`);
          res.success({ status: true, content: `注册成功` });
        })
        .catch((err) => {
          console.log(err);
          throw new Error(ERROR.DATABASE);
        });
    })
    .catch((err) => {
      console.log(err);
      throw new Error(ERROR.DATABASE);
    });
});

router.post("/login", (req, res) => {
  // 1.获取输入
  const { phone, password } = req.body;
  // 2.验证数据
  const phoneReg = /^\d{11}$/;
  const passwordReg = /^[a-zA-Z0-9_]{6,20}$/;
  const errMsg = {};
  if (!phoneReg.test(phone)) {
    errMsg.phoneErr = ERRMSG.phoneErr;
  }
  if (!passwordReg.test(password)) {
    errMsg.passwordErr = ERRMSG.passwordErr;
  }
  if (Object.keys(errMsg).length !== 0) {
    res.success({ status: false, errMsg });
    return;
  }

  // 3.数据库查找
  userModel
    .findOne({ phone, password: md5(password) })
    .then((data) => {
      if (data) {
        if (req.session && req.session._id) {
          res.success({ status: true, content: "第N次登录", data });
        } else {
          req.session._id = data._id.toString(); //将数据存入session
          res.success({ status: true, content: "第一次登录", data });
        }
      } else {
        errMsg.loginErr = ERRMSG.phoneOrPasswordErr;
        res.success({ status: false, errMsg });
      }
    })
    .catch((err) => {
      console.log(err);
      throw new Error(ERROR.DATABASE);
    });
});

module.exports = function () {
  return router;
};
