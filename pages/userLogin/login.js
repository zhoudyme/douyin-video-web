const app = getApp()

//用户登录
Page({
  data: {},

  onLoad: function(params) {
    var thiz = this
    var redirectUrl = params.redirectUrl
    if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
    redirectUrl = redirectUrl.replace(/#/g, "?")
    redirectUrl = redirectUrl.replace(/@/g, "=")
    thiz.redirectUrl = redirectUrl
  }
},

// 登录  
doLogin: function(e) {
  var thiz = this
  var formObject = e.detail.value;
  var username = formObject.username;
  var password = formObject.password;
  // 简单验证
  if (username.length == 0 || password.length == 0) {
    wx.showToast({
      title: '用户名或密码不能为空',
      icon: 'none',
      duration: 3000
    })
  } else {
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待...',
    })
    // 调用后端
    wx.request({
      url: serverUrl + '/login',
      method: "POST",
      data: {
        username: username,
        password: password
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading()
        if (res.data.status == 200) {
          // 登录成功跳转 
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 2000
          });
          // app.userInfo = res.data.data;
          app.setGlobalUserInfo(res.data.data)
          // 页面跳转  
          var redirectUrl = thiz.redirectUrl
          if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
            wx.redirectTo({
              url: redirectUrl,
            })
          } else {
            wx.redirectTo({
              url: '../index/index',
            })
          }

        } else if (res.data.status == 500) {
          // 失败弹出框
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  }
},

//跳转到注册页面
goRegistPage: function() {
  wx.redirectTo({
    url: '../userRegist/regist',
  })
}
})