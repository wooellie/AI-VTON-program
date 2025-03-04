const express = require('express');
const app = express();
const port = 3000;

// 处理文件上传需要的中间件
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 上传文件保存的目录
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // 文件名
  }
});
const upload = multer({ storage: storage });
// 引入cors中间件
const cors = require('cors');
// 使用cors中间件，允许所有来源访问
app.use(cors());
// 定义接收图片的接口
app.post('/upload', upload.single('file'), function (req, res) {
  res.send('图片上传成功');
});

app.listen(port, function () {
  console.log(`服务器运行在 http://localhost:${port}`);
});