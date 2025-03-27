Page({
  data: {
    humanImg: '',
    garmentImg: '',
    garmentDes: '',
    resultImg: '',
    maskedImg: ''
  },

  uploadHumanImg() {
    wx.chooseImage({
      count: 1,
      success: res => {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          this.setData({ humanImg: res.tempFilePaths[0] });
        } else {
          wx.showToast({ title: '未选择图片', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  },

  uploadGarmentImg() {
    wx.chooseImage({
      count: 1,
      success: res => {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          this.setData({ garmentImg: res.tempFilePaths[0] });
        } else {
          wx.showToast({ title: '未选择图片', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  },

  inputGarmentDes(e) {
    this.setData({ garmentDes: e.detail.value });
  },

  submitTryon() {
    if (!this.data.humanImg || !this.data.garmentImg || !this.data.garmentDes) {
      wx.showToast({ title: '请上传图片和文本描述', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '生成中...' });

    const uploadTaskHuman = wx.uploadFile({
      url: 'http://127.0.0.1:3000/tryon',
      filePath: this.data.humanImg,
      name: 'human_img',
      formData: {
        garment_des: this.data.garmentDes,
        use_auto_mask: 'true',
        use_auto_crop: 'false',
        denoise_steps: '30',
        seed: '42'
      },
      success: res => {
        try {
          const data = JSON.parse(res.data);
          if (data.error) {
            wx.showToast({ title: data.error, icon: 'none' });
          } else {
            this.uploadGarment(data.masked_image); // Pass masked image URL if needed for subsequent upload
          }
        } catch (error) {
          console.error('解析人体图片上传响应失败', error);
          wx.showToast({ title: '人体图片上传失败，服务器响应格式错误', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '模特图片上传失败', icon: 'none' });
      },
      complete: () => {
        // wx.hideLoading(); // Hide loading will be handled in the second upload's complete
      }
    });
  },

  uploadGarment(maskedImageUrl) { // Receive masked image URL if needed
    wx.uploadFile({
      url: 'http://127.0.0.1:3000/tryon',
      filePath: this.data.garmentImg,
      name: 'garment_img',
      formData: {
        garment_des: this.data.garmentDes,
        use_auto_mask: 'true',
        use_auto_crop: 'false',
        denoise_steps: '30',
        seed: '42',
        masked_image_url: maskedImageUrl // Send masked image URL to the server if required
      },
      success: res => {
        try {
          const data = JSON.parse(res.data);
          if (data.error) {
            wx.showToast({ title: data.error, icon: 'none' });
          } else {
            this.setData({
              resultImg: 'http://127.0.0.1:3000' + data.result_image,
              maskedImg: 'http://127.0.0.1:3000' + data.masked_image
            });
          }
        } catch (error) {
          console.error('解析服饰图片上传响应失败', error);
          wx.showToast({ title: '服饰图片上传失败，服务器响应格式错误', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '服饰上传失败', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  downloadResultImg() {
    this.downloadImage(this.data.resultImg, 'result_image.jpg');
  },

  downloadMaskedImg() {
    this.downloadImage(this.data.maskedImg, 'masked_image.jpg');
  },

  downloadImage(url, fileName) {
    if (!url) {
      wx.showToast({ title: '图片地址为空，无法下载', icon: 'none' });
      return;
    }
    wx.downloadFile({
      url: url,
      success: res => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.showToast({ title: '图片已保存到相册', icon: 'success' });
            },
            fail: err => {
              if (err.errMsg.includes('auth deny')) {
                wx.showModal({
                  title: '需要授权',
                  content: '请允许保存到相册以下载图片',
                  success: res => {
                    if (res.confirm) {
                      wx.openSetting({
                        success: settingRes => {
                          if (settingRes.authSetting['scope.writePhotosAlbum']) {
                            this.downloadImage(url, fileName); // Retry
                          }
                        }
                      });
                    }
                  }
                });
              } else {
                wx.showToast({ title: '保存失败', icon: 'none' });
              }
            }
          });
        } else {
          wx.showToast({ title: `下载失败，状态码：${res.statusCode}`, icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，无法下载', icon: 'none' });
      }
    });
  },
});