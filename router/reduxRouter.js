const { Router } = require("express");
const productModel = require("../model/productModel");
const cartModel = require("../model/cartModel");
const sessionChecker = require("../middlewire/sessionChecker");
const { query, validationResult } = require("express-validator");
const { ERROR } = require("../utils/constant");
const router = new Router();

router.get(
  "/getStore",
  sessionChecker(),
  query("userId").notEmpty().withMessage("缺少userId字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId } = req.query;
    const p1 = productModel.find({
      collect: {
        $in: [userId],
      },
    });
    const p2 = cartModel.find({ userId });

    Promise.all([p1, p2])
      .then(([data1, data2]) => {
        const data = {
          collect: [],
          cart: data2[0]?.products ?? [],
        };
        data1.forEach((item) => {
          data.collect.push(item.proId);
        });
        res.success(data);
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
