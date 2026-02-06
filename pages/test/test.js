// test.js
Page({
  data: {
    testData: [],
    testResult: ''
  },

  onLoad() {
    this.testDatabaseConnection();
  },

  async testDatabaseConnection() {
    try {
      const db = wx.cloud.database();
      
      // 获取所有会员数据
      const result = await db.collection('member').get();
      // console.log('从云数据库获取的所有数据:', result.data);
      
      if (result.data && result.data.length > 0) {
        // 取第一条数据进行测试
        const firstMember = result.data[0];
        console.log('第一个会员的云数据库_id:', firstMember._id);
        console.log('第一个会员的自定义id:', firstMember.id);
        console.log('第一个会员的所有字段:', Object.keys(firstMember));
        
        // 测试使用自定义id查询
        const queryById = await db.collection('member').where({
          id: firstMember.id
        }).get();
        
        console.log('使用自定义id查询结果:', queryById.data);
        
        // 测试使用云数据库_id查询
        const queryByDocId = await db.collection('member').doc(firstMember._id).get();
        
        console.log('使用云数据库_doc查询结果:', queryByDocId.data);
        
        // 特别测试传入的ID '1769409676169'
        const specificQuery = await db.collection('member').where({
          id: '1769409676169'
        }).get();
        
        console.log('查询特定ID \'1769409676169\' 的结果:', specificQuery.data);
        
        // 检查数据库中是否真的存在该ID
        const allIds = result.data.map(member => member.id);
        console.log('数据库中所有ID:', allIds);
        const exists = allIds.includes('1769409676169');
        console.log('ID \'1769409676169\' 是否存在于数据库中:', exists);
        
        this.setData({
          testResult: `测试完成：
          云数据库_id: ${firstMember._id}
          自定义id: ${firstMember.id}
          使用自定义id查询到 ${queryById.data.length} 条记录
          使用云数据库_doc查询到 ${queryByDocId.data.data.length} 条记录
          查询ID '1769409676169' 结果: ${specificQuery.data.length} 条记录
          ID '1769409676169' 存在于数据库中: ${exists}`
        });
      } else {
        this.setData({
          testResult: '数据库中没有会员数据'
        });
      }
    } catch (error) {
      console.error('测试数据库连接失败:', error);
      this.setData({
        testResult: `测试失败: ${error.message}`
      });
    }
  }
})