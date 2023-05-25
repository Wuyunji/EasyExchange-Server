const { Router } = require("express");
const cookieParser = require("cookie-parser");
const productModel = require("../model/productModel");
const orderModel = require("../model/orderModel");
const { ERROR, ORDER_STATUS } = require("../utils/constant");
const sessionChecker = require("../middlewire/sessionChecker");
const { query, body, validationResult } = require("express-validator");

const router = new Router();

//使用cookie-parser中间件
router.use(cookieParser());

router.get(
  "/order/allorder",
  sessionChecker(),
  query("userId").notEmpty().withMessage("缺少userId字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId } = req.query;
    orderModel
      .find({ userId })
      .then((data) => {
        res.success(data);
      })
      .catch(() => {
        throw new Error(ERROR.DATABASE);
      });
  }
);

router.get(
  "/order/oneorder",
  sessionChecker(),
  query("userId").notEmpty().withMessage("缺少userId字段"),
  query("orderId").notEmpty().withMessage("缺少orderId字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId, orderId } = req.query;
    orderModel
      .find({ userId,orderId })
      .then((data) => {
        res.success(data);
      })
      .catch(() => {
        throw new Error(ERROR.DATABASE);
      });
  }
);

router.post(
  "/order/create",
  sessionChecker(),
  body("userId").notEmpty().withMessage("缺少userId字段"),
  body("phone").notEmpty().withMessage("缺少phone字段"),
  body("products").notEmpty().withMessage("缺少products字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId, phone, products } = req.body;

    const order = new orderModel({
      userId,
      phone,
      products,
    });

    order
      .save()
      .then((data) => {
        res.success(data);
      })
      .catch((err) => {
        console.log(err);
        throw new Error(ERROR.DATABASE);
      });
  }
);

router.post(
  "/order/update",
  sessionChecker(),
  body("userId").notEmpty().withMessage("缺少userId字段"),
  body("orderId").notEmpty().withMessage("缺少orderId字段"),
  body("payment").notEmpty().withMessage("缺少payment字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId, orderId, payment } = req.body;
    orderModel
      .findOne({ userId, orderId })
      .then((data) => {
        if (data) {
          if (data.status === ORDER_STATUS.PROCESS) {
            res.success({ status: false, message: "订单正在进行中", data });
            return;
          } else if (data.status === ORDER_STATUS.CLOSE) {
            res.success({ status: false, message: "订单已关闭", data });
            return;
          }
          
          const products = JSON.parse(data.products);
          const promiseArr = products.map(({ proId }) => {
            return productModel.findOne({ proId });
          });
          Promise.all(promiseArr)
            .then((results) => {
              let totalPrice = 0; //选中商品的总价格
              for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const item = products[i];
                if (result) {
                  const price = result.price;
                  const stock = result.stock;
                  const count = item.count;
                  // 累计价格
                  totalPrice += price * count;
                  if (count > stock) {
                    res.success({ status: false, message: "库存不足", result });
                    return;
                  }
                } else {
                  throw new Error(ERROR.NOTFOUND);
                }
              }
              if (Math.abs(totalPrice - payment) >= Number.EPSILON) {
                res.success({
                  status: false,
                  message: "支付金额不正确",
                  totalPrice,
                  payment,
                });
                return;
              }

              // 操作数据库
              orderModel
                .findOne({ userId, orderId })
                .then((data) => {
                  if (data) {
                    orderModel
                      .updateOne(
                        { userId, orderId },
                        {
                          payment,
                          status: "process",
                          paymentTime: Date.now(),
                          updateTime: Date.now(),
                        }
                      )
                      .then(() => {
                        return orderModel.findOne({ userId, orderId });
                      })
                      .then((data) => {
                        if (data) {
                          res.success(data);
                        } else {
                          throw new Error(ERROR.NOTFOUND);
                        }
                      })
                      .catch((err) => {
                        console.log(err);
                        throw new Error(ERROR.DATABASE);
                      });
                  } else {
                    throw new Error(ERROR.NOTFOUND);
                  }
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
        } else {
          throw new Error(ERROR.NOTFOUND);
        }
      })
      .catch((err) => {
        console.log(err);
        throw new Error(ERROR.DATABASE);
      });
  }
);

router.post(
  "/order/close",
  sessionChecker(),
  body("userId").notEmpty().withMessage("缺少userId字段"),
  body("orderId").notEmpty().withMessage("缺少orderId字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId, orderId } = req.body;
    orderModel
      .findOne({ userId, orderId })
      .then((data) => {
        if (data) {
          if (data.status === ORDER_STATUS.OPEN) {
            res.success({ status: false, message: "订单正在创建", data });
            return;
          } else if (data.status === ORDER_STATUS.CLOSE) {
            res.success({ status: false, message: "订单已关闭", data });
            return;
          }
          orderModel
            .updateOne(
              { userId, orderId },
              {
                status: "close",
                closeTime: Date.now(),
                updateTime: Date.now(),
              }
            )
            .then(() => {
              return orderModel.findOne({ userId, orderId });
            })
            .then((data) => {
              if (data) {
                res.success(data);
              } else {
                throw new Error(ERROR.NOTFOUND);
              }
            })
            .catch((err) => {
              console.log(err);
              throw new Error(ERROR.DATABASE);
            });
        } else {
          throw new Error(ERROR.NOTFOUND);
        }
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
