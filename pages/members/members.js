// pages/members/members.js
const app = getApp();

Page({
  data: {
    members: [],
    totalMembers: 0,
    maleCount: 0,
    femaleCount: 0,
    hasMore: false
  },

  onLoad() {
    this.loadMembers();
  },

  onShow() {
    this.loadMembers();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadMembers(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载会员数据
  async loadMembers(callback) {
    try {
      // 从云数据库获取会员数据
      const db = wx.cloud.database();
      const result = await db.collection('member').get();

      console.log('从云数据库获取的所有数据:', result.data);
      
      if (result && result.data) {
        const members = result.data;
        const maleCount = members.filter(m => m.gender === '男').length;
        const femaleCount = members.filter(m => m.gender === '女').length;
        
        this.setData({
          members,
          totalMembers: members.length,
          maleCount,
          femaleCount,
          hasMore: false
        });
      } else {
        // 如果云数据库获取失败，回退到本地存储
        const localMembers = app.getMembers();
        const maleCount = localMembers.filter(m => m.gender === '男').length;
        const femaleCount = localMembers.filter(m => m.gender === '女').length;
        
        this.setData({
          members: localMembers,
          totalMembers: localMembers.length,
          maleCount,
          femaleCount,
          hasMore: false
        });
      }
    } catch (error) {
      console.error('从云数据库加载会员数据失败:', error);
      
      // 如果云数据库获取失败，回退到本地存储
      const localMembers = app.getMembers();
      const maleCount = localMembers.filter(m => m.gender === '男').length;
      const femaleCount = localMembers.filter(m => m.gender === '女').length;
      
      this.setData({
        members: localMembers,
        totalMembers: localMembers.length,
        maleCount,
        femaleCount,
        hasMore: false
      });
    }

    if (callback) {
      callback();
    }
  },

  // 显示会员详情
  showMemberDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/member-detail/member-detail?id=${id}`
    });
  },

  // 编辑会员
  editMember(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/add-member/add-member?id=${id}`
    });
  },

  // 删除会员
  deleteMember(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个会员信息吗？',
      success: (res) => {
        if (res.confirm) {
          // 从云数据库删除 - 使用where查询自定义id字段
          wx.cloud.database().collection('member').where({
            id: id
          }).remove({
            success: res => {
              console.log('删除成功', res);
              this.loadMembers();
              
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
            },
            fail: err => {
              console.error('删除失败', err);
              // 如果云数据库删除失败，尝试本地删除
              app.deleteMember(id);
              this.loadMembers();
              
              wx.showToast({
                title: '删除成功(本地)',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  // 添加会员
  goToAddMember() {
    wx.switchTab({
      url: '/pages/add-member/add-member'
    });
  },

  // 筛选会员
  goToFilter() {
    wx.switchTab({
      url: '/pages/filter/filter'
    });
  }
});