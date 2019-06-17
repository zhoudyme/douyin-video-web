const app = getApp()

Page({
  data: {
    //用于分页的属性
    totalPage: 1,
    page: 1,
    videoList: [],
    screenWidth: 350,
    serverUrl: "",
    searchContent: ""
  },

  onLoad: function(params) {
    var thiz = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    thiz.setData({
      screenWidth: screenWidth,
    });

    var searchContent = params.search
    var isSaveRecord = params.isSaveRecord
    if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
      isSaveRecord = 0
    }

    thiz.setData({
      searchContent: searchContent
    })

    //获取当前的分页数
    var page = thiz.data.page
    thiz.getAllVideoList(page, isSaveRecord)

  },

  getAllVideoList: function(page, isSaveRecord) {
    var thiz = this;
    var serverUrl = app.serverUrl
    wx.showLoading({
      title: '加载中...',
    })

    var searchContent = thiz.data.searchContent

    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + "&isSaveRecord=" + isSaveRecord,
      method: "POST",
      data: {
        videoDesc: searchContent
      },
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

  onPullDownRefresh: function() {
    wx.showNavigationBarLoading()
    this.getAllVideoList(1, 0)
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
    thiz.getAllVideoList(page, 0)
  },

  showVideoInfo: function(e) {
    var thiz = this
    var videoList = thiz.data.videoList
    var arrindex = e.target.dataset.arrindex
    var videoInfo = JSON.stringify(videoList[arrindex])

    wx.redirectTo({
      url: '../videoinfo/videoinfo?videoInfo=' + videoInfo,
    })
  }

})