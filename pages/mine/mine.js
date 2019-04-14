const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
  },

  onLoad: function(params) {
    var thiz = this
    var serverUrl = app.serverUrl
    var user = app.userInfo
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
      success: function(res) {
        console.log(res.data);
        wx.hideLoading()
        if (res.data.status == 200) {
          var userInofo = res.data.data
          app.userInfo = res.data.data;
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

  logout: function() {
    var user = app.userInfo;
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
      success: function(res) {
        console.log(res.data);
        wx.hideLoading()
        if (res.data.status == 200) {
          wx.showToast({
            title: '注销成功',
            icon: 'success',
            duration: 2000
          });
          app.userInfo = null;
          // 页面跳转  
          wx.redirectTo({
            url: '../userLogin/login',
          })
        }
      }
    })
  },

  changeFace: function() {
    var thiz = this
    console.log('11')
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function(res) {
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)
        var serverUrl = app.serverUrl
        wx.showLoading({
          title: '上传中...',
        })
        wx.uploadFile({
          url: serverUrl + '/user/uploadFace?userId=' + app.userInfo.id,
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
  }

})