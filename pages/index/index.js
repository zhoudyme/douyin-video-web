const app = getApp()

Page({
  data: {
    //用于分页的属性
    totalPage: 1,
    page: 1,
    videoList: [],
    screenWidth: 350,
    serverUrl: ""
  },

  onLoad: function(params) {
    var thiz = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    thiz.setData({
      screenWidth: screenWidth,
    });

    //获取当前的分页数
    var page = thiz.data.page
    thiz.getAllVideoList(page)

  },

  getAllVideoList: function(page) {
    var thiz = this;
    var serverUrl = app.serverUrl
    wx.showLoading({
      title: '加载中...',
    })

    wx.request({
      url: serverUrl + '/video/showAll?page=' + page,
      method: "GET",
      success: function(res) {
        wx.hideLoading()
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        console.log(res.data)

        //判断当前页page是否是第一页，如果是第一页，那么设置videoList为空
        if (page === 1) {
          thiz.setData({
            videoList: []
          })
        }

        var videoList = res.data.data.rows
        var newVideoList = thiz.data.videoList

        thiz.setData({
          videoList: newVideoList.concat(videoList),
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        })
      }
    })
  },

  onPullDownRefresh:function(){
    wx.showNavigationBarLoading()
    this.getAllVideoList(1)
  },

  onReachBottom: function() {
    var thiz = this

    var currentPage = thiz.data.page
    var totalPage = thiz.data.totalPage

    //判断当前页数和总页数是否相等，有则无需查询
    console.log(currentPage)
    console.log(totalPage)
    if (currentPage === totalPage) {
      wx.showToast({
        title: '我是有底线的~',
        icon: "none"
      })
      return;
    }
    var page = currentPage + 1
    thiz.getAllVideoList(page)
  }

})