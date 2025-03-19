// 從本地存儲加載待辦事項
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// 渲染待辦事項列表
function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    // 對待辦事項進行排序，未完成的在前
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });
    
    sortedTodos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${index})">
            <div class="todo-content">
                <span class="todo-text">${todo.text}</span>
                <div class="todo-time">
                    <small>建立: ${todo.createdAt}</small>
                    ${todo.completedAt ? `<small>完成: ${todo.completedAt}</small>` : ''}
                </div>
                ${todo.completed ? `
                    <div class="todo-remark">
                        <input type="text" 
                               class="remark-input" 
                               placeholder="添加備註..." 
                               value="${todo.remark}"
                               onchange="updateRemark(${index}, this.value)">
                    </div>
                ` : ''}
            </div>
        `;
        
        todoList.appendChild(li);
    });
    
    saveTodos();
}

// 添加新的待辦事項
// 添加 Socket.IO 連接
// 確保 Socket.IO 連接建立
const socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

// 修改 addTodo 函數
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (text) {
        const newTodo = {
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString(),
            completedAt: null,
            remark: ''
        };
        
        // 發送新待辦事項到服務器
        socket.emit('add-todo', newTodo);
        input.value = '';
    }
}

// 確保正確接收服務器更新
socket.on('todos-updated', (serverTodos) => {
    console.log('Received updated todos:', serverTodos);
    todos = serverTodos;
    renderTodos();
});

// 修改 toggleTodo 函數 - 移除本地更新邏輯
function toggleTodo(index) {
    const completed = !todos[index].completed;
    socket.emit('toggle-todo', {
        index: index,
        completed: completed,
        completedAt: completed ? new Date().toLocaleString() : null
    });
    // 不再進行本地更新，完全依賴服務器回應
}

// 修改 updateRemark 函數 - 移除本地更新邏輯
function updateRemark(index, value) {
    socket.emit('update-remark', {
        index: index,
        remark: value
    });
    // 不再進行本地更新，完全依賴服務器回應
}

// 修改重置功能
document.getElementById('resetButton').addEventListener('click', function() {
    const password = prompt('請輸入重置密碼：');
    
    if (password === 'helloworld') {
        socket.emit('reset-todos');  // 發送重置請求到服務器
        alert('待辦事項已重置！');
    } else if (password !== null) {
        alert('密碼錯誤！');
    }
});

// 添加重置成功的監聽器
// 合併兩個 todos-updated 監聽器為一個
socket.on('todos-updated', (serverTodos) => {
    console.log('Received updated todos:', serverTodos);
    todos = serverTodos;
    renderTodos();
    
    // 只在列表為空時顯示重置成功提示
    if (todos.length === 0) {
        alert('待辦事項已重置！');
    }
});

// 移除第二個重複的監聽器
// socket.on('todos-updated', (serverTodos) => {
//     todos = serverTodos;
//     renderTodos();
//     if (todos.length === 0) {
//         alert('待辦事項已重置！');
//     }
// });

// 添加篩選狀態變量
let filterStatus = 'all'; // 'all', 'active', 'completed'

// 修改 renderTodos 函數
function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    let filteredTodos = [...todos];
    if (filterStatus === 'active') {
        filteredTodos = filteredTodos.filter(todo => !todo.completed);
    } else if (filterStatus === 'completed') {
        filteredTodos = filteredTodos.filter(todo => todo.completed);
    }
    
    filteredTodos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        // 使用 todos 數組中的實際索引，而不是篩選後的索引
        const originalIndex = todos.findIndex(t => t === todo);
        
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${originalIndex})">
            <div class="todo-content">
                <span class="todo-text">${todo.text}</span>
                <div class="todo-time">
                    <small>建立: ${todo.createdAt}</small>
                    ${todo.completedAt ? `<small>完成: ${todo.completedAt}</small>` : ''}
                </div>
                ${todo.completed ? `
                    <div class="todo-remark">
                        <input type="text" 
                               class="remark-input" 
                               placeholder="添加備註..." 
                               value="${todo.remark}"
                               onchange="updateRemark(${originalIndex}, this.value)">
                    </div>
                ` : ''}
            </div>
        `;
        
        todoList.appendChild(li);
    });
    
    // 更新篩選按鈕狀態
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filterStatus) {
            btn.classList.add('active');
        }
    });
    
    saveTodos();
}

// 添加篩選功能
function filterTodos(status) {
    filterStatus = status;
    renderTodos();
}

// 移除本地 toggleTodo 實現
// 切換待辦事項狀態
// function toggleTodo(index) {
//     todos[index].completed = !todos[index].completed;
//     todos[index].completedAt = todos[index].completed ? new Date().toLocaleString() : null;
//     renderTodos();
// }

// 移除本地 updateRemark 實現
// function updateRemark(index, value) {
//     todos[index].remark = value;
//     saveTodos();
// }

// 刪除待辦事項
function deleteTodo(index) {
    todos.splice(index, 1);
    renderTodos();
}

// 保存到本地存儲
// 修改 saveTodos 函數 - 完全移除本地存儲
function saveTodos() {
    // 不再使用本地存儲，完全依賴服務器
}

// 監聽輸入框的回車事件
document.getElementById('todoInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});
// 添加重置功能
// 修改重置功能 - 保留這個使用 socket 的版本
document.getElementById('resetButton').addEventListener('click', function() {
    const password = prompt('請輸入重置密碼：');
    
    if (password === 'helloworld') {
        socket.emit('reset-todos');  // 發送重置請求到服務器
    } else if (password !== null) {
        alert('密碼錯誤！');
    }
});

// 移除以下所有重複的重置功能代碼
// document.getElementById('resetButton').addEventListener('click', function() {
//     const password = prompt('請輸入重置密碼：');
//     
//     if (password === 'yeahyeah') {
//         socket.emit('reset-todos');  // 發送重置請求到服務器
//     } else if (password !== null) {
//         alert('密碼錯誤！');
//     }
// });

// 移除這個重複的重置功能
// document.getElementById('resetButton').addEventListener('click', function() {
//     const password = prompt('請輸入重置密碼：');
//     
//     if (password === 'yeahyeah') {
//         todos = [];
//         renderTodos();
//         alert('待辦事項已重置！');
//     } else if (password !== null) {
//         alert('密碼錯誤！');
//     }
// });

// 添加初始化數據的監聽器
socket.on('init-todos', (serverTodos) => {
    console.log('Received initial todos:', serverTodos);
    todos = serverTodos;
    renderTodos();
});

// 初始化渲染
renderTodos();
