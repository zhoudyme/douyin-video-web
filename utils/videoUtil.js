function uploadVideo() {
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
          url: '../chooseBgm/chooseBgm?duration=' + duration +
            "&temHeight=" + temHeight +
            "&temWidth=" + temWidth +
            "&temVideoUrl=" + temVideoUrl +
            "&temCoverUrl=" + temCoverUrl,
        })
      }
    }
  })
}

module.exports = {
  uploadVideo: uploadVideo
}