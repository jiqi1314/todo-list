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
// 確保正確設置 Socket.IO 連接
const socket = io();

// 從服務器接收初始數據
socket.on('init-todos', (serverTodos) => {
    console.log('Received initial todos:', serverTodos);
    todos = serverTodos;
    renderTodos();
});

// 接收服務器更新
socket.on('todos-updated', (serverTodos) => {
    console.log('Received updated todos:', serverTodos);
    todos = serverTodos;
    renderTodos();
});

// 修改 toggleTodo 函數確保正確發送狀態更新
function toggleTodo(index) {
    const completed = !todos[index].completed;
    console.log('Toggling todo at index:', index, 'to completed:', completed);
    socket.emit('toggle-todo', {
        index: index,
        completed: completed,
        completedAt: completed ? new Date().toLocaleString() : null
    });
    // 不要在這裡直接修改本地數據，等待服務器回應
}

// 修改 updateRemark 函數
function updateRemark(index, value) {
    console.log('Updating remark at index:', index);
    socket.emit('update-remark', {
        index: index,
        remark: value
    });
    // 不要在這裡直接修改本地數據，等待服務器回應
}

// 修改重置功能
document.getElementById('resetButton').addEventListener('click', function() {
    const password = prompt('請輸入重置密碼：');
    
    if (password === 'yeahyeah') {
        console.log('Sending reset request');
        socket.emit('reset-todos');
    } else if (password !== null) {
        alert('密碼錯誤！');
    }
});

// 添加重置成功的監聽器
socket.on('todos-updated', (serverTodos) => {
    todos = serverTodos;
    renderTodos();
    if (todos.length === 0) {
        alert('待辦事項已重置！');
    }
});

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

function updateRemark(index, value) {
    todos[index].remark = value;
    saveTodos();
}

// 切換待辦事項狀態
function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    todos[index].completedAt = todos[index].completed ? new Date().toLocaleString() : null;
    renderTodos();
}

// 刪除待辦事項
function deleteTodo(index) {
    todos.splice(index, 1);
    renderTodos();
}

// 保存到本地存儲
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 監聽輸入框的回車事件
document.getElementById('todoInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});
// 添加重置功能
document.getElementById('resetButton').addEventListener('click', function() {
    const password = prompt('請輸入重置密碼：');
    
    if (password === 'yeahyeah') {
        todos = [];
        renderTodos();
        alert('待辦事項已重置！');
    } else if (password !== null) {
        alert('密碼錯誤！');
    }
});

// 初始化渲染
renderTodos();
