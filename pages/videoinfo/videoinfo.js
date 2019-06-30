var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    cover: "cover",
    videoId: "",
    src: "",
    videoInfo: {},

    userLikeVideo: false
  },

  videoCtx: {},

  onLoad: function(params) {
    var thiz = this;
    thiz.videoCtx = wx.createVideoContext("myVideo", thiz)

    //获取上一个页面传入的参数
    var videoInfo = JSON.parse(params.videoInfo)

    var height = videoInfo.videoHeight
    var width = videoInfo.videoWidth
    var cover = "cover"
    if (width >= height) {
      cover = ""
    }

    thiz.setData({
      videoId: videoInfo.id,
      src: app.serverUrl + "/" + videoInfo.videoPath.replace("fileSpace", ""),
      videoInfo: videoInfo,
      cover: cover
    })

    var serverUrl = app.serverUrl
    var user = app.getGlobalUserInfo()
    var loginUserId = ""
    if (user != null && user != undefined && user != '') {
      loginUserId = user.id
    }
    wx.request({
      url: serverUrl + '/user/queryPublisher?loginUserId=' + loginUserId + '&videoId=' +
        videoInfo.id + "&publishUserId=" + videoInfo.userId,
      method: "POST",
      success: function(res) {
        console.log(res.data)

        var publisher = res.data.data.publisher
        var userLikeVideo = res.data.data.userLikeVideo

        thiz.setData({
          serverUrl: serverUrl,
          publisher: publisher,
          userLikeVideo: userLikeVideo
        })
      }
    })
  },

  onShow: function() {
    var thiz = this;
    thiz.videoCtx.play()
  },

  onHide: function() {
    var thiz = this;
    thiz.videoCtx.pause()
  },

  showSearch: function() {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },

  showPublisher: function() {
    var thiz = this
    var user = app.getGlobalUserInfo()
    var videoInfo = thiz.data.videoInfo
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + videoInfo.userId,
      })
    }

  },

  upload: function() {
    var thiz = this
    var user = app.getGlobalUserInfo()
    var videoInfo = JSON.stringify(thiz.data.videoInfo)
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      videoUtil.uploadVideo()

    }

  },

  showIndex: function() {
    wx.redirectTo({
      url: '../index/index',
    })
  },

  showMine: function() {
    var user = app.getGlobalUserInfo()
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },

  likeVideoOrNot: function() {
    var thiz = this
    var videoInfo = thiz.data.videoInfo
    var user = app.getGlobalUserInfo()
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
      var userLikeVideo = thiz.data.userLikeVideo
      var url = "/video/userLike?userId=" + user.id + '&videoId=' + videoInfo.id +
        '&videoCreatorId=' + videoInfo.userId
      if (userLikeVideo) {
        url = "/video/userUnLike?userId=" + user.id + '&videoId=' + videoInfo.id +
          '&videoCreatorId=' + videoInfo.userId
      }

      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '...',
      })
      wx.request({
        url: serverUrl + url,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'userId': user.id,
          'userToken': user.userToken
        },
        success: function(res) {
          wx.hideLoading()
          thiz.setData({
            userLikeVideo: !userLikeVideo
          })
        }
      })
    }
  },

  shareMe: function() {
    var me = this;
    var user = app.getGlobalUserInfo();

    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到QQ空间', '分享到微博'],
      success: function(res) {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          // 下载
          wx.showLoading({
            title: '下载中...',
          })
          wx.downloadFile({
            url: app.serverUrl + me.data.videoInfo.videoPath,
            success: function(res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                console.log(res.tempFilePath);

                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function(res) {
                    console.log(res.errMsg)
                    wx.hideLoading();
                  }
                })
              }
            }
          })
        } else if (res.tapIndex == 1) {
          // 举报
          var videoInfo = JSON.stringify(me.data.videoInfo);
          var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

          if (user == null || user == undefined || user == '') {
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl=' + realUrl,
            })
          } else {
            var publishUserId = me.data.videoInfo.userId;
            var videoId = me.data.videoInfo.id;
            var currentUserId = user.id;
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + "&publishUserId=" + publishUserId
            })
          }
        } else {
          wx.showToast({
            title: '官方暂未开放...',
          })
        }
      }
    })
  },

  onShareAppMessage: function(res) {

    var thiz = this;
    var videoInfo = thiz.data.videoInfo;

    return {
      title: '短视频内容分析',
      path: "pages/videoinfo/videoinfo?videoInfo=" + JSON.stringify(videoInfo)
    }
  },

})