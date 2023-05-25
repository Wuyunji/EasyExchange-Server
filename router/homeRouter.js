const { Router } = require("express");
const productModel = require("../model/productModel");
const orderModel = require("../model/orderModel");
const { ERROR, ORDER_STATUS } = require("../utils/constant");
const { query, validationResult } = require("express-validator");
const sessionChecker = require("../middlewire/sessionChecker");
const { RecommendUserService } = require("../utils/recommend");
const router = new Router();

router.get(
  "/home/data",
  query("page").notEmpty().withMessage("缺少page字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const page = parseInt(req.query.page);
    const pageSize = 3;

    productModel
      .find()
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .then((data) => {
        res.success({ status: true, data, length: data.length });
      })
      .catch((err) => {
        console.log(err);
        throw new Error(ERROR.DATABASE);
      });
  }
);

router.get(
  "/home/search",
  query("page").notEmpty().withMessage("缺少page字段"),
  query("search").notEmpty().withMessage("缺少search字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const search = req.query.search;
    const page = parseInt(req.query.page);
    const pageSize = 3;

    const searchReg = new RegExp(search, "i");
    productModel
      .find({ proName: searchReg })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .then((data) => {
        res.success({ status: true, data, length: data.length });
      })
      .catch((err) => {
        console.log(err);
        throw new Error(ERROR.DATABASE);
      });
  }
);
const parseDataToUserIdAndGoodsId = (data) => {
  const ans = [];
  data.forEach((order) => {
    const userId = order.userId;
    const products = JSON.parse(order.products);
    products.forEach((product) => {
      ans.push({
        userId,
        goodsId: product.proId,
      });
    });
  });
  return ans;
};
router.get(
  "/home/recommend",
  sessionChecker(),
  query("userId").notEmpty().withMessage("缺少userId字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    orderModel
      .find({ status: { $in: [ORDER_STATUS.PROCESS, ORDER_STATUS.CLOSE] } })
      .then((data) => {
        const parsedData = parseDataToUserIdAndGoodsId(data);
        const userId = req.query.userId;
        const n = 10;
        const recommendUserService = new RecommendUserService(
          parsedData,
          userId,
          n
        );
        const result = recommendUserService.start();

        productModel
          .find({ proId: { $in: result } })
          .then((data) => {
            res.success({ status: true, data });
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
  }
);

module.exports = function () {
  return router;
};
