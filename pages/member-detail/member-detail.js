// pages/member-detail/member-detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    member: {},
    memberId: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const memberId = options.id;
    if (memberId) {
      // 保存memberId到页面数据中，以便onShow等生命周期函数使用
      this.setData({
        memberId: memberId
      });
      this.loadMemberDetail(memberId);
    }
  },

  /**
   * 加载会员详细信息
   */
  async loadMemberDetail(id) {
    try {
      // 从云数据库获取会员数据 - 使用where查询自定义id字段
      console.log('-=======', id);
      const db = wx.cloud.database();
      const result = await db.collection('member').where({
        id: id
      }).get();
      
      console.log('---result', result);
      if (result && result.data && result.data.length > 0) {
        // 云数据库中找到了会员数据
        const memberData = result.data[0];
        this.setData({
          member: memberData,
          memberId: memberData.id  // 更新memberId以确保一致性
        });
    } else {
      // 如果云数据库获取失败，尝试从本地获取
      const app = getApp();
      const localMember = app.getMemberById(id);
      if (localMember) {
        this.setData({
          member: localMember,
          memberId: localMember.id  // 更新memberId以确保一致性
        });
      }
    }
    } catch (error) {
    console.error('从云数据库加载会员详情失败:', error);
    
    // 如果云数据库获取失败，尝试从本地获取
    const app = getApp();
    const localMember = app.getMemberById(id);
    if (localMember) {
      this.setData({
        member: localMember,
        memberId: localMember.id  // 更新memberId以确保一致性
      });
    }
  }
  },

  /**
   * 编辑会员信息
   */
  editMember() {
    const memberId = this.data.member.id;
    if (memberId) {
      wx.navigateTo({
        url: `/pages/add-member/add-member?id=${memberId}`
      });
    } else {
      wx.showToast({
        title: '无法编辑此会员',
        icon: 'none'
      });
    }
  },

  /**
   * 删除会员
   */
  deleteMember() {
    const memberId = this.data.member.id;
    if (!memberId) {
      wx.showToast({
        title: '无法删除此会员',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个会员信息吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 从云数据库删除 - 使用where查询自定义id字段
            const db = wx.cloud.database();
            const result = await db.collection('member').where({
              id: memberId
            }).remove();
            
            if (result.stats.removed > 0) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              
              // 延迟返回上一页，让用户看到成功提示
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            } else {
              throw new Error('删除失败');
            }
          } catch (error) {
            console.error('从云数据库删除会员失败:', error);
            
            // 如果云数据库删除失败，尝试本地删除
            const app = getApp();
            app.deleteMember(memberId);
            
            wx.showToast({
              title: '删除成功(本地)',
              icon: 'success'
            });
            
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时重新加载数据，以确保显示最新信息
    // 优先使用保存的memberId，其次使用已存储的member.id
    let memberId = this.data.memberId || this.data.member.id;
    
    if (!memberId) {
      // 尝试从当前路由中获取参数
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      memberId = currentPage.options?.id || this.data.member.id;
    }
    
    if (memberId) {
      this.loadMemberDetail(memberId);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})