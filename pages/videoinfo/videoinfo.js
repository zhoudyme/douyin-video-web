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
  }

})