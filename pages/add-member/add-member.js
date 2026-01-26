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
    siblingsOptions: ['独生子女', '一个弟弟', '一个哥哥', '没有兄弟', '其他情况'],

    currentMemberId: null, // 当前正在编辑的会员ID
    isEditing: false // 是否处于编辑模式
  },

  onLoad(options) {
    // 如果有传递过来的ID，则进入编辑模式
    const id = options.id;
    if (id) {
      this.setData({
        currentMemberId: id,
        isEditing: true
      });
      this.loadMemberData(id); // 加载会员数据
    } else {
      // 新增模式下，默认设置出生年份为1998
      const defaultBirthYear = '1998';
      const defaultAge = this.calculateAge(defaultBirthYear);
      const defaultZodiac = this.getZodiacByYear(defaultBirthYear);
      
      this.setData({
        'formData.birthYear': defaultBirthYear,
        'formData.age': defaultAge,
        'formData.zodiac': defaultZodiac
      });
    }
  },

  // 加载会员数据用于编辑
  async loadMemberData(id) {
    try {
      // 从云数据库获取会员数据 - 使用where查询自定义id字段
      console.log('load member data：', id);
      const db = wx.cloud.database();
      const result = await db.collection('member').where({
        id: id
      }).get();
      
      // 由于where查询返回的是数组，我们需要取第一个元素
      const member = result && result.data && result.data.length > 0 ? result.data[0] : null;
      
      if (member) {
        // 计算年龄（如果birthYear存在）
        let age = member.age || '';
        if (member.birthYear) {
          age = this.calculateAge(member.birthYear);
        }
        
        // 设置性别索引
        let genderIndex = this.data.genderOptions.indexOf(member.gender || '');
        
        // 设置收入索引
        let incomeIndex = this.data.incomeOptions.indexOf(member.income || '');
        
        // 设置教育程度索引
        let educationIndex = this.data.educationOptions.indexOf(member.education || '');
        
        // 设置婚姻状况索引
        let maritalStatusIndex = this.data.maritalStatusOptions.indexOf(member.maritalStatus || '');
        
        // 设置属相索引
        let zodiacIndex = this.data.zodiacOptions.indexOf(member.zodiac || '');
        
        // 设置兄弟情况索引
        let siblingsIndex = this.data.siblingsOptions.indexOf(member.siblings || '');
        
        const formData = {
          memberId: member.memberId || '',
          name: member.name || '',
          gender: member.gender || '',
          birthYear: member.birthYear || '1998',
          age: age,
          phone: member.phone || '',
          occupation: member.occupation || '',
          income: member.income || '',
          education: member.education || '',
          height: member.height || '',
          maritalStatus: member.maritalStatus || '',
          requirements: member.requirements || '',
          hobbies: member.hobbies || '',
          selfIntroduction: member.selfIntroduction || '',
          zodiac: member.zodiac || '',
          house: member.house || '',
          car: member.car || '',
          siblings: member.siblings || ''
        };
        
        this.setData({
          formData
        });
      } else {
        // 如果云数据库获取失败，尝试从本地获取
        const app = getApp();
        const localMember = app.getMemberById(id);
        if (localMember) {
          // 计算年龄
          let age = localMember.age || '';
          if (localMember.birthYear) {
            age = this.calculateAge(localMember.birthYear);
          }
          
          // 设置性别索引
          let genderIndex = this.data.genderOptions.indexOf(localMember.gender || '');
          
          // 设置收入索引
          let incomeIndex = this.data.incomeOptions.indexOf(localMember.income || '');
          
          // 设置教育程度索引
          let educationIndex = this.data.educationOptions.indexOf(localMember.education || '');
          
          // 设置婚姻状况索引
          let maritalStatusIndex = this.data.maritalStatusOptions.indexOf(localMember.maritalStatus || '');
          
          // 设置属相索引
          let zodiacIndex = this.data.zodiacOptions.indexOf(localMember.zodiac || '');
          
          // 设置兄弟情况索引
          let siblingsIndex = this.data.siblingsOptions.indexOf(localMember.siblings || '');
          
          const formData = {
            memberId: localMember.memberId || '',
            name: localMember.name || '',
            gender: localMember.gender || '',
            birthYear: localMember.birthYear || '1998',
            age: age,
            phone: localMember.phone || '',
            occupation: localMember.occupation || '',
            income: localMember.income || '',
            education: localMember.education || '',
            height: localMember.height || '',
            maritalStatus: localMember.maritalStatus || '',
            requirements: localMember.requirements || '',
            hobbies: localMember.hobbies || '',
            selfIntroduction: localMember.selfIntroduction || '',
            zodiac: localMember.zodiac || '',
            house: localMember.house || '',
            car: localMember.car || '',
            siblings: localMember.siblings || ''
          };
          
          this.setData({
            formData
          });
        }
      }
    } catch (error) {
      console.error('从云数据库加载会员数据失败:', error);
      
      // 如果云数据库获取失败，尝试从本地获取
      const localMember = app.getMemberById(id);
      if (localMember) {
        // 计算年龄（如果birthYear存在）
        let age = localMember.age || '';
        if (localMember.birthYear) {
          age = this.calculateAge(localMember.birthYear);
        }
        
        // 设置性别索引
        let genderIndex = this.data.genderOptions.indexOf(localMember.gender || '');
        
        // 设置收入索引
        let incomeIndex = this.data.incomeOptions.indexOf(localMember.income || '');
        
        // 设置教育程度索引
        let educationIndex = this.data.educationOptions.indexOf(localMember.education || '');
        
        // 设置婚姻状况索引
        let maritalStatusIndex = this.data.maritalStatusOptions.indexOf(localMember.maritalStatus || '');
        
        // 设置属相索引
        let zodiacIndex = this.data.zodiacOptions.indexOf(localMember.zodiac || '');
        
        // 设置兄弟情况索引
        let siblingsIndex = this.data.siblingsOptions.indexOf(localMember.siblings || '');
        
        const formData = {
          memberId: localMember.memberId || '',
          name: localMember.name || '',
          gender: localMember.gender || '',
          birthYear: localMember.birthYear || '1998',
          age: age,
          phone: localMember.phone || '',
          occupation: localMember.occupation || '',
          income: localMember.income || '',
          education: localMember.education || '',
          height: localMember.height || '',
          maritalStatus: localMember.maritalStatus || '',
          requirements: localMember.requirements || '',
          hobbies: localMember.hobbies || '',
          selfIntroduction: localMember.selfIntroduction || '',
          zodiac: localMember.zodiac || '',
          house: localMember.house || '',
          car: localMember.car || '',
          siblings: localMember.siblings || ''
        };
        
        this.setData({
          formData
        });
      }
    }
  },

  // 输入框输入事件
  bindInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 选择器变化事件
  bindPickerChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    if (field === 'gender') {
      this.setData({
        'formData.gender': this.data.genderOptions[value]
      });
    } else if (field === 'income') {
      this.setData({
        'formData.income': this.data.incomeOptions[value]
      });
    } else if (field === 'education') {
      this.setData({
        'formData.education': this.data.educationOptions[value]
      });
    } else if (field === 'maritalStatus') {
      this.setData({
        'formData.maritalStatus': this.data.maritalStatusOptions[value]
      });
    } else if (field === 'zodiac') {
      this.setData({
        'formData.zodiac': this.data.zodiacOptions[value]
      });
    } else if (field === 'siblings') {
      this.setData({
        'formData.siblings': this.data.siblingsOptions[value]
      });
    } else if (field === 'birthYear') {
      const yearValue = e.detail.value;  // date picker直接返回值，不是索引
      this.setData({
        'formData.birthYear': yearValue,
        'formData.age': this.calculateAge(yearValue),
        'formData.zodiac': this.getZodiacByYear(yearValue)
      });
    }
  },

  // 计算年龄
  calculateAge(birthYear) {
    if (!birthYear) return '';
    const currentYear = new Date().getFullYear();
    return (currentYear - parseInt(birthYear)).toString();
  },

  // 根据年份获取属相
  getZodiacByYear(year) {
    if (!year) return '';
    const zodiacs = this.data.zodiacOptions;
    // 1900年是鼠年，计算偏移量
    const offset = (parseInt(year) - 1900) % 12;
    return zodiacs[offset];
  },

  // 提交表单
  async submitForm(data) {
    const formData = data || this.data.formData;
    
    // 验证必填字段
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.phone.trim()) {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      });
      return;
    }
    
    try {
      // 获取用户openid
      const openid = wx.getStorageSync('openid') || '';
      
      // 准备保存数据
      const memberData = {
        ...formData,
        id: this.data.isEditing ? this.data.currentMemberId : this.generateId(), // 在编辑模式下使用当前ID
        openid: openid,
        createdAt: new Date().toISOString()
      };
      
      let result;
      if (this.data.isEditing) {
        // 编辑模式：更新现有记录
        const db = wx.cloud.database();
        result = await db.collection('member').where({
          id: this.data.currentMemberId
        }).update({
          data: memberData
        });
        
        if (result.stats.updated > 0) {
          result = { success: true };
        } else {
          throw new Error('更新失败');
        }
      } else {
        // 添加模式：保存新记录
        // 使用app.js中定义的云数据库保存函数
        result = await app.saveMemberWithSDK(memberData);
      }
      
      if (result.success) {
        wx.showToast({
          title: this.data.isEditing ? '更新成功' : '保存成功',
          icon: 'success'
        });
        
        // 延迟返回上一页，让用户看到成功提示
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.message || '操作失败');
      }
    } catch (error) {
      console.error(this.data.isEditing ? '更新会员失败:' : '保存会员失败:', error);
      
      wx.showToast({
        title: this.data.isEditing ? '更新失败' : '保存失败',
        icon: 'none'
      });
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
    
    // 在编辑模式下，保持原始ID不变
      if (this.data.isEditing) {
        completeFormData.id = this.data.currentMemberId;
        
        // 更新云数据库中的会员数据
        try {
          const db = wx.cloud.database();
          const result = await db.collection('member').where({
            id: this.data.currentMemberId
          }).update({
            data: completeFormData
          });
          
          if (result.stats.updated > 0) {
            wx.showToast({
              title: '更新成功',
              icon: 'success'
            });
            
            // 延迟返回上一页，让用户看到成功提示
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
            return;
          }
        } catch (error) {
          console.error('更新云数据库中的会员数据失败:', error);
        }
      }
    
    await this.submitForm(completeFormData);
  },

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // 重置表单
  formReset() {
    const defaultBirthYear = '1998';
    this.setData({
      formData: {
        memberId: '',
        name: '',
        gender: '',
        birthYear: defaultBirthYear,
        age: this.calculateAge(defaultBirthYear),
        phone: '',
        occupation: '',
        income: '',
        education: '',
        height: '',
        maritalStatus: '',
        requirements: '',
        hobbies: '',
        selfIntroduction: '',
        zodiac: this.getZodiacByYear(defaultBirthYear),
        house: '',
        car: '',
        siblings: ''
      }
    });
  }
});
