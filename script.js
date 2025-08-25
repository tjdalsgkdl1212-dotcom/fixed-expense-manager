// 고정지출 목록을 저장할 배열
let expenseItems = [];

// 페이지 로드 시 저장된 데이터 불러오기
window.addEventListener('load', function() {
    loadExpenseItems();
    displayExpenseItems();
});

// 저장된 고정지출 불러오기
function loadExpenseItems() {
    const saved = localStorage.getItem('fixedExpenses');
    if (saved) {
        expenseItems = JSON.parse(saved);
    }
}

// 고정지출 데이터 저장하기
function saveExpenseItems() {
    localStorage.setItem('fixedExpenses', JSON.stringify(expenseItems));
}

// 추가하기 버튼과 입력 필드 연결
document.getElementById('add-btn').addEventListener('click', function() {
    const expenseName = document.getElementById('expense-name').value;
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const paymentDate = document.getElementById('payment-date').value;
    
    // 입력값이 있는지 확인
    if (expenseName && category && amount && paymentDate) {
        // 새 고정지출 추가
        expenseItems.push({
            name: expenseName,
            category: category,
            amount: parseInt(amount),
            paymentDate: parseInt(paymentDate), // 숫자로 저장
            dateAdded: new Date().toISOString()
        });
        
        // 데이터 저장
        saveExpenseItems();
        
        // 화면에 표시
        displayExpenseItems();
        
        // 입력 필드 초기화
        document.getElementById('expense-name').value = '';
        document.getElementById('category').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('payment-date').value = '';
    } else {
        alert('모든 항목을 입력해주세요!');
    }
});

// 고정지출 목록을 화면에 표시하는 함수
function displayExpenseItems() {
    const container = document.getElementById('expense-items');
    container.innerHTML = '';
    
    if (expenseItems.length === 0) {
        container.innerHTML = '<p style="color: #999;">아직 등록된 고정지출이 없습니다.</p>';
        updateStats();
        return;
    }
    
    // 금액 순으로 정렬 (높은 순)
    const sortedExpenses = [...expenseItems].sort((a, b) => b.amount - a.amount);
    
    sortedExpenses.forEach(function(item, index) {
        const expenseDiv = document.createElement('div');
        const originalIndex = expenseItems.findIndex(exp => 
            exp.name === item.name && exp.amount === item.amount && exp.paymentDate === item.paymentDate
        );
        
        // 고액 지출 판단 (5만원 이상)
        let itemClass = 'expense-item';
        if (item.amount >= 50000) {
            itemClass += ' high-amount';
        }
        
        const paymentDay = item.paymentDate; // 이미 숫자로 저장됨
        
        // 등록일로부터 경과 시간 계산
        const registeredDate = new Date(item.dateAdded);
        const now = new Date();
        const timeDiff = now.getTime() - registeredDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        let registeredText = '';
        if (daysDiff === 0) {
            registeredText = '오늘 등록';
        } else if (daysDiff === 1) {
            registeredText = '어제 등록';
        } else if (daysDiff < 7) {
            registeredText = `${daysDiff}일 전 등록`;
        } else if (daysDiff < 30) {
            const weeksDiff = Math.floor(daysDiff / 7);
            registeredText = `${weeksDiff}주일 전 등록`;
        } else {
            const formattedDate = `${(registeredDate.getMonth() + 1).toString().padStart(2, '0')}.${registeredDate.getDate().toString().padStart(2, '0')}`;
            registeredText = `${formattedDate} 등록`;
        }
        
        expenseDiv.className = itemClass;
        expenseDiv.innerHTML = `
            <div class="expense-info">
                <div class="expense-name">${item.name}</div>
                <div class="expense-details">${item.category} • 결제일: ${paymentDay}일 • ${registeredText}</div>
            </div>
            <div class="expense-amount">${item.amount.toLocaleString()}원</div>
            <div class="menu-container">
                <button class="menu-btn" onclick="toggleMenu(${originalIndex})">⋮</button>
                <div class="menu-dropdown" id="menu-${originalIndex}">
                    <button class="menu-item edit" onclick="editExpense(${originalIndex})">수정</button>
                    <button class="menu-item delete" onclick="deleteExpense(${originalIndex})">삭제</button>
                </div>
            </div>
        `;
        container.appendChild(expenseDiv);
    });
    
    // 통계 업데이트
    updateStats();
}

// 고정지출 삭제 함수
function deleteExpense(index) {
    if (confirm('정말 삭제하시겠습니까?')) {
        expenseItems.splice(index, 1);
        saveExpenseItems();
        displayExpenseItems();
        closeAllMenus();
    }
}

// 메뉴 토글 함수
function toggleMenu(index) {
    // 다른 모든 메뉴 닫기
    closeAllMenus();
    
    // 현재 메뉴 토글
    const menu = document.getElementById(`menu-${index}`);
    if (menu) {
        menu.classList.toggle('show');
    }
}

// 모든 메뉴 닫기
function closeAllMenus() {
    const allMenus = document.querySelectorAll('.menu-dropdown');
    allMenus.forEach(menu => {
        menu.classList.remove('show');
    });
}

// 수정 기능
function editExpense(index) {
    const item = expenseItems[index];
    
    // 입력 필드에 현재 값 설정
    document.getElementById('expense-name').value = item.name;
    document.getElementById('category').value = item.category;
    document.getElementById('amount').value = item.amount;
    document.getElementById('payment-date').value = item.paymentDate;
    
    // 기존 항목 삭제
    expenseItems.splice(index, 1);
    saveExpenseItems();
    displayExpenseItems();
    closeAllMenus();
    
    // 사용자에게 알림
    alert('수정할 내용을 입력하고 "추가하기" 버튼을 눌러주세요.');
}

// 페이지 다른 곳 클릭시 메뉴 닫기
document.addEventListener('click', function(event) {
    if (!event.target.closest('.menu-container')) {
        closeAllMenus();
    }
});

// 통계 업데이트 함수
function updateStats() {
    const statsContainer = document.getElementById('stats-content');
    
    if (!statsContainer) {
        return;
    }
    
    const total = expenseItems.length;
    
    if (total === 0) {
        statsContainer.innerHTML = '<p>등록된 고정지출이 없습니다.</p>';
        return;
    }
    
    // 총 월 지출액 계산
    const totalAmount = expenseItems.reduce((sum, item) => sum + item.amount, 0);
    
    // 카테고리별 개수
    const categories = {};
    expenseItems.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + 1;
    });
    
    // 고액 지출 개수 (5만원 이상)
    const highExpenses = expenseItems.filter(item => item.amount >= 50000).length;
    
    // 최다 카테고리 찾기
    const mostCategory = Object.keys(categories).reduce((a, b) => 
        categories[a] > categories[b] ? a : b, Object.keys(categories)[0] || '없음'
    );
    
    statsContainer.innerHTML = `
        <div class="stats-top">
            <div class="stat-item total">
                <span class="stat-number">${totalAmount.toLocaleString()}</span>
                <span class="stat-label">월 총 지출</span>
            </div>
            <div class="stat-row">
                <div class="stat-item-small">
                    <span class="stat-number-small">${total}</span>
                    <span class="stat-label-small">지출 항목</span>
                </div>
                <div class="stat-item-small">
                    <span class="stat-number-small">${highExpenses}</span>
                    <span class="stat-label-small">고액 지출</span>
                </div>
                <div class="stat-item-small">
                    <span class="stat-number-small">${mostCategory}</span>
                    <span class="stat-label-small">최다 카테고리</span>
                </div>
            </div>
        </div>
        <div class="yearly-summary">
            연간 예상 지출: <strong>${(totalAmount * 12).toLocaleString()}원</strong>
        </div>
    `;
}

// 월별 차트 생성 함수
function generateMonthlyChart(monthlyAmount) {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const currentMonth = new Date().getMonth();
    
    let chartHTML = '<div class="chart-bars">';
    
    months.forEach((month, index) => {
        const isPast = index < currentMonth;
        const isCurrent = index === currentMonth;
        const height = isPast ? 100 : (isCurrent ? 80 : 60); // 지난달 100%, 현재월 80%, 미래월 60%
        
        let barClass = 'chart-bar';
        if (isPast) barClass += ' past';
        else if (isCurrent) barClass += ' current';
        else barClass += ' future';
        
        chartHTML += `
            <div class="chart-item">
                <div class="${barClass}" style="height: ${height}%"></div>
                <span class="chart-label">${month}</span>
            </div>
        `;
    });
    
    chartHTML += '</div>';
    return chartHTML;
}
