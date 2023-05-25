// 引入express库
const express = require("express");
// 创建一个全局express对象
const app = express();
// 禁止服务器返回x-powered-by
app.disable("x-powered-by");
// 引入中间件
const sessionHandler = require("./middlewire/sessionHandler");
const errorHandler = require("./middlewire/errorHandler");
const responseFormatter = require("./middlewire/responseFormatter");
// 引入路由器
const loginRegisterRouter = require("./router/loginRegisterRouter");
const profileRouter = require("./router/profileRouter");
const productRouter = require("./router/productRouter");
const homeRouter = require("./router/homeRouter");
const detailRouter = require("./router/detailRouter");
const mygoodsRouter = require("./router/mygoodsRouter");
const myCollectRouter = require("./router/myCollectRouter");
const reduxRouter = require("./router/reduxRouter");
const cartRouter = require("./router/cartRouter");
const paymentRouter = require("./router/paymentRouter");

// 引入connectMongoDB模块 用于连接数据库
const connectMongoDB = require("./db/db");
// 引入常量
const { EASYEXCHANGE, ALLOW_ORIGIN, IPV4 } = require("./utils/constant");

// 允许所有来自本地3000端口的跨域请求
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true"); //允许携带cookie
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

// 将静态资源托管，这样才能在浏览器上直接访问预览图片或则html页面
app.use(express.static("./public"));
// 配置session
app.use(sessionHandler());
// 统一格式化返回数据格式
app.use(responseFormatter());

// 配置路由
app.use(loginRegisterRouter());
app.use(profileRouter());
app.use(productRouter());
app.use(homeRouter());
app.use(detailRouter());
app.use(mygoodsRouter());
app.use(myCollectRouter());
app.use(reduxRouter());
app.use(cartRouter());
app.use(paymentRouter());

// 统一处理错误
app.use(errorHandler());

// 启用数据库
connectMongoDB(EASYEXCHANGE)
  .then(() => {
    console.log("数据库连接成功");
    // 数据库启用成功后监听端口
    app.listen(8000, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(IPV4 + " : " + 8000 + "端口正在监听...");
      }
    });
  })
  .catch((err) => {
    console.log("数据库连接失败");
    console.log(err);
  });
