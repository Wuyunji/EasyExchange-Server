const { Router } = require("express");
const bodyParser = require("body-parser");
const productModel = require("../model/productModel");
const cookieParser = require("cookie-parser");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");
const { ERROR } = require("../utils/constant");
const sessionChecker = require("../middlewire/sessionChecker");
const { body, validationResult } = require("express-validator");
const imgChecker = require("../middlewire/imgChecker");
const router = new Router();

router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post(
  "/uploadproduct",
  sessionChecker(),
  body("owner").notEmpty().withMessage("缺少owner字段"),
  body("name").notEmpty().withMessage("缺少name字段"),
  body("price").notEmpty().withMessage("缺少price字段"),
  body("stock").notEmpty().withMessage("缺少stock字段"),
  imgChecker(),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { files } = req;
    const { owner, name, detail = "", price, stock } = req.body;
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      //获取原名字
      const oldName = files[i].filename;
      const originalname = files[i].originalname.split(".");
      const ext = originalname[originalname.length - 1];
      //给新名字加上原来的后缀
      const newId = uuid();
      const newName = newId + "." + ext;

      if (!fs.existsSync("./public")) {
        fs.mkdirSync("./public");
      }

      if (!fs.existsSync("./public/imgs")) {
        fs.mkdirSync("./public/imgs");
      }

      //改图片的名字注意此处一定是一个路径，而不是只有文件名
      const renameBefore = "./public/temp/" + oldName;
      const renameAfter = "./public/temp/" + newName;
      fs.renameSync(renameBefore, renameAfter);

      // 移动文件到指定目录
      const sourcePath = path.join(__dirname, "../", renameAfter);
      const destPath = path.join(__dirname, "../public/imgs", newName);
      const readStream = fs.createReadStream(sourcePath);
      const writeStream = fs.createWriteStream(destPath);
      readStream.pipe(writeStream);
      fs.rm(sourcePath, () => {});
      urls[i] = "/imgs/" + newName;
    }

    // 存入数据库
    productModel
      .create({
        proId: uuid(),
        owner,
        proName: name,
        price: Number(price),
        stock: Number(stock),
        mainImage: urls[0],
        subImage: urls.slice(1),
        detail,
      })
      .then(() => {
        res.success({ status: true, urls });
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
