const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");
const { ORDER_STATUS } = require("../utils/constant");
// 1.引入模型对象
const Schema = mongoose.Schema;

// 2.创建约束对象
const ordersRule = new Schema({
  orderId: {
    type: String,
    default: uuid,
  },
  userId: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  products: {
    type: String,
    default: "",
  },
  payment: {
    type: Number,
    default: 0,
  },
  paymentType: {
    type: String,
    default: "online",
  },
  paymentTime: {
    type: Date,
    default: null,
  },
  closeTime: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    default: ORDER_STATUS.OPEN,
  },
  createTime: {
    type: Date,
    default: Date.now,
  },
  updateTime: {
    type: Date,
    default: Date.now,
  },
});

// 3.创建模型
const orderModel = mongoose.model("orders", ordersRule);

module.exports = orderModel;
