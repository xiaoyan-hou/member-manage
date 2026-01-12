// pages/add-member/add-member.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    genderOptions: ['男', '女'],
    educationOptions: ['初中及以下', '高中', '中专', '大专', '本科', '硕士', '博士'],
    maritalStatusOptions: ['未婚', '离异', '丧偶'],
    zodiacOptions: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    incomeOptions: ['5万以下', '5-10万', '10-15万', '15-20万', '20-30万', '30-50万', '50-100万', '100万以上'],
    genderArray: ['男', '女'],
    genderIndex: 0,
    educationArray: ['初中及以下', '高中', '中专', '大专', '本科', '硕士', '博士'],
    educationIndex: 0,
    maritalStatusArray: ['未婚', '离异', '丧偶'],
    maritalStatusIndex: 0,
    zodiacArray: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    zodiacIndex: 0,
    incomeArray: ['5千以下', '5千-1万', '1-1.5万', '1.5-2万', '2-3万', '3-5万', '5万以上'],
    incomeIndex: 0,
    siblingsOptions: ['一个哥哥', '一个弟弟', '没有兄弟', '其他情况'],
    
    formData: {
      id: '',
      name: '',
      gender: '',
      age: '',
      birthYear: '',
      zodiac: '',
      height: '',
      weight: '',
      education: '',
      occupation: '',
      income: '',
      house: '',
      car: '',
      phone: '',
      siblings: '',
      family: '',
      maritalStatus: '',
      requirements: '',
      contact: ''
    }
  },

  /**
   * 处理输入框变化
   */
  bindInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  /**
   * 计算属相
   */
  getZodiac(year) {
    const zodiacs = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊'];
    return zodiacs[year % 12];
  },

  genderChange(e) {
    const idx = e.detail.value;
    this.setData({
      genderIndex: idx,
      'formData.gender': this.data.genderArray[idx]
    });
  },

  incomeChange(e) {
    const idx = e.detail.value;
    this.setData({
      incomeIndex: idx,
      'formData.income': this.data.incomeArray[idx]
    });
  },

  educationChange(e) {
    const idx = e.detail.value;
    this.setData({
      educationIndex: idx,
      'formData.education': this.data.educationArray[idx]
    });
  },

  maritalStatusChange(e) {
    const idx = e.detail.value;
    this.setData({
      maritalStatusIndex: idx,
      'formData.maritalStatus': this.data.maritalStatusArray[idx]
    });
  },

  zodiacChange(e) {
    const idx = e.detail.value;
    this.setData({
      zodiacIndex: idx,
      'formData.zodiac': this.data.zodiacArray[idx]
    });
  },

  birthYearChange(e) {
    const yearStr = e.detail.value;
    const year = parseInt(yearStr);
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    const zodiac = this.getZodiac(year);
    this.setData({
      'formData.birthYear': yearStr,
      'formData.age': age,
      'formData.zodiac': zodiac
    });
  },

  /**
   * 处理选择器变化
   */
  bindPickerChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    let selectedValue = '';
    
    // 更新当前字段
    if (field === 'gender') {
      selectedValue = this.data.genderOptions[value];
    } else if (field === 'education') {
      selectedValue = this.data.educationOptions[value];
    } else if (field === 'maritalStatus') {
      selectedValue = this.data.maritalStatusOptions[value];
    } else if (field === 'zodiac') {
      selectedValue = this.data.zodiacOptions[value];
    } else if (field === 'income') {
      selectedValue = this.data.incomeOptions[value];
    } else if (field === 'siblings') {
      selectedValue = this.data.siblingsOptions[value];
    } else if (field === 'birthYear') {
       selectedValue = value;
       
       // 自动计算年龄和属相
       const currentYear = new Date().getFullYear();
       const birthYear = parseInt(value);
       const age = currentYear - birthYear;
       const zodiac = this.getZodiac(birthYear);
       
       this.setData({
         'formData.age': age,
         'formData.zodiac': zodiac
       });
    }

    this.setData({
      [`formData.${field}`]: selectedValue
    });
  },

  /**
   * 提交表单
   */
  submitForm(e) {
    const data = this.data.formData;
    
    // 简单校验
    if (!data.id || !data.name || !data.contact) {
      wx.showToast({
        title: '编号、姓名、联系方式为必填项',
        icon: 'none'
      });
      return;
    }

    // 获取现有会员列表
    let memberList = wx.getStorageSync('memberList') || [];
    
    // 检查编号是否重复
    const exists = memberList.some(item => item.id === data.id);
    if (exists) {
      wx.showToast({
        title: '会员编号已存在',
        icon: 'none'
      });
      return;
    }

    // 保存新会员
    memberList.push(data);
    wx.setStorageSync('memberList', memberList);

    wx.showToast({
      title: '添加成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      }
    });
  },

  formSubmit(e) {
    const v = e.detail.value || {};
    const id = `${Date.now()}`;
    const gender = this.data.genderArray[this.data.genderIndex];
    const income = this.data.incomeArray[this.data.incomeIndex];
    const education = this.data.educationArray[this.data.educationIndex];
    const maritalStatus = this.data.maritalStatusArray[this.data.maritalStatusIndex];
    const zodiac = this.data.zodiacArray[this.data.zodiacIndex];

    const data = {
      id,
      name: v.name || '',
      gender,
      birthYear: this.data.formData.birthYear || '',
      age: v.age || this.data.formData.age || '',
      zodiac,
      phone: v.phone || '',
      occupation: v.occupation || '',
      income,
      education,
      height: v.height || '',
      maritalStatus,
      requirements: v.requirements || '',
      hobbies: v.hobbies || '',
      selfIntroduction: v.selfIntroduction || ''
    };

    if (!data.name || !data.phone) {
      wx.showToast({
        title: '姓名、联系电话为必填项',
        icon: 'none'
      });
      return;
    }

    let memberList = wx.getStorageSync('memberList') || [];
    memberList.push(data);
    wx.setStorageSync('memberList', memberList);
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  formReset() {
    this.setData({
      genderIndex: 0,
      incomeIndex: 0,
      educationIndex: 0,
      maritalStatusIndex: 0,
      zodiacIndex: 0,
      formData: {
        id: '',
        name: '',
        gender: '',
        age: '',
        birthYear: '',
        zodiac: '',
        height: '',
        weight: '',
        education: '',
        occupation: '',
        income: '',
        house: '',
        car: '',
        phone: '',
        siblings: '',
        family: '',
        maritalStatus: '',
        requirements: '',
        contact: ''
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 默认选中1998年
    const defaultYear = 1998;
    const currentYear = new Date().getFullYear();
    const age = currentYear - defaultYear;
    const zodiac = this.getZodiac(defaultYear);

    this.setData({
      'formData.birthYear': defaultYear.toString(),
      'formData.age': age,
      'formData.zodiac': zodiac
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
