const app = getApp()

//个人信息
Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
  },

  //页面加载获取用户详细信息
  onLoad: function (params) {
    var thiz = this
    var serverUrl = app.serverUrl
    // var user = app.userInfo
    var user = app.getGlobalUserInfo()
    wx.showLoading({
      title: '请等待...',
    })
    // 调用后端
    wx.request({
      url: serverUrl + '/user/query?userId=' + user.id,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading()
        if (res.data.status == 200) {
          var userInofo = res.data.data
          // app.userInfo = res.data.data;
          app.setGlobalUserInfo(res.data.data)
          var faceUrl = "../resource/images/noneface.png"
          if (userInofo.faceImage != null && userInofo.faceImage != '' &&
            userInofo.faceImage != undefined) {
            faceUrl = serverUrl + userInofo.faceImage
          }
          thiz.setData({
            faceUrl: faceUrl,
            fansCounts: userInofo.fansCounts,
            followCounts: userInofo.followCounts,
            receiveLikeCounts: userInofo.receiveLikeCounts,
            nickname: userInofo.nickname
          })
        }
      }
    })
  },

  //注销
  logout: function () {
    // var user = app.userInfo;
    var user = app.getGlobalUserInfo()
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待...',
    })
    // 调用后端
    wx.request({
      url: serverUrl + '/logout?userId=' + user.id,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading()
        if (res.data.status == 200) {
          wx.showToast({
            title: '注销成功',
            icon: 'success',
            duration: 2000
          });
          // app.userInfo = null;
          wx.removeStorageSync("userInfo")
          // 页面跳转  
          wx.redirectTo({
            url: '../userLogin/login',
          })
        }
      }
    })
  },

  //更换头像
  changeFace: function () {
    var thiz = this
    console.log('11')
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)
        wx.showLoading({
          title: '上传中...',
        })
        var serverUrl = app.serverUrl
        var userInfo = app.getGlobalUserInfo()
        wx.uploadFile({
          url: serverUrl + '/user/uploadFace?userId=' + userInfo.id,
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            const data = JSON.parse(res.data)
            console.log(data)
            wx.hideLoading()
            if (data.status == 200) {
              wx.showToast({
                title: '上传成功',
                icon: 'success',
                duration: 2000
              });

              var imageUrl = data.data;
              thiz.setData({
                faceUrl: serverUrl + imageUrl
              })
            } else if (data.status == 200) {
              wx.showToast({
                title: data.msg
              });
            }
          }
        })
      },
    })
  },

  //上传视频
  uploadVideo: function () {
    var thiz = this
    wx.chooseVideo({
      sourceType: ['album'],
      success(res) {
        var duration = res.duration
        var temHeight = res.height
        var temWidth = res.width
        var temVideoUrl = res.tempFilePath
        var temCoverUrl = res.thumbTempFilePath
        if (duration >= 11) {
          wx.showToast({
            title: '视频长度不能超过10秒...',
            icon: "none",
            duration: 2500
          })
        } else if (duration < 1) {
          wx.showToast({
            title: '视频长度太短，请上传超过1秒的视频...',
            icon: "none",
            duration: 2500
          })
        } else {
          //打开选择bgm页面
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?duration=' + duration
              + "&temHeight=" + temHeight
              + "&temWidth=" + temWidth
              + "&temVideoUrl=" + temVideoUrl
              + "&temCoverUrl=" + temCoverUrl
            ,
          })
        }
      }
    })
  }

})