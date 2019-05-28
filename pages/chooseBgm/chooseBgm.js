const app = getApp()

//背景音乐选择
Page({
  data: {
    bgmList: [],
    serverUrl: '',
    videoParams: {}
  },

  //页面加载时获取背景音乐列表
  onLoad: function(params) {
    var thiz = this
    thiz.setData({
      videoParams: params
    })
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待...',
    })
    // 调用后端
    wx.request({
      url: serverUrl + '/bgm/list',
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading()
        if (res.data.status == 200) {
          var bgmList = res.data.data
          thiz.setData({
            bgmList: bgmList,
            serverUrl: serverUrl
          })
        }
      }
    })
  },

  //上传视频
  upload: function(e) {
    var thiz = this;
    console.log(e)
    var bgmId = e.detail.value.bgmId
    var desc = e.detail.value.desc


    var duration = thiz.data.videoParams.duration
    var temHeight = thiz.data.videoParams.temHeight
    var temWidth = thiz.data.videoParams.temWidth
    var temVideoUrl = thiz.data.videoParams.temVideoUrl
    var temCoverUrl = thiz.data.videoParams.temCoverUrl

    //上传短视频
    wx.showLoading({
      title: '上传中...',
    })
    var serverUrl = app.serverUrl
    var userInfo = app.getGlobalUserInfo()
    wx.uploadFile({
      url: serverUrl + '/video/upload',
      formData: {
        userId: userInfo.id,
        bgmId: bgmId,
        desc: desc,
        videoSeconds: duration,
        videoHeight: temHeight,
        videoWidth: temWidth
      },
      filePath: temVideoUrl,
      name: 'file',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        const data = JSON.parse(res.data)
        console.log(res)
        wx.hideLoading()
        if (data.status == 200) {
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });
          wx.navigateBack({
            delta: 1,
          })
        } else {
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
      }
    })
  }
})