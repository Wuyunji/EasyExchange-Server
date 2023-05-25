const { Router } = require("express");
const cartModel = require("../model/cartModel");
const { ERROR } = require("../utils/constant");
const sessionChecker = require("../middlewire/sessionChecker");
const { body, validationResult } = require("express-validator");
const router = new Router();

router.post(
  "/updatechecked",
  sessionChecker(),
  body("userId").notEmpty().withMessage("缺少userId字段"),
  body("proId").notEmpty().withMessage("缺少proId字段"),
  body("checked").notEmpty().isBoolean().withMessage("缺少checked字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId, proId, checked } = req.body;
    cartModel
      .findOne({ userId })
      .then((data) => {
        if (data) {
          // 查询到有效的id

          // 修改数据库
          const newData = data.products.map((item) => {
            const newItem = JSON.parse(item);
            if (newItem.proId === proId) {
              newItem.checked = checked;
              return JSON.stringify(newItem);
            }
            return item;
          });

          cartModel
            .updateOne(
              { userId },
              {
                products: newData,
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
  "/batchupdatechecked",
  sessionChecker(),
  body("userId").notEmpty().withMessage("缺少userId字段"),
  body("checked").notEmpty().isBoolean().withMessage("缺少checked字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId, checked } = req.body;
    cartModel
      .findOne({ userId })
      .then((data) => {
        if (data) {
          // 查询到有效的id

          // 修改数据库
          const newData = data.products.map((item) => {
            const newItem = JSON.parse(item);
            newItem.checked = checked;
            return JSON.stringify(newItem);
          });

          cartModel
            .updateOne(
              { userId },
              {
                products: newData,
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
  "/cart/delete",
  sessionChecker(),
  body("userId").notEmpty().withMessage("缺少userId字段"),
  body("proId").notEmpty().withMessage("缺少proId字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId, proId } = req.body;
    cartModel
      .findOne({ userId })
      .then((data) => {
        if (data) {
          // 查询到有效的id

          // 修改数据库
          const newData = data.products.filter(
            (item) => JSON.parse(item).proId !== proId
          );
          cartModel
            .updateOne(
              { userId },
              {
                $set: { products: newData },
                updateTime: Date.now(),
              }
            )
            .then(() => {
              return cartModel.findOne({ userId });
            })
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
