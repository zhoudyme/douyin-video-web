var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

//个人信息
Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe: true,
    isFollow: false,

    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",

    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    myWorkFalg: false,
    myLikesFalg: true,
    myFollowFalg: true

  },

  //页面加载获取用户详细信息
  onLoad: function(params) {
    var thiz = this

    // var user = app.userInfo
    var user = app.getGlobalUserInfo()
    var userId = user.id

    var publisherId = params.publisherId
    if (publisherId != null && publisherId != undefined && publisherId != '') {
      userId = publisherId
      thiz.setData({
        isMe: false,
        publisherId: publisherId,
        serverUrl: app.serverUrl
      })
    }

    thiz.setData({
      userId: userId
    })

    var serverUrl = app.serverUrl
    wx.showLoading({
      title: '请等待...',
    })
    console.log(user)
    // 调用后端
    wx.request({
      url: serverUrl + '/user/query?userId=' + userId + "&fanId=" + user.id,
      method: "GET",
      header: {
        'content-type': 'application/json', // 默认值
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading()
        if (res.data.status == 200) {
          var userInofo = res.data.data
          // app.userInfo = res.data.data;
          // app.setGlobalUserInfo(res.data.data)
          console.log(res.data.data)
          var faceUrl = "../resource/images/noneface.png"
          if (userInofo.faceImage != null && userInofo.faceImage != '' &&
            userInofo.faceImage != undefined) {
            faceUrl = serverUrl + userInofo.faceImage
          }
          thiz.setData({
            faceUrl: faceUrl,
            fansCounts: userInofo.fansCounts,
            followCounts: userInofo.followCounts,
            receiveLikeCounts: userInofo.receiveLikeCounts,
            nickname: userInofo.nickname,
            isFollow: userInofo.follow
          })
        } else if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 3000,
            icon: "none",
            success: function() {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          })
        }
      }
    })

    this.getMyVideoList(1);
  },

  followMe: function(e) {
    var thiz = this

    var user = app.getGlobalUserInfo()
    var userId = user.id
    var publisherId = thiz.data.publisherId

    var followType = e.currentTarget.dataset.followtype

    //1：关注  0：取消关注
    var url = ''
    if (followType == '1') {
      url = '/user/beYourFans?userId=' + publisherId + '&fanId=' + userId
    } else {
      url = '/user/dontBeYourFans?userId=' + publisherId + '&fanId=' + userId
    }

    wx.showLoading()
    wx.request({
      url: app.serverUrl + url,
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function() {
        wx.hideLoading()
        if (followType == '1') {
          thiz.setData({
            isFollow: true,
            fansCounts: ++thiz.data.fansCounts
          })

        } else {
          thiz.setData({
            isFollow: false,
            fansCounts: --thiz.data.fansCounts
          })
        }
      }

    })
  },

  //注销
  logout: function() {
    // var user = app.userInfo;
    var user = app.getGlobalUserInfo()
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待...',
    })
    // 调用后端
    wx.request({
      url: serverUrl + '/logout?userId=' + user.id,
      method: "GET",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading()
        if (res.data.status == 200) {
          wx.showToast({
            title: '注销成功',
            icon: 'success',
            duration: 2000
          });
          // app.userInfo = null;
          wx.removeStorageSync("userInfo")
          // 页面跳转  
          wx.redirectTo({
            url: '../userLogin/login',
          })
        }
      }
    })
  },

  //更换头像
  changeFace: function() {
    var thiz = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function(res) {
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)
        wx.showLoading({
          title: '上传中...',
        })
        var serverUrl = app.serverUrl
        var userInfo = app.getGlobalUserInfo()
        wx.uploadFile({
          url: serverUrl + '/user/uploadFace?userId=' + userInfo.id,
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            const data = JSON.parse(res.data)
            console.log(data)
            wx.hideLoading()
            if (data.status == 200) {
              wx.showToast({
                title: '上传成功',
                icon: 'success',
                duration: 2000
              });

              var imageUrl = data.data;
              thiz.setData({
                faceUrl: serverUrl + imageUrl
              })
            } else if (data.status == 500) {
              wx.showToast({
                title: data.msg
              });
            } else if (res.data.status == 502) {
              wx.showToast({
                title: res.data.msg,
                duration: 2000,
                icon: "none",
                success: function() {
                  wx.redirectTo({
                    url: '../userLogin/login',
                  })
                }
              });

            }
          }
        })
      },
    })
  },

  //上传视频
  uploadVideo: function() {
    //重构
    videoUtil.uploadVideo()
    // var thiz = this
    // wx.chooseVideo({
    //   sourceType: ['album'],
    //   success(res) {
    //     var duration = res.duration
    //     var temHeight = res.height
    //     var temWidth = res.width
    //     var temVideoUrl = res.tempFilePath
    //     var temCoverUrl = res.thumbTempFilePath
    //     if (duration >= 11) {
    //       wx.showToast({
    //         title: '视频长度不能超过10秒...',
    //         icon: "none",
    //         duration: 2500
    //       })
    //     } else if (duration < 1) {
    //       wx.showToast({
    //         title: '视频长度太短，请上传超过1秒的视频...',
    //         icon: "none",
    //         duration: 2500
    //       })
    //     } else {
    //       //打开选择bgm页面
    //       wx.navigateTo({
    //         url: '../chooseBgm/chooseBgm?duration=' + duration
    //           + "&temHeight=" + temHeight
    //           + "&temWidth=" + temWidth
    //           + "&temVideoUrl=" + temVideoUrl
    //           + "&temCoverUrl=" + temCoverUrl
    //         ,
    //       })
    //     }
    //   }
    // })
  },

  doSelectWork: function() {
    this.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",

      myWorkFalg: false,
      myLikesFalg: true,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyVideoList(1);
  },

  doSelectLike: function() {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myWorkFalg: true,
      myLikesFalg: false,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyLikesList(1);
  },

  doSelectFollow: function() {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myWorkFalg: true,
      myLikesFalg: true,
      myFollowFalg: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyFollowList(1)
  },

  getMyVideoList: function(page) {
    var thiz = this;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showAll/?page=' + page + '&pageSize=6',
      method: "POST",
      data: {
        userId: thiz.data.userId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data);
        var myVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = thiz.data.myVideoList;
        thiz.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  getMyLikesList: function(page) {
    var thiz = this;
    var userId = thiz.data.userId;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyLike/?userId=' + userId + '&page=' + page + '&pageSize=6',
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data);
        var likeVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = thiz.data.likeVideoList;
        thiz.setData({
          likeVideoPage: page,
          likeVideoList: newVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  getMyFollowList: function(page) {
    var thiz = this;
    var userId = thiz.data.userId;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyFollow/?userId=' + userId + '&page=' + page + '&pageSize=6',
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data);
        var followVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = thiz.data.followVideoList;
        thiz.setData({
          followVideoPage: page,
          followVideoList: newVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  // 点击跳转到视频详情页面
  showVideo: function(e) {

    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var videoList = this.data.myVideoList;
    } else if (!myLikesFalg) {
      var videoList = this.data.likeVideoList;
    } else if (!myFollowFalg) {
      var videoList = this.data.followVideoList;
    }

    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoinfo/videoinfo?videoInfo=' + videoInfo
    })

  },

  // 到底部后触发加载
  onReachBottom: function() {
    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var currentPage = this.data.myVideoPage;
      var totalPage = this.data.myVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyVideoList(page);
    } else if (!myLikesFalg) {
      var currentPage = this.data.likeVideoPage;
      var totalPage = this.data.myLikesTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyLikesList(page);
    } else if (!myFollowFalg) {
      var currentPage = this.data.followVideoPage;
      var totalPage = this.data.followVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyFollowList(page);
    }

  }

})