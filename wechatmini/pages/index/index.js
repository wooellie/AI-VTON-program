// index.js
Page({
  data: {
    imagePath: ''
  },
  // 选择图片的方法
  chooseImage: function () {
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          imagePath: tempFilePaths[0]
        });
      }
    });
  }
});
