// 식재료 목록을 저장할 배열
let foodItems = [];

// 페이지 로드 시 저장된 데이터 불러오기
window.addEventListener('load', function() {
    loadFoodItems();
    displayFoodItems();
});

// 저장된 식재료 불러오기
function loadFoodItems() {
    const saved = localStorage.getItem('fridgeItems');
    if (saved) {
        foodItems = JSON.parse(saved);
    }
}

// 식재료 데이터 저장하기
function saveFoodItems() {
    localStorage.setItem('fridgeItems', JSON.stringify(foodItems));
}

// 추가하기 버튼과 입력 필드 연결
document.getElementById('add-btn').addEventListener('click', function() {
    const foodName = document.getElementById('food-name').value;
    const expiryDate = document.getElementById('expiry-date').value;
    
    // 입력값이 있는지 확인
    if (foodName && expiryDate) {
        // 새 식재료 추가
        foodItems.push({
            name: foodName,
            expiry: expiryDate
        });
        
        // 데이터 저장
        saveFoodItems();
        
        // 화면에 표시
        displayFoodItems();
        
        // 입력 필드 초기화
        document.getElementById('food-name').value = '';
        document.getElementById('expiry-date').value = '';
    } else {
        alert('식재료 이름과 유통기한을 모두 입력해주세요!');
    }
});

// 식재료 목록을 화면에 표시하는 함수
function displayFoodItems() {
    const container = document.getElementById('food-items');
    container.innerHTML = '';
    
    if (foodItems.length === 0) {
        container.innerHTML = '<p style="color: #999;">아직 등록된 식재료가 없습니다.</p>';
        // 통계도 업데이트 (중요!)
        updateStats();
        return;
    }
    
    foodItems.forEach(function(item, index) {
        const foodDiv = document.createElement('div');
        const daysLeft = getDaysUntilExpiry(item.expiry);
        
        // 유통기한에 따른 스타일 결정
        let itemClass = 'food-item';
        let statusText = '';
        
        if (daysLeft < 0) {
            itemClass += ' expired';
            statusText = ' (유통기한 지남!)';
        } else if (daysLeft <= 3) {
            itemClass += ' warning';
            statusText = ` (${daysLeft}일 남음!)`;
        } else {
            statusText = ` (${daysLeft}일 남음)`;
        }
        
        foodDiv.className = itemClass;
        foodDiv.innerHTML = `
            <div class="food-info">
                <strong>${item.name}</strong>
                <span>유통기한: ${item.expiry}${statusText}</span>
            </div>
            <button class="delete-btn" onclick="deleteFood(${index})">삭제</button>
        `;
        container.appendChild(foodDiv);
    });
    
    // 통계 업데이트
    updateStats();
}

// 식재료 삭제 함수
function deleteFood(index) {
    foodItems.splice(index, 1);
    saveFoodItems();
    displayFoodItems();
}

// 유통기한까지 남은 일수 계산
function getDaysUntilExpiry(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
}

// 통계 업데이트 함수
// 통계 업데이트 함수
function updateStats() {
    const statsContainer = document.getElementById('stats-content');
    
    // stats-content 요소가 존재하는지 확인
    if (!statsContainer) {
        return; // 요소가 없으면 함수 종료
    }
    
    const total = foodItems.length;
    
    if (total === 0) {
        statsContainer.innerHTML = '<p>등록된 식재료가 없습니다.</p>';
        return;
    }
    
    let expired = 0;
    let warning = 0;
    let fresh = 0;
    
    foodItems.forEach(function(item) {
        const daysLeft = getDaysUntilExpiry(item.expiry);
        if (daysLeft < 0) {
            expired++;
        } else if (daysLeft <= 3) {
            warning++;
        } else {
            fresh++;
        }
    });
    
    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-number">${total}</span>
                <span class="stat-label">전체</span>
            </div>
            <div class="stat-item fresh">
                <span class="stat-number">${fresh}</span>
                <span class="stat-label">신선</span>
            </div>
            <div class="stat-item warning">
                <span class="stat-number">${warning}</span>
                <span class="stat-label">주의</span>
            </div>
            <div class="stat-item expired">
                <span class="stat-number">${expired}</span>
                <span class="stat-label">만료</span>
            </div>
        </div>
    `;
}