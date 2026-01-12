// app.js
App({
  onLaunch() {
    // 初始化本地存储数据
    const members = wx.getStorageSync('datingMembers') || [];
    if (members.length === 0) {
      // 如果没有数据，设置初始数据
      wx.setStorageSync('datingMembers', []);
    }
    
    console.log('相亲会员管理系统启动成功');
  },
  
  globalData: {
    userInfo: null
  },
  
  // 工具函数：生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // 工具函数：保存会员数据
  saveMembers(members) {
    wx.setStorageSync('datingMembers', members);
  },
  
  // 工具函数：获取所有会员
  getMembers() {
    return wx.getStorageSync('datingMembers') || [];
  },
  
  // 工具函数：添加会员
  addMember(member) {
    const members = this.getMembers();
    members.push(member);
    this.saveMembers(members);
    return member;
  },
  
  // 工具函数：更新会员
  updateMember(id, updatedData) {
    const members = this.getMembers();
    const index = members.findIndex(m => m.id === id);
    if (index !== -1) {
      members[index] = { ...members[index], ...updatedData, updatedAt: new Date().toISOString() };
      this.saveMembers(members);
      return members[index];
    }
    return null;
  },
  
  // 工具函数：删除会员
  deleteMember(id) {
    const members = this.getMembers();
    const filteredMembers = members.filter(m => m.id !== id);
    this.saveMembers(filteredMembers);
    return true;
  },
  
  // 工具函数：根据ID获取会员
  getMemberById(id) {
    const members = this.getMembers();
    return members.find(m => m.id === id);
  },
  
  // 工具函数：筛选会员
  filterMembers(filters) {
    const members = this.getMembers();
    return members.filter(member => {
      // 性别筛选
      if (filters.gender && member.gender !== filters.gender) {
        return false;
      }
      
      // 年龄筛选
      if (filters.ageMin && member.age < filters.ageMin) {
        return false;
      }
      if (filters.ageMax && member.age > filters.ageMax) {
        return false;
      }
      
      // 收入筛选
      if (filters.income && member.income !== filters.income) {
        return false;
      }
      
      // 学历筛选
      if (filters.education && member.education !== filters.education) {
        return false;
      }
      
      // 婚姻状况筛选
      if (filters.maritalStatus && member.maritalStatus !== filters.maritalStatus) {
        return false;
      }
      
      return true;
    });
  }
})