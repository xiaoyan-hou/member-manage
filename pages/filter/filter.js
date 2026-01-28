// pages/filter/filter.js
const app = getApp();

Page({
  data: {
    // 性别筛选（常驻）
    genderFilter: 'all', // all, 男, 女
    
    // 年龄范围
    minAge: '',
    maxAge: '',
    
    // 身高范围
    minHeight: '',
    maxHeight: '',
    
    // 属相
    selectedZodiac: '',
    zodiacOptions: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    
    // 职业关键词
    occupationKeyword: '',
    
    // 兄弟情况
    selectedSiblings: '',
    siblingsOptions: ['一个哥哥', '一个弟弟', '没有兄弟', '其他情况'],
    
    // 学历
    selectedEducation: '',
    educationOptions: ['小学', '初中', '高中', '中专', '大专', '本科', '硕士', '博士'],
    
    // 收入
    selectedIncome: '',
    incomeOptions: ['5万以下', '5-10万', '10-20万', '20-30万', '30-50万', '50万以上'],
    
    // 婚姻状况
    selectedMaritalStatus: '',
    maritalStatusOptions: ['未婚', '已婚', '离异', '丧偶'],
    
    // 筛选结果
    showResults: false,
    filteredMembers: [],
    allMembers: []
  },

  onLoad() {
    this.loadMembers();
  },

  onShow() {
    this.loadMembers();
  },

  // 加载所有会员数据
  loadMembers() {
    const members = app.getMembers();
    this.setData({
      allMembers: members
    });
    
    // 如果有筛选条件，重新应用筛选
    if (this.data.showResults) {
      this.applyFilters();
    }
  },

  // 性别筛选（常驻）
  setGenderFilter(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({
      genderFilter: gender
    });
    
    // 自动应用筛选
    if (this.hasActiveFilters()) {
      this.applyFilters();
    }
  },

  // 设置最小年龄
  setMinAge(e) {
    this.setData({
      minAge: e.detail.value
    });
  },

  // 设置最大年龄
  setMaxAge(e) {
    this.setData({
      maxAge: e.detail.value
    });
  },

  // 设置最小身高
  setMinHeight(e) {
    this.setData({
      minHeight: e.detail.value
    });
  },

  // 设置最大身高
  setMaxHeight(e) {
    this.setData({
      maxHeight: e.detail.value
    });
  },

  // 设置属相筛选
  setZodiacFilter(e) {
    const index = e.detail.value;
    this.setData({
      selectedZodiac: this.data.zodiacOptions[index]
    });
  },

  // 设置职业关键词筛选
  setOccupationFilter(e) {
    this.setData({
      occupationKeyword: e.detail.value
    });
  },
  
  // 设置兄弟情况筛选
  setSiblingsFilter(e) {
    const index = e.detail.value;
    this.setData({
      selectedSiblings: this.data.siblingsOptions[index]
    });
  },

  // 设置学历筛选
  setEducationFilter(e) {
    const index = e.detail.value;
    this.setData({
      selectedEducation: this.data.educationOptions[index]
    });
  },

  // 设置收入筛选
  setIncomeFilter(e) {
    const index = e.detail.value;
    this.setData({
      selectedIncome: this.data.incomeOptions[index]
    });
  },

  // 设置婚姻状况筛选
  setMaritalStatusFilter(e) {
    const index = e.detail.value;
    this.setData({
      selectedMaritalStatus: this.data.maritalStatusOptions[index]
    });
  },

  // 检查是否有活跃的筛选条件
  hasActiveFilters() {
    return this.data.genderFilter !== 'all' ||
           this.data.minAge ||
           this.data.maxAge ||
           this.data.minHeight ||
           this.data.maxHeight ||
           this.data.selectedZodiac ||
           this.data.occupationKeyword ||
           this.data.selectedSiblings ||
           this.data.selectedEducation ||
           this.data.selectedIncome ||
           this.data.selectedMaritalStatus;
  },

  // 应用筛选
  applyFilters() {
    const {
      allMembers,
      genderFilter,
      minAge,
      maxAge,
      minHeight,
      maxHeight,
      selectedZodiac,
      occupationKeyword,
      selectedEducation,
      selectedIncome,
      selectedMaritalStatus
    } = this.data;

    let filteredMembers = allMembers.filter(member => {
      // 性别筛选（常驻）
      if (genderFilter !== 'all' && member.gender !== genderFilter) {
        return false;
      }

      // 年龄范围筛选
      if (minAge && member.age < parseInt(minAge)) {
        return false;
      }
      if (maxAge && member.age > parseInt(maxAge)) {
        return false;
      }

      // 身高范围筛选
      if (minHeight && member.height && member.height < parseInt(minHeight)) {
        return false;
      }
      if (maxHeight && member.height && member.height > parseInt(maxHeight)) {
        return false;
      }

      // 属相筛选
      if (selectedZodiac && member.zodiac !== selectedZodiac) {
        return false;
      }

      // 职业关键词筛选（模糊匹配）
      if (occupationKeyword && member.occupation && 
          !member.occupation.toLowerCase().includes(occupationKeyword.toLowerCase())) {
        return false;
      }
      
      // 兄弟情况筛选
      if (selectedSiblings && member.siblings !== selectedSiblings) {
        return false;
      }

      // 学历筛选
      if (selectedEducation && member.education !== selectedEducation) {
        return false;
      }

      // 收入筛选
      if (selectedIncome && member.income !== selectedIncome) {
        return false;
      }

      // 婚姻状况筛选
      if (selectedMaritalStatus && member.maritalStatus !== selectedMaritalStatus) {
        return false;
      }

      return true;
    });

    this.setData({
      filteredMembers: filteredMembers,
      showResults: true
    });

    // 显示筛选结果提示
    if (filteredMembers.length === 0) {
      wx.showToast({
        title: '暂无符合条件的会员',
        icon: 'none',
        duration: 2000
      });
    } else {
      wx.showToast({
        title: `找到 ${filteredMembers.length} 位会员`,
        icon: 'success',
        duration: 2000
      });
    }
  },

  // 重置筛选条件
  resetFilters() {
    this.setData({
      genderFilter: 'all',
      minAge: '',
      maxAge: '',
      minHeight: '',
      maxHeight: '',
      selectedZodiac: '',
      occupationKeyword: '',
      selectedEducation: '',
      selectedIncome: '',
      selectedMaritalStatus: '',
      showResults: false,
      filteredMembers: []
    });

    wx.showToast({
      title: '筛选条件已重置',
      icon: 'success',
      duration: 1500
    });
  },

  // 清除筛选结果
  clearResults() {
    this.setData({
      showResults: false,
      filteredMembers: []
    });
  },

  // 查看会员详情
  viewMemberDetail(e) {
    const memberId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/member-detail/member-detail?id=${memberId}`
    });
  },

  // 编辑会员
  editMember(e) {
    const memberId = e.currentTarget.dataset.id;
    // 跳转到编辑会员页面并传递会员ID
    wx.navigateTo({
      url: `/pages/edit-member/edit-member?id=${memberId}`
    });
  }
});