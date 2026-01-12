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
  loadMembers(callback) {
    const members = app.getMembers();
    const maleCount = members.filter(m => m.gender === '男').length;
    const femaleCount = members.filter(m => m.gender === '女').length;
    
    this.setData({
      members,
      totalMembers: members.length,
      maleCount,
      femaleCount,
      hasMore: false
    });

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
          app.deleteMember(id);
          this.loadMembers();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
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