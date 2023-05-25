const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");

// 1.引入模型对象
const Schema = mongoose.Schema;

// 2.创建约束对象
const usersRule = new Schema({
  userId: {
    type: String,
    default: uuid,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    default: function () {
      return "用户" + Date.now().toString(36);
    },
  },
  role: {
    type: String,
    default: "user",
  },
  avatar: {
    type: String,
    default: "",
  },
  signature: {
    type: String,
    default: "什么也没有",
  },
  createTime: {
    type: Date,
    default: Date.now,
  },
  updateTime: {
    type: Date,
    default: Date.now,
  },
  enable_flag: {
    type: String,
    default: "Y",
  },
});

// 3.创建模型
const usersModel = mongoose.model("users", usersRule);

module.exports = usersModel;
