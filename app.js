//app.js
App({
  //后台地址
  serverUrl: "http://192.168.1.2:8080",
  //用户信息
  userInfo: null,

  setGlobalUserInfo: function(user) {
    wx.setStorageSync("userInfo", user)
  },

  getGlobalUserInfo: function() {
    return wx.getStorageSync("userInfo")
  }
})