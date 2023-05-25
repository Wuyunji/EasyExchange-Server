const { Router } = require("express");
const productModel = require("../model/productModel");
const { ERROR } = require("../utils/constant");
const sessionChecker = require("../middlewire/sessionChecker");
const { query, validationResult } = require("express-validator");
const router = new Router();

router.get(
  "/mygoods",
  sessionChecker(),
  query("userId").notEmpty().withMessage("缺少userId字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const userId = req.query.userId;
    productModel
      .find({ owner: userId })
      .then((data) => {
        res.success({ status: true, data, length: data.length });
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
