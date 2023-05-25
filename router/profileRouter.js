const { Router } = require("express");
const bodyParser = require("body-parser");
const userModel = require("../model/userModel");
const cookieParser = require("cookie-parser");
// 引入multer 用于处理 multipart/form-data 类型的表单数据，它主要用于上传文件
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { ERROR } = require("../utils/constant");
const sessionChecker = require("../middlewire/sessionChecker");
const { query, body, check, validationResult } = require("express-validator");
const imgChecker = require("../middlewire/imgChecker");
const router = new Router();

//使用cookie-parser中间件
router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cookieParser());

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("./public")) {
      fs.mkdirSync("./public");
    }
    if (!fs.existsSync("./public/temp")) {
      fs.mkdirSync("./public/temp");
    }
    cb(null, "./public/temp/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const multerObj = multer({ storage: avatarStorage });
router.use(multerObj.any()); //any表示任意类型的文件 在路由中只能设置一次

router.get(
  "/userinfo",
  sessionChecker(),
  query("userId").notEmpty().withMessage("缺少userId字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const userId = req.query.userId;
    userModel
      .findOne({ userId })
      .then((data) => {
        if (!data) {
          throw new Error(ERROR.UNAUTHORIZED);
        }
        const { username, avatar, signature } = data;
        res.success({ status: true, data: { username, avatar, signature } });
      })
      .catch((err) => {
        console.log(err);
        throw new Error(ERROR.DATABASE);
      });
  }
);

router.post(
  "/uploadavatar",
  sessionChecker(),
  body("userId").notEmpty().withMessage("缺少userId字段"),
  imgChecker(),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId } = req.body;
    const { files } = req;
    userModel
      .findOne({ userId })
      .then((data) => {
        if (data) {
          // 查询到有效的id

          //获取原名字
          const oldName = files[0].filename;
          const originalname = files[0].originalname.split(".");
          const ext = originalname[originalname.length - 1];
          //给新名字添加一个时间戳并加上原名字的后缀
          const newName = userId + "-"+Date.now() + "." + ext;

          if (!fs.existsSync("./public")) {
            fs.mkdirSync("./public");
          }

          if (!fs.existsSync("./public/avatar")) {
            fs.mkdirSync("./public/avatar");
          }

          //改图片的名字注意此处一定是一个路径，而不是只有文件名
          const renameBefore = "./public/temp/" + oldName;
          const renameAfter = "./public/temp/" + newName;
          fs.renameSync(renameBefore, renameAfter);

          // 移动文件到指定目录
          const sourcePath = path.join(__dirname, "../", renameAfter);
          const destPath = path.join(__dirname, "../public/avatar", newName);
          const readStream = fs.createReadStream(sourcePath);
          const writeStream = fs.createWriteStream(destPath);
          readStream.pipe(writeStream);
          fs.rm(sourcePath, () => {});

          // 修改数据库中头像
          userModel
            .updateOne(
              { userId },
              {
                avatar: "/avatar/" + newName,
                updateTime: Date.now(),
              }
            )
            .then(() => {
              res.success({
                status: true,
                url: "/avatar/" + newName,
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
  "/updateusername",
  sessionChecker(),
  body("userId").notEmpty().withMessage("缺少userId字段"),
  body("username").notEmpty().withMessage("缺少username字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId, username } = req.body;
    userModel
      .findOne({ userId })
      .then((data) => {
        if (data) {
          // 查询到有效的id

          // 修改数据库中username
          userModel
            .updateOne({ userId }, { username, updateTime: Date.now() })
            .then(() => {
              res.success({
                status: true,
                username,
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
  "/updatesignature",
  sessionChecker(),
  body("userId").notEmpty().withMessage("缺少userId字段"),
  body("signature").isString().withMessage("缺少signature字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId, signature } = req.body;
    userModel
      .findOne({ userId })
      .then((data) => {
        if (data) {
          // 查询到有效的id

          // 修改数据库中signature
          userModel
            .updateOne({ userId }, { signature, updateTime: Date.now() })
            .then(() => {
              res.success({
                status: true,
                signature,
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
  "/logout",
  // sessionChecker(),
  body("userId").notEmpty().withMessage("缺少userId字段"),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
      res.badrequest({ message: errors.array()[0].msg });
      return;
    }

    const { userId } = req.body;
    userModel
      .findOne({ userId })
      .then((data) => {
        if (!data) {
          throw new Error(ERROR.DATABASE);
        }

        req.session.destroy();
        console.log(`账号 ${userId} 已成功退出`);
        res.success({ status: true, content: "账号已成功退出" });
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
