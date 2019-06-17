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
    thiz.setData({
      videoId: videoInfo.id,
      src: app.serverUrl + "/" + videoInfo.videoPath.replace("fileSpace",""),
      videoInfo: videoInfo
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
    videoUtil.uploadVideo()
  },

  showIndex: function() {
    wx.redirectTo({
      url: '../index/index',
    })
  }

})