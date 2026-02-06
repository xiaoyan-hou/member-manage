// pages/members/members.js
const app = getApp();

Page({
  data: {
    members: [],
    totalMembers: 0,
    maleCount: 0,
    femaleCount: 0,
    hasMore: false,
    // 筛选面板控制
    showFilterPanel: false, // 是否展开筛选面板
    // 年龄筛选相关
    ageOptions: ['18-22岁', '23-26岁', '27-30岁', '31-35岁', '36-40岁', '40岁以上'], // 年龄段选项
    selectedAgeRange: '', // 选中的年龄段
    ageMin: '', // 年龄最小值
    ageMax: '', // 年龄最大值
    // 性别筛选相关
    genderOptions: ['男', '女'],
    selectedGender: '', // 选中的性别
    // 身高筛选相关
    heightOptions: ['160cm以下', '160-165cm', '165-170cm', '170-175cm', '175-180cm', '180cm以上'],
    selectedHeightRange: '', // 选中的身高段
    heightMin: '', // 身高最小值
    heightMax: '', // 身高最大值
    // 学历筛选相关
    educationOptions: ['初中及以下', '高中/中专', '大专', '本科', '硕士', '博士及以上'],
    selectedEducation: '', // 选中的学历
    // 会员编号筛选相关
    memberId: '', // 会员编号输入值
    allMembers: [] // 保存所有会员数据用于筛选
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

      // console.log('从云数据库获取的所有数据:', result.data);
      
      if (result && result.data) {
        // 为每个会员添加cloudRecordId用于后续删除操作
        const members = result.data.map(m => ({
          ...m,
          cloudRecordId: m._id
        }));
        const maleCount = members.filter(m => m.gender === '男').length;
        const femaleCount = members.filter(m => m.gender === '女').length;
        
        this.setData({
          members,
          allMembers: members,
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
          allMembers: localMembers,
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
        allMembers: localMembers,
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
    // 跳转到编辑会员页面并传递会员ID
    wx.navigateTo({
      url: `/pages/edit-member/edit-member?id=${id}`
    });
  },

  // 删除会员
  deleteMember(e) {
    const id = e.currentTarget.dataset.id;
    const cloudRecordId = e.currentTarget.dataset.cloudrecordid;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个会员信息吗？',
      success: async (res) => {
        if (res.confirm) {
          // 如果有云数据库记录的_id，使用云数据库删除
          if (cloudRecordId) {
            try {
              const db = wx.cloud.database();
              const result = await db.collection('member').doc(cloudRecordId).remove();

              if (result.stats.removed > 0) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                this.loadMembers();
                return;
              }
            } catch (error) {
              console.error('云数据库删除失败', error);
            }
          } else {
            // 如果没有cloudRecordId，使用本地删除
            app.deleteMember(id);
            this.loadMembers();

            wx.showToast({
              title: '删除成功(本地)',
              icon: 'success'
            });
            return;
          }

          // 如果云数据库删除失败，尝试本地删除
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
  },

  // 切换筛选面板显示
  toggleFilterPanel() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    });
  },

  // 选择年龄段
  selectAgeRange(e) {
    const index = e.currentTarget.dataset.index;
    const ageRange = this.data.ageOptions[index];

    // 如果点击已选中的年龄段，则取消选择
    if (this.data.selectedAgeRange === ageRange) {
      this.setData({
        selectedAgeRange: '',
        ageMin: '',
        ageMax: ''
      });
    } else {
      // 解析年龄段
      let min = '';
      let max = '';

      if (ageRange === '40岁以上') {
        min = '40';
        max = '';
      } else {
        const parts = ageRange.replace('岁', '').split('-');
        min = parts[0];
        max = parts[1];
      }

      this.setData({
        selectedAgeRange: ageRange,
        ageMin: min,
        ageMax: max
      });
    }
  },

  // 处理年龄输入
  onAgeInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;

    if (field === 'min') {
      this.setData({ ageMin: value });
    } else if (field === 'max') {
      this.setData({ ageMax: value });
    }
  },

  // 选择性别
  selectGender(e) {
    const index = e.currentTarget.dataset.index;
    const gender = this.data.genderOptions[index];
    
    // 如果点击已选中的性别，则取消选择
    if (this.data.selectedGender === gender) {
      this.setData({ selectedGender: '' });
    } else {
      this.setData({ selectedGender: gender });
    }
  },

  // 选择身高段
  selectHeightRange(e) {
    const index = e.currentTarget.dataset.index;
    const heightRange = this.data.heightOptions[index];
    
    // 解析身高段
    let min = '';
    let max = '';
    
    if (heightRange === '160cm以下') {
      min = '0';
      max = '160';
    } else if (heightRange === '180cm以上') {
      min = '180';
      max = '';
    } else {
      const parts = heightRange.replace('cm', '').split('-');
      min = parts[0];
      max = parts[1];
    }
    
    this.setData({
      selectedHeightRange: heightRange,
      heightMin: min,
      heightMax: max
    });
  },

  // 处理身高输入
  onHeightInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    if (field === 'min') {
      this.setData({ heightMin: value });
    } else if (field === 'max') {
      this.setData({ heightMax: value });
    }
  },

  // 选择学历
  selectEducation(e) {
    const index = e.currentTarget.dataset.index;
    const education = this.data.educationOptions[index];
    
    // 如果点击已选中的学历，则取消选择
    if (this.data.selectedEducation === education) {
      this.setData({ selectedEducation: '' });
    } else {
      this.setData({ selectedEducation: education });
    }
  },

  // 处理会员编号输入
  onMemberIdInput(e) {
    const value = e.detail.value;
    this.setData({ memberId: value });
  },

  // 执行筛选
  confirmFilter() {
    const { 
      ageMin, ageMax, 
      selectedGender, 
      heightMin, heightMax, 
      selectedEducation,
      memberId,
      allMembers 
    } = this.data;
    
    let filteredMembers = allMembers;
    
    // 年龄筛选
    if (ageMin || ageMax) {
      filteredMembers = filteredMembers.filter(member => {
        const age = parseInt(member.age) || 0;
        const min = parseInt(ageMin) || 0;
        const max = ageMax ? parseInt(ageMax) : Infinity;
        return age >= min && age <= max;
      });
    }
    
    // 性别筛选
    if (selectedGender) {
      filteredMembers = filteredMembers.filter(member => member.gender === selectedGender);
    }
    
    // 身高筛选
    if (heightMin || heightMax) {
      filteredMembers = filteredMembers.filter(member => {
        const height = parseInt(member.height) || 0;
        const min = heightMin ? parseInt(heightMin) : 0;
        const max = heightMax ? parseInt(heightMax) : Infinity;
        return height >= min && height <= max;
      });
    }
    
    // 学历筛选
    if (selectedEducation) {
      filteredMembers = filteredMembers.filter(member => member.education === selectedEducation);
    }
    
    // 会员编号筛选
    if (memberId) {
      filteredMembers = filteredMembers.filter(member => {
        const id = (member.memberId || '').toString();
        return id.includes(memberId);
      });
    }
    
    // 更新显示的会员列表
    const maleCount = filteredMembers.filter(m => m.gender === '男').length;
    const femaleCount = filteredMembers.filter(m => m.gender === '女').length;
    
    this.setData({
      members: filteredMembers,
      totalMembers: filteredMembers.length,
      maleCount,
      femaleCount,
      showFilterPanel: false
    });
    
    wx.showToast({
      title: `找到${filteredMembers.length}位`,
      icon: 'none'
    });
  },

  // 重置筛选
  resetFilter() {
    const { allMembers } = this.data;
    const maleCount = allMembers.filter(m => m.gender === '男').length;
    const femaleCount = allMembers.filter(m => m.gender === '女').length;
    
    this.setData({
      members: allMembers,
      totalMembers: allMembers.length,
      maleCount,
      femaleCount,
      selectedAgeRange: '',
      ageMin: '',
      ageMax: '',
      selectedGender: '',
      selectedHeightRange: '',
      heightMin: '',
      heightMax: '',
      selectedEducation: '',
      memberId: '',
      showFilterPanel: false
    });
  }
});