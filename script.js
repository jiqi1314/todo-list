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
                   onchange="toggleTodo(${todos.indexOf(todo)})">
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
                               onchange="updateRemark(${todos.indexOf(todo)}, this.value)">
                    </div>
                ` : ''}
            </div>
        `;
        
        todoList.appendChild(li);
    });
    
    saveTodos();
}

// 添加新的待辦事項
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (text) {
        todos.push({
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString(),
            completedAt: null,
            remark: ''
        });
        input.value = '';
        renderTodos();
    }
}

// 移除重複的 renderTodos 函數，保留並修改這一個
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
