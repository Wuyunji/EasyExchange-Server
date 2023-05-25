const mongoose = require("mongoose");

// 1.引入模型对象
const Schema = mongoose.Schema;

// 2.创建约束对象
const productsRule = new Schema({
  //商品ID
  proId: {
    type: String,
    required: true,
  },
  // 所属用户
  owner: {
    type: String,
    required: true,
  },
  //商品名字
  proName: {
    type: String,
    required: true,
  },
  //商品主图片
  mainImage: {
    type: Array,
    required: true,
  },
  //商品子图片
  subImage: {
    type: Array,
    default: [],
  },
  //详细描述
  detail: {
    type: String,
    default: "",
  },
  //商品价格
  price: {
    type: Number,
    require: true,
  },
  //库存
  stock: {
    type: Number,
    require: true,
  },
  //商品状态
  status: {
    type: String,
    default: "onsell",
  },
  // 收藏
  collect: {
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
const productsModel = mongoose.model("products", productsRule);

module.exports = productsModel;
