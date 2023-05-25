const { Router } = require("express");
const cookieParser = require("cookie-parser");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");
const cartModel = require("../model/cartModel");
const { ERROR } = require("../utils/constant");
const sessionChecker = require("../middlewire/sessionChecker");
const { query, body, validationResult } = require("express-validator");

const router = new Router();

//使用cookie-parser中间件
router.use(cookieParser());

router.get(
  "/detail",
  query("proId").notEmpty().withMessage("缺少proId字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const proId = req.query.proId;
    productModel
      .find({ proId })
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
  "/detail/shop",
  query("userId").notEmpty().withMessage("缺少userId字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const userId = req.query.userId;
    const p1 = productModel.find({ owner: userId });
    const p2 = userModel.find({ userId });

    Promise.all([p1, p2])
      .then(([data1, data2]) => {
        let goodsCount = 0;
        let collectCount = 0;
        for (let i = 0; i < data1.length; i++) {
          goodsCount += data1[i].stock;
          collectCount += data1[i].collect.length;
        }

        const username = data2[0].username;
        const avatar = data2[0].avatar;

        res.success({
          status: true,
          data: {
            goodsCount,
            collectCount,
            username,
            avatar,
          },
        });
      })
      .catch((err) => {
        console.log(err);
        throw new Error(ERROR.DATABASE);
      });
  }
);

router.post(
  "/updatecollect",
  sessionChecker(),
  body("userId").notEmpty().withMessage("缺少userId字段"),
  body("proId").notEmpty().withMessage("缺少proId字段"),
  body("isCollect").notEmpty().isBoolean().withMessage("缺少isCollect字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }
    const { userId, proId, isCollect } = req.body;
    userModel
      .findOne({ userId })
      .then((data) => {
        if (data) {
          // 查询到有效的id

          // 修改数据库
          const action = isCollect ? "$push" : "$pull";
          const op = isCollect ? "$each" : "$in";
          productModel
            .updateOne(
              { proId },
              {
                [action]: { collect: { [op]: [userId] } },
                updateTime: Date.now(),
              }
            )
            .then(() => {
              res.success({
                status: true,
              });
            })
            .catch((err) => {
              console.log(err);
              throw new Error(ERROR.DATABASE);
            });
        } else {
          // 没查到id或用户篡改了cookie
          throw new Error(ERROR.UNAUTHORIZED);
        }
      })
      .catch((err) => {
        console.log(err);
        throw new Error(ERROR.DATABASE);
      });
  }
);

router.post(
  "/updatecart",
  sessionChecker(),
  body("userId").notEmpty().withMessage("缺少userId字段"),
  body("product").notEmpty().withMessage("缺少product字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId, product } = req.body;
    userModel
      .findOne({ userId })
      .then((data) => {
        if (data) {
          // 查询到有效的id
          // 修改数据库
          cartModel
            .findOne({ userId })
            .then((data) => {
              const goods = JSON.parse(product);
              const count = goods.count;

              const handler = (data) => {
                const products = data.products;
                const len = products.length;

                let index = -1;
                for (let i = 0; i < len; i++) {
                  const item = products[i];
                  const parsedItem = JSON.parse(item);
                  if (parsedItem.proId === goods.proId) {
                    index = i;
                    break;
                  }
                }

                // 如果存在此商品 那么修改它的值
                if (index !== -1) {
                  const newProduct = JSON.parse(products[index]);
                  newProduct.count = count;
                  // 如果count值为0说明需要删除此商品
                  const action =
                    count === 0
                      ? { $pull: { products: { $eq: products[index] } } }
                      : {
                          $set: {
                            [`products.${index}`]: JSON.stringify(newProduct),
                          },
                        };

                  cartModel
                    .updateOne({ userId }, action)
                    .then((data) => {
                      res.success({
                        status: true,
                        data,
                      });
                    })
                    .catch((err) => {
                      console.log(err);
                      throw new Error(ERROR.DATABASE);
                    });
                } else {
                  goods.count = count;
                  cartModel
                    .updateOne(
                      { userId },
                      {
                        $push: { products: JSON.stringify(goods) },
                      }
                    )
                    .then((data) => {
                      res.success({
                        status: true,
                        data,
                      });
                    })
                    .catch((err) => {
                      console.log(err);
                      throw new Error(ERROR.DATABASE);
                    });
                }
              };

              // 如过userId不存在cart 那么先创建一个cart
              if (!data) {
                cartModel
                  .create({
                    userId,
                  })
                  .then((res) => {
                    handler(res);
                  })
                  .catch((err) => {
                    console.log(err);
                    throw new Error(ERROR.DATABASE);
                  });
              } else {
                handler(data);
              }
            })
            .catch((err) => {
              console.log(err);
              throw new Error(ERROR.DATABASE);
            });
        } else {
          // 没查到id或用户篡改了cookie
          throw new Error(ERROR.UNAUTHORIZED);
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
