// pages/add-member/add-member.js
const app = getApp();

Page({
  data: {
    formData: {
      memberId: '',
      name: '',
      gender: '',
      birthYear: '1998', // 默认1998年
      age: '25', // 根据出生年份计算
      phone: '',
      occupation: '',
      income: '',
      education: '',
      height: '',
      maritalStatus: '',
      requirements: '',
      hobbies: '',
      selfIntroduction: '',
      zodiac: '', // 属相
      house: '', // 房子情况
      car: '', // 车子情况
      siblings: '' // 兄弟情况
    },
    // 选项数组
    genderOptions: ['男', '女'],
    zodiacOptions: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    incomeOptions: [
      '2000元以下', '2000-5000元', '5000-8000元', 
      '8000-12000元', '12000-20000元', '20000元以上'
    ],
    educationOptions: [
      '初中及以下', '高中/中专', '大专', 
      '本科', '硕士', '博士及以上'
    ],
    maritalStatusOptions: ['未婚', '已婚', '离异', '丧偶'],
    siblingsOptions: ['独生子女', '一个弟弟', '一个哥哥', '没有兄弟', '其他情况']
  },

  onLoad(options) {
    // 设置默认属相（根据默认出生年份1998年计算）
    const defaultBirthYear = '1998';
    const defaultZodiac = this.getZodiacByBirthYear(defaultBirthYear);
    const defaultAge = this.calculateAge(defaultBirthYear);
    
    this.setData({
      'formData.zodiac': defaultZodiac,
      'formData.age': defaultAge
    });
  },

  onShow() {
    // add-member页面，仅用于添加新会员，无需特殊处理
  },

  onUnload() {
    // 页面卸载时清除全局变量
    const globalData = app.globalData || {};
    if (globalData.editingMemberId) {
      globalData.editingMemberId = null;
    }
  },



  // 计算年龄的方法
  calculateAge(birthYear) {
    const currentYear = new Date().getFullYear();
    return String(currentYear - parseInt(birthYear));
  },

  // 处理picker选择变化
  bindPickerChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    // 对于日期类型的picker，value是字符串格式的日期，不是数组索引
    if (field === 'birthYear') {
      const selectedValue = value; // 直接使用value作为年份字符串
      const age = this.calculateAge(selectedValue);
      const zodiac = this.getZodiacByBirthYear(selectedValue);
      
      this.setData({
        [`formData.${field}`]: selectedValue,
        [`formData.age`]: age,
        [`formData.zodiac`]: zodiac
      });
    } else {
      // 对于其他选项类型的picker，value是数组索引
      const selectedValue = this.data[field + 'Options'][value];
      this.setData({
        [`formData.${field}`]: selectedValue
      });
    }
  },

  // 处理输入框变化
  bindInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;

    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 根据出生年份计算属相
  getZodiacByBirthYear(birthYear) {
    const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    const baseYear = 1900; // 1900年是鼠年
    const index = (parseInt(birthYear) - baseYear) % 12;
    return zodiacs[index >= 0 ? index : index + 12];
  },

  // 检查会员编号是否已存在
  async checkMemberIdExists(memberId) {
    if (!memberId || memberId.trim() === '') {
      return false;
    }

    try {
      // 检查云数据库
      const db = wx.cloud.database();
      const cloudResult = await db.collection('member').where({
        memberId: memberId.trim()
      }).get();

      if (cloudResult && cloudResult.data && cloudResult.data.length > 0) {
        return true; // 云数据库中已存在
      }
    } catch (error) {
      console.error('检查云数据库会员编号失败:', error);
    }

    // 检查本地存储
    const localMembers = app.getMembers();
    const localExists = localMembers.some(m => m.memberId === memberId.trim());
    if (localExists) {
      return true; // 本地存储中已存在
    }

    return false; // 不存在，可以使用
  },

  // 提交表单
  async submitForm(formData) {
    // 校验会员编号是否已存在
    if (formData.memberId && formData.memberId.trim() !== '') {
      wx.showLoading({ title: '正在校验...', mask: true });
      
      const exists = await this.checkMemberIdExists(formData.memberId);
      
      wx.hideLoading();
      
      if (exists) {
        wx.showToast({
          title: '会员编号已存在',
          icon: 'none'
        });
        return; // 编号已存在，不提交
      }
    }
    
    try {
      // 生成唯一ID
      const id = Date.now().toString();
      
      // 准备会员数据
      const memberData = {
        ...formData,
        id: id
      };
      
      // 保存到云数据库
      const db = wx.cloud.database();
      const result = await db.collection('member').add({
        data: memberData
      });
      
      if (result._id) {
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });

        // 延迟跳转到会员列表tab
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/members/members'
          });
        }, 1500);
      }
    } catch (error) {
      console.error('保存到云数据库失败:', error);

      // 如果云数据库保存失败，保存到本地
      try {
        app.addMember(memberData);

        wx.showToast({
          title: '添加成功(本地)',
          icon: 'success'
        });

        // 延迟跳转到会员列表tab
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/members/members'
          });
        }, 1500);
      } catch (localError) {
        console.error('保存到本地也失败:', localError);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    }
  },

  // 表单提交事件
  async formSubmit(e) {
    const formData = e.detail.value;
    
    // 合并表单数据和picker选择的数据
    const completeFormData = {
      ...this.data.formData,
      ...formData
    };
    
    // 添加新会员
    await this.submitForm(completeFormData);
  }
});
