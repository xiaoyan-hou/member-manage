// 会员管理系统 JavaScript

// 数据存储
let members = JSON.parse(localStorage.getItem('datingMembers')) || [];
let currentEditingId = null;

// DOM 元素
const addMemberSection = document.getElementById('addMemberSection');
const membersListSection = document.getElementById('membersListSection');
const filterSection = document.getElementById('filterSection');
const addMemberBtn = document.getElementById('addMemberBtn');
const viewMembersBtn = document.getElementById('viewMembersBtn');
const filterMembersBtn = document.getElementById('filterMembersBtn');
const memberForm = document.getElementById('memberForm');
const filterForm = document.getElementById('filterForm');
const membersList = document.getElementById('membersList');
const filterResultsList = document.getElementById('filterResultsList');
const memberModal = document.getElementById('memberModal');
const modalClose = document.querySelector('.close');

// 导航功能
addMemberBtn.addEventListener('click', () => showSection('add'));
viewMembersBtn.addEventListener('click', () => showSection('list'));
filterMembersBtn.addEventListener('click', () => showSection('filter'));

function showSection(section) {
    // 隐藏所有section
    addMemberSection.style.display = 'none';
    membersListSection.style.display = 'none';
    filterSection.style.display = 'none';
    
    // 移除所有按钮的active状态
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // 显示对应的section和激活对应按钮
    switch(section) {
        case 'add':
            addMemberSection.style.display = 'block';
            addMemberBtn.classList.add('active');
            break;
        case 'list':
            membersListSection.style.display = 'block';
            viewMembersBtn.classList.add('active');
            displayMembers();
            break;
        case 'filter':
            filterSection.style.display = 'block';
            filterMembersBtn.classList.add('active');
            break;
    }
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 保存会员信息
memberForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const memberData = {
        id: currentEditingId || generateId(),
        name: document.getElementById('name').value.trim(),
        gender: document.getElementById('gender').value,
        age: parseInt(document.getElementById('age').value),
        phone: document.getElementById('phone').value.trim(),
        occupation: document.getElementById('occupation').value.trim(),
        income: document.getElementById('income').value,
        education: document.getElementById('education').value,
        height: document.getElementById('height').value ? parseInt(document.getElementById('height').value) : null,
        maritalStatus: document.getElementById('maritalStatus').value,
        requirements: document.getElementById('requirements').value.trim(),
        hobbies: document.getElementById('hobbies').value.trim(),
        selfIntroduction: document.getElementById('selfIntroduction').value.trim(),
        createdAt: currentEditingId ? members.find(m => m.id === currentEditingId).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (currentEditingId) {
        // 编辑模式
        const index = members.findIndex(m => m.id === currentEditingId);
        if (index !== -1) {
            members[index] = memberData;
            showMessage('会员信息更新成功！', 'success');
        }
        currentEditingId = null;
    } else {
        // 添加新会员
        members.push(memberData);
        showMessage('会员信息添加成功！', 'success');
    }
    
    // 保存到本地存储
    localStorage.setItem('datingMembers', JSON.stringify(members));
    
    // 重置表单
    memberForm.reset();
    
    // 更新统计
    updateStats();
});

// 显示会员列表
function displayMembers() {
    if (members.length === 0) {
        membersList.innerHTML = `
            <div class="empty-state">
                <h3>暂无会员信息</h3>
                <p>点击"添加会员"开始录入会员信息</p>
            </div>
        `;
        return;
    }
    
    membersList.innerHTML = members.map(member => `
        <div class="member-card" onclick="showMemberDetails('${member.id}')">
            <div class="member-header">
                <div class="member-name">${member.name}</div>
                <div class="member-gender ${member.gender === '男' ? 'male' : 'female'}">${member.gender}</div>
            </div>
            <div class="member-info">
                <div class="member-info-item">
                    <div class="member-info-label">年龄</div>
                    <div class="member-info-value">${member.age}岁</div>
                </div>
                <div class="member-info-item">
                    <div class="member-info-label">身高</div>
                    <div class="member-info-value">${member.height ? member.height + 'cm' : '未填写'}</div>
                </div>
                <div class="member-info-item">
                    <div class="member-info-label">职业</div>
                    <div class="member-info-value">${member.occupation}</div>
                </div>
                <div class="member-info-item">
                    <div class="member-info-label">收入</div>
                    <div class="member-info-value">${member.income}</div>
                </div>
                <div class="member-info-item">
                    <div class="member-info-label">学历</div>
                    <div class="member-info-value">${member.education}</div>
                </div>
                <div class="member-info-item">
                    <div class="member-info-label">婚姻状况</div>
                    <div class="member-info-value">${member.maritalStatus}</div>
                </div>
            </div>
            ${member.requirements ? `
                <div class="member-requirements">
                    <strong>择偶要求：</strong>${member.requirements}
                </div>
            ` : ''}
            <div class="member-actions" onclick="event.stopPropagation()">
                <button class="btn btn-edit" onclick="editMember('${member.id}')">编辑</button>
                <button class="btn btn-danger" onclick="deleteMember('${member.id}')">删除</button>
            </div>
        </div>
    `).join('');
    
    updateStats();
}

// 更新统计信息
function updateStats() {
    document.getElementById('totalMembers').textContent = members.length;
    document.getElementById('maleCount').textContent = members.filter(m => m.gender === '男').length;
    document.getElementById('femaleCount').textContent = members.filter(m => m.gender === '女').length;
}

// 删除会员
function deleteMember(id) {
    if (confirm('确定要删除这个会员信息吗？')) {
        members = members.filter(member => member.id !== id);
        localStorage.setItem('datingMembers', JSON.stringify(members));
        displayMembers();
        showMessage('会员信息删除成功！', 'success');
    }
}

// 编辑会员
function editMember(id) {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    currentEditingId = id;
    
    // 填充表单
    document.getElementById('name').value = member.name;
    document.getElementById('gender').value = member.gender;
    document.getElementById('age').value = member.age;
    document.getElementById('phone').value = member.phone;
    document.getElementById('occupation').value = member.occupation;
    document.getElementById('income').value = member.income;
    document.getElementById('education').value = member.education;
    document.getElementById('height').value = member.height || '';
    document.getElementById('maritalStatus').value = member.maritalStatus;
    document.getElementById('requirements').value = member.requirements;
    document.getElementById('hobbies').value = member.hobbies;
    document.getElementById('selfIntroduction').value = member.selfIntroduction;
    
    // 切换到添加会员页面
    showSection('add');
    
    // 滚动到表单顶部
    document.getElementById('addMemberSection').scrollIntoView({ behavior: 'smooth' });
}

// 显示会员详情
function showMemberDetails(id) {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    const memberDetails = document.getElementById('memberDetails');
    memberDetails.innerHTML = `
        <div class="member-detail">
            <h3>${member.name} 的详细信息</h3>
            <div class="member-detail-grid">
                <div class="member-detail-item">
                    <div class="member-detail-label">姓名</div>
                    <div class="member-detail-value">${member.name}</div>
                </div>
                <div class="member-detail-item">
                    <div class="member-detail-label">性别</div>
                    <div class="member-detail-value">${member.gender}</div>
                </div>
                <div class="member-detail-item">
                    <div class="member-detail-label">年龄</div>
                    <div class="member-detail-value">${member.age}岁</div>
                </div>
                <div class="member-detail-item">
                    <div class="member-detail-label">联系电话</div>
                    <div class="member-detail-value">${member.phone}</div>
                </div>
                <div class="member-detail-item">
                    <div class="member-detail-label">职业</div>
                    <div class="member-detail-value">${member.occupation}</div>
                </div>
                <div class="member-detail-item">
                    <div class="member-detail-label">月收入</div>
                    <div class="member-detail-value">${member.income}</div>
                </div>
                <div class="member-detail-item">
                    <div class="member-detail-label">学历</div>
                    <div class="member-detail-value">${member.education}</div>
                </div>
                <div class="member-detail-item">
                    <div class="member-detail-label">身高</div>
                    <div class="member-detail-value">${member.height ? member.height + 'cm' : '未填写'}</div>
                </div>
                <div class="member-detail-item">
                    <div class="member-detail-label">婚姻状况</div>
                    <div class="member-detail-value">${member.maritalStatus}</div>
                </div>
                ${member.hobbies ? `
                    <div class="member-detail-item" style="grid-column: 1 / -1;">
                        <div class="member-detail-label">兴趣爱好</div>
                        <div class="member-detail-value">${member.hobbies}</div>
                    </div>
                ` : ''}
                ${member.selfIntroduction ? `
                    <div class="member-detail-item" style="grid-column: 1 / -1;">
                        <div class="member-detail-label">自我介绍</div>
                        <div class="member-detail-value">${member.selfIntroduction}</div>
                    </div>
                ` : ''}
                ${member.requirements ? `
                    <div class="member-detail-item" style="grid-column: 1 / -1;">
                        <div class="member-detail-label">择偶要求</div>
                        <div class="member-detail-value">${member.requirements}</div>
                    </div>
                ` : ''}
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <button class="btn btn-edit" onclick="editMember('${member.id}'); closeModal();">编辑信息</button>
                <button class="btn btn-danger" onclick="if(confirm('确定要删除这个会员吗？')) { deleteMember('${member.id}'); closeModal(); }">删除会员</button>
            </div>
        </div>
    `;
    
    memberModal.style.display = 'block';
}

// 关闭模态框
function closeModal() {
    memberModal.style.display = 'none';
}

modalClose.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === memberModal) {
        closeModal();
    }
});

// 筛选功能
filterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const filterData = {
        gender: document.getElementById('filterGender').value,
        ageMin: document.getElementById('filterAgeMin').value ? parseInt(document.getElementById('filterAgeMin').value) : null,
        ageMax: document.getElementById('filterAgeMax').value ? parseInt(document.getElementById('filterAgeMax').value) : null,
        income: document.getElementById('filterIncome').value,
        education: document.getElementById('filterEducation').value,
        maritalStatus: document.getElementById('filterMaritalStatus').value
    };
    
    const filteredMembers = members.filter(member => {
        // 性别筛选
        if (filterData.gender && member.gender !== filterData.gender) {
            return false;
        }
        
        // 年龄筛选
        if (filterData.ageMin && member.age < filterData.ageMin) {
            return false;
        }
        if (filterData.ageMax && member.age > filterData.ageMax) {
            return false;
        }
        
        // 收入筛选
        if (filterData.income && member.income !== filterData.income) {
            return false;
        }
        
        // 学历筛选
        if (filterData.education && member.education !== filterData.education) {
            return false;
        }
        
        // 婚姻状况筛选
        if (filterData.maritalStatus && member.maritalStatus !== filterData.maritalStatus) {
            return false;
        }
        
        return true;
    });
    
    displayFilterResults(filteredMembers, filterData);
});

// 显示筛选结果
function displayFilterResults(filteredMembers, filterData) {
    const filterResults = document.getElementById('filterResults');
    const filterResultsList = document.getElementById('filterResultsList');
    
    if (filteredMembers.length === 0) {
        filterResultsList.innerHTML = `
            <div class="empty-state">
                <h3>没有找到符合条件的会员</h3>
                <p>请尝试调整筛选条件</p>
            </div>
        `;
    } else {
        filterResultsList.innerHTML = filteredMembers.map(member => `
            <div class="member-card" onclick="showMemberDetails('${member.id}')">
                <div class="member-header">
                    <div class="member-name">${member.name}</div>
                    <div class="member-gender ${member.gender === '男' ? 'male' : 'female'}">${member.gender}</div>
                </div>
                <div class="member-info">
                    <div class="member-info-item">
                        <div class="member-info-label">年龄</div>
                        <div class="member-info-value">${member.age}岁</div>
                    </div>
                    <div class="member-info-item">
                        <div class="member-info-label">职业</div>
                        <div class="member-info-value">${member.occupation}</div>
                    </div>
                    <div class="member-info-item">
                        <div class="member-info-label">收入</div>
                        <div class="member-info-value">${member.income}</div>
                    </div>
                    <div class="member-info-item">
                        <div class="member-info-label">学历</div>
                        <div class="member-info-value">${member.education}</div>
                    </div>
                </div>
                ${member.requirements ? `
                    <div class="member-requirements">
                        <strong>择偶要求：</strong>${member.requirements}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    // 显示筛选条件摘要
    const conditionSummary = [];
    if (filterData.gender) conditionSummary.push(`性别：${filterData.gender}`);
    if (filterData.ageMin || filterData.ageMax) {
        const ageRange = `${filterData.ageMin || '不限'}-${filterData.ageMax || '不限'}岁`;
        conditionSummary.push(`年龄：${ageRange}`);
    }
    if (filterData.income) conditionSummary.push(`收入：${filterData.income}`);
    if (filterData.education) conditionSummary.push(`学历：${filterData.education}`);
    if (filterData.maritalStatus) conditionSummary.push(`婚姻状况：${filterData.maritalStatus}`);
    
    const summaryText = conditionSummary.length > 0 ? 
        `<p><strong>筛选条件：</strong>${conditionSummary.join('，')} | 找到 ${filteredMembers.length} 位符合条件的会员</p>` :
        `<p><strong>筛选结果：</strong>找到 ${filteredMembers.length} 位会员</p>`;
    
    filterResults.innerHTML = `
        <h3>筛选结果</h3>
        ${summaryText}
        <div id="filterResultsList" class="members-list">
            ${filterResultsList.innerHTML}
        </div>
    `;
    
    filterResults.style.display = 'block';
}

// 显示消息
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 页面加载时初始化
window.addEventListener('load', function() {
    updateStats();
    showSection('add'); // 默认显示添加会员页面
});

// 表单验证
function validateForm() {
    const requiredFields = ['name', 'gender', 'age', 'phone', 'occupation', 'income', 'education', 'maritalStatus'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            field.style.borderColor = '#e1e5e9';
        }
    });
    
    // 验证年龄范围
    const ageField = document.getElementById('age');
    const age = parseInt(ageField.value);
    if (age < 18 || age > 80) {
        ageField.style.borderColor = '#dc3545';
        isValid = false;
    }
    
    // 验证手机号格式（简单验证）
    const phoneField = document.getElementById('phone');
    const phone = phoneField.value.trim();
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        phoneField.style.borderColor = '#dc3545';
        isValid = false;
    }
    
    return isValid;
}

// 在表单提交前添加验证
memberForm.addEventListener('submit', function(e) {
    if (!validateForm()) {
        e.preventDefault();
        showMessage('请填写完整的会员信息！', 'error');
        return;
    }
});

// 输入框获得焦点时清除错误样式
document.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('focus', function() {
        this.style.borderColor = '#e1e5e9';
    });
});