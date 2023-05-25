const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");
// 1.引入模型对象
const Schema = mongoose.Schema;

// 2.创建约束对象
const cartsRule = new Schema({
  cartId: {
    type: String,
    default: uuid,
  },
  userId: {
    type: String,
    required: true,
  },
  products: {
    type: Array,
    default: [],
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
const cartModel = mongoose.model("carts", cartsRule);

module.exports = cartModel;
