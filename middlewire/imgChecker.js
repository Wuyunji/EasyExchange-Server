const { IMGERR } = require("../utils/constant");
const { check } = require("express-validator");

const imgChecker = check("files").custom((value, { req }) => {
  if (!req.files || req.files.length < 1) {
    throw new Error(IMGERR.EMPTY);
  }
  if (!req.files.length > 9) {
    throw new Error(IMGERR.LENGTH);
  }
  const reg = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
  for (let i = 0; i < req.files.length; i++) {
    if (!reg.test(req.files[i].originalname)) {
      throw new Error(IMGERR.TYPE);
    }
    if (req.files[i].size > 1024 * 1024 * 10) {
      throw new Error(IMGERR.SIZE);
    }
  }
  return true;
});

module.exports = function () {
  return imgChecker;
};
