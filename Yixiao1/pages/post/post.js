//获取应用实例
var app = getApp()
var Bmob = require("../../utils/bmob.js");
var common = require('../template/getCode.js')
var that;
var myDate = new Date();
//格式化日期
function formate_data(myDate) {
  let month_add = myDate.getMonth() + 1;
  var formate_result = myDate.getFullYear() + '-'
    + month_add + '-'
    + myDate.getDate()
  return formate_result;
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    indecatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    notice_status: false,
    data: formate_data(myDate),
    showTopTips: false,
    TopTips: '',
    accounts: ["微信号", "QQ号", "手机号"],
    accountIndex: 0,
    status: false,
    noteMaxLen: 200,//备注最多字数
    content: "",
    noteNowLen: 0,//备注当前字数
    user_id: "",
    userInfo: {},
    nickname: "",
    
    types: ["钥匙", "书", "卡等证件", "书包", "钱包", "水杯", "衣服", "手机", "眼镜", "耳机", "其他"],
    typeIndex: "0",
  },

  tapNotice: function (e) {
    if (e.target.id == 'notice') {
      this.hideNotice();
    }
  },
  showNotice: function (e) {
    this.setData({
      'notice_status': true
    });
  },
  hideNotice: function (e) {
    this.setData({
      'notice_status': false
    });
  },


  //字数改变触发事件
  bindTextAreaChange: function (e) {
    var that = this
    var value = e.detail.value,
      len = parseInt(value.length);
    if (len > that.data.noteMaxLen)
      return;
    that.setData({
      content: value, noteNowLen: len
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({//初始化数据
      src: "",
      isSrc: false,
      ishide: "0",
      autoFocus: true,
      isLoading: false,
      loading: true,
      isdisabled: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideToast()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var myInterval = setInterval(getReturn, 500); ////半秒定时查询
    function getReturn() {
      wx.getStorage({
        key: 'user_openid',
        success: function (ress) {
          if (ress.data) {
            clearInterval(myInterval)
            that.setData({
              loading: true
            })
          }
        }
      })
    }
  },

  //上传活动图片
  uploadPic: function () {//选择图标
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], //压缩图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          isSrc: true,
          src: tempFilePaths
        })
      }
    })
  },

  //删除图片
  clearPic: function () {//删除图片
    that.setData({
      isSrc: false,
      src: ""
    })
  },


  //改变时间
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  //改变活动类别
  bindTypeChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },


  //改变联系方式
  bindAccountChange: function (e) {
    this.setData({
      accountIndex: e.detail.value
    })
  },



  //表单验证
  showTopTips: function () {
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  //提交表单
  submitForm: function (e) {
    var that = this;
    var typeIndex = this.data.typeIndex;
    var acttype = 1 + parseInt(typeIndex);
    var acttypename = getTypeName(acttype); //获得类型名称
    var content = e.detail.value.content;
    var contactindex = this.data.accountIndex;
    if (contactindex == 0) {
      var contactWay = "微信号";
    } else if (contactindex == 1) {
      var contactWay = "QQ号";
    } else if (contactindex == 2) {
      var contactWay = "手机号";
    }
    var contactValue = e.detail.value.contactValue;
    var wxReg = new RegExp("^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$");
    var qqReg = new RegExp("[1-9][0-9]{4,}");
    var phReg = /^1[34578]\d{9}$/;
    var nameReg = new RegExp("^[\u4e00-\u9fa5]{2,4}$");
    //先进行表单非空验证
    if (content == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入描述'
      });
    } else if (contactValue == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入联系方式'
      });
    } else if (contactWay == "微信号" && !wxReg.test(contactValue)) {
      this.setData({
        showTopTips: true,
        TopTips: '微信号格式不正确'
      });
    } else if (contactWay == "手机号" && !phReg.test(contactValue)) {
      this.setData({
        showTopTips: true,
        TopTips: '手机号格式不正确'
      });
    } else if (contactWay == "QQ号" && !qqReg.test(contactValue)) {
      this.setData({
        showTopTips: true,
        TopTips: 'QQ号格式不正确'
      });
    } else {
      console.log('校验完毕');
      that.setData({
        isLoading: true,
        isdisabled: true
      })
      //向 Events 表中新增一条数据
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          var Diary = Bmob.Object.extend("Events");
          var diary = new Diary();
          var me = new Bmob.User();
          me.id = ress.data;
          diary.set("publisher", me);
          diary.set("acttype",acttype);
          diary.set("acttypeName",getTypeName(acttype));
          //diary.set("user_id",userInfo);

          diary.set("content", content);
          diary.set("contactWay", contactWay);
          diary.set("contactValue", contactValue);
          //diary.set("likenum", "0");
          //diary.set("commentnum", "0");
          //diary.set("liker", []);
          if (that.data.isSrc == true) {
            var name = that.data.src; //上传图片的别名
            var file = new Bmob.File(name, that.data.src);
            file.save();
            diary.set("actpic", file);
          }
          //新增操作
          diary.save(null, {
            success: function (result) {
              //活动扩展表中添加一条记录
              var Diary = Bmob.Object.extend("EventMore");
              var query = new Diary();
              var Events = Bmob.Object.extend("Events");
              var event = new Events();
              event.id = result.id;
              query.set("Status", 0);
              query.set("Statusname", "未找到");
              query.set("event", event);
              query.save();
              console.log("发布成功,objectId:" + result.id);
              that.setData({
                isLoading: false,
                isdisabled: false,
                eventId: result.id,
              })
              //添加成功，返回成功之后的objectId(注意，返回的属性名字是id,而不是objectId)
              common.dataLoading("发布成功", "success", function () {
                //重置表单
                that.setData({
                  typeIndex: 0,
                  data: formate_data(myDate),
                  isHide: true,
                  accountIndex: 0,
                  phonenumber: "",
                  content: "",
                  contactValue: '',
                  noteNowLen: 0,
                  showInput: false,
                  src: "",
                  isSrc: false,
                  accountIndex: 0,
                  contactValue: '',
                })
              });
            },
            error: function (result, error) {
              //添加失败
              console.log("发布失败=" + error);
              common.dataLoading("发起失败", "loading");
              that.setData({
                isLoading: false,
                isdisabled: false
              })
            }
          })
        },
      })
    }
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})

//根据活动类型获取活动类型名称
function getTypeName(acttype) {
  var acttypeName = "";
  if (acttype == 1) acttypeName = "钥匙";
  else if (acttype == 2) acttypeName = "书";
  else if (acttype == 3) acttypeName = "卡等证件";
  else if (acttype == 4) acttypeName = "书包";
  else if (acttype == 5) acttypeName = "钱包";
  else if (acttype == 6) acttypeName = "水杯";
  else if (acttype == 7) acttypeName = "衣服";
  else if (acttype == 8) acttypeName = "手机";
  else if (acttype == 9) acttypeName = "眼镜";
  else if (acttype == 10) acttypeName = "耳机";
  else if (acttype == 11) acttypeName = "其他";
  return acttypeName;
}