var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    cover: "cover",
    videoId: "",
    src: "",
    videoInfo: {}
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


  }

})