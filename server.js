const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');
const path = require('path');

// Serve static files from the current directory
app.use(express.static(__dirname));

// Add a specific route for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 定義數據文件路徑
const todosFilePath = path.join(__dirname, 'todos.json');

// 從文件加載待辦事項
let sharedTodos = [];
try {
    if (fs.existsSync(todosFilePath)) {
        const data = fs.readFileSync(todosFilePath, 'utf8');
        sharedTodos = JSON.parse(data);
    }
} catch (err) {
    console.log('Starting with empty todos list:', err);
}

// 保存待辦事項到文件
function saveTodos() {
    try {
        fs.writeFileSync(todosFilePath, JSON.stringify(sharedTodos), 'utf8');
    } catch (err) {
        console.error('Error saving todos:', err);
    }
}

io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.emit('init-todos', sharedTodos);

    socket.on('add-todo', (todo) => {
        console.log('Received new todo:', todo);
        // 保存當前所有待辦事項的完成狀態
        const todoStates = sharedTodos.map(t => ({
            text: t.text,
            completed: t.completed,
            completedAt: t.completedAt,
            remark: t.remark
        }));
        
        // 添加新待辦事項
        sharedTodos.unshift(todo);
        
        // 恢復原有待辦事項的狀態
        for (let i = 1; i < sharedTodos.length; i++) {
            sharedTodos[i].completed = todoStates[i-1].completed;
            sharedTodos[i].completedAt = todoStates[i-1].completedAt;
            sharedTodos[i].remark = todoStates[i-1].remark;
        }
        
        io.emit('todos-updated', sharedTodos);
        console.log('Updated todos:', sharedTodos);
    });

    // 處理待辦事項狀態更新
    // 處理待辦事項狀態更新
    socket.on('toggle-todo', (data) => {
        console.log('Toggling todo:', data);
        sharedTodos[data.index].completed = data.completed;
        sharedTodos[data.index].completedAt = data.completedAt;
        io.emit('todos-updated', sharedTodos);
        console.log('Updated todos after toggle:', sharedTodos);
    });

    // 處理備註更新
    socket.on('update-remark', (data) => {
        sharedTodos[data.index].remark = data.remark;
        io.emit('todos-updated', sharedTodos);
    });

    // 處理重置
    socket.on('reset-todos', () => {
        console.log('Resetting todos');
        sharedTodos = [];
        io.emit('todos-updated', sharedTodos);
        console.log('Todos reset completed');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Update PORT to use environment variable for Render
const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});