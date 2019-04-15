const app = getApp()

Page({
  data: {
    bgmList: [],
    serverUrl: ''
  },

  onLoad: function() {
    var thiz = this
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
  }
})