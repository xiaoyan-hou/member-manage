// pages/edit-member/edit-member.js
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
      maritalStatus: '', // 婚姻状况
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

    memberId: null, // 正在编辑的会员ID
    cloudRecordId: null // 云数据库记录的_id
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      this.setData({
        memberId: id
      });
      // 加载会员数据用于编辑
      this.loadMemberData(id);
    }
  },

  // 加载会员数据用于编辑
  async loadMemberData(id) {
    try {
      // 从云数据库获取会员数据
      const db = wx.cloud.database();
      const result = await db.collection('member').where({
        id: id
      }).get();
      
      // 由于where查询返回的是数组，我们需要取第一个元素
      const member = result && result.data && result.data.length > 0 ? result.data[0] : null;
      
      if (member) {
        // 保存云数据库记录的_id，用于后续更新
        this.setData({
          cloudRecordId: member._id
        });
        
        // 计算年龄（如果birthYear存在）
        let age = member.age || '';
        if (member.birthYear) {
          age = this.calculateAge(member.birthYear);
        }
        
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
        const localMember = app.getMemberById(id);
        if (localMember) {
          // 计算年龄
          let age = localMember.age || '';
          if (localMember.birthYear) {
            age = this.calculateAge(localMember.birthYear);
          }
          
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
      console.error('加载会员数据失败:', error);
      wx.showToast({
        title: '加载会员数据失败',
        icon: 'none'
      });
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

  // 表单提交事件 - 只处理更新
  async formSubmit(e) {
    const formData = e.detail.value;
    
    // 合并表单数据和picker选择的数据
    const completeFormData = {
      ...this.data.formData,
      ...formData
    };
    
    // 确保ID保持不变
    completeFormData.id = this.data.memberId;

    // 如果有云数据库记录的_id，使用云数据库更新
    if (this.data.cloudRecordId) {
      try {
        const db = wx.cloud.database();

        // 使用云数据库的_id来更新记录
        const result = await db.collection('member').doc(this.data.cloudRecordId).update({
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

    // 如果没有cloudRecordId或云数据库更新失败，尝试本地更新
    try {
      const app = getApp();
      app.updateMember(this.data.memberId, completeFormData);

      wx.showToast({
        title: '更新成功(本地)',
        icon: 'success'
      });

      // 延迟返回上一页，让用户看到成功提示
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    } catch (localError) {
      console.error('本地更新也失败:', localError);
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    }
  }
});