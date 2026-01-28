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

    // 初始化云开发
    if (!wx.cloud) {
      console.error('小程序基础库版本过低，暂不支持云开发');
    } else {
      wx.cloud.init({
        env: "cloud1-1gbe0trm2692749a", // 当前的云开发环境 ID
        traceUser: true,
      });
      console.log('云开发初始化成功');
    }

  },
  
  globalData: {
    userInfo: null,
    currentEditingId: null, // 当前正在编辑的会员ID
    members: [],           // 本地存储的会员列表
    editingMemberId: null  // 正在编辑的会员ID（为了向后兼容）
  },
  
  // 工具函数：生成唯一ID
  async generateId() {
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
      
      // 兄弟情况筛选（保持兼容性，实际字段名为maritalStatus）
      if (filters.maritalStatus && member.maritalStatus !== filters.maritalStatus) {
        return false;
      }
      
      return true;
    });
  },

  // 新增：保存会员信息到云数据库
  async saveMemberToCloud(memberData) {
    try {
      // 使用云开发的数据库API
      const db = wx.cloud.database();
      
      // 插入数据到member表
      const result = await wx.cloud.callFunction({
        name: 'addMember', // 调用云函数进行数据库操作
        data: memberData
      });

      return result;
    } catch (error) {
      console.error('保存会员信息到云数据库失败:', error);
      return { success: false, error: error.message };
    }
  },

  // 使用 CloudBase SDK 的方法（如果需要）
  async saveMemberWithSDK(memberData) {
    try {
      const { init } = require("@cloudbase/wx-cloud-client-sdk");
      const client = init(wx.cloud);

      // 连接数据库
      const db = client.database();

      // 准备要插入的数据，移除可能不被接受的字段名
      const { ...restData } = memberData;
      const finalData = {
        ...restData,
        // openid: _openid || wx.getStorageSync('openid') || '' // 使用 'openid' 而不是 '_openid'
      };

      // 插入数据
      const result = await db.collection('member').add({
        data: finalData
      });

      // console.log('数据插入成功:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('使用SDK保存会员信息失败:', error);
      return { success: false, error: error.message };
    }
  }
})