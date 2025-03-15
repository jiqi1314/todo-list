const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

let sharedTodos = [];

io.on('connection', (socket) => {
    console.log('New client connected');
    
    // 發送初始數據
    socket.emit('init-todos', sharedTodos);

    socket.on('add-todo', (todo) => {
        console.log('Received new todo:', todo);
        // 保存當前所有待辦事項的完成狀態
        const todoStates = sharedTodos.map(t => ({
            text: t.text,
            completed: t.completed,
            completedAt: t.completedAt,
            remark: t.remark,
            createdAt: t.createdAt
        }));
        
        // 添加新待辦事項
        sharedTodos.unshift(todo);
        
        // 恢復原有待辦事項的狀態
        for (let i = 1; i < sharedTodos.length && i-1 < todoStates.length; i++) {
            sharedTodos[i].completed = todoStates[i-1].completed;
            sharedTodos[i].completedAt = todoStates[i-1].completedAt;
            sharedTodos[i].remark = todoStates[i-1].remark;
            sharedTodos[i].createdAt = todoStates[i-1].createdAt;
        }
        
        // 廣播更新給所有客戶端
        io.emit('todos-updated', sharedTodos);
        console.log('Updated todos:', sharedTodos);
    });

    // 處理待辦事項狀態更新
    socket.on('toggle-todo', (data) => {
        console.log('Toggling todo:', data);
        if (data.index >= 0 && data.index < sharedTodos.length) {
            sharedTodos[data.index].completed = data.completed;
            sharedTodos[data.index].completedAt = data.completedAt;
            // 廣播更新給所有客戶端
            io.emit('todos-updated', sharedTodos);
            console.log('Updated todos after toggle:', sharedTodos);
        } else {
            console.error('Invalid todo index:', data.index);
        }
    });

    // 處理備註更新
    socket.on('update-remark', (data) => {
        console.log('Updating remark:', data);
        if (data.index >= 0 && data.index < sharedTodos.length) {
            sharedTodos[data.index].remark = data.remark;
            // 廣播更新給所有客戶端
            io.emit('todos-updated', sharedTodos);
            console.log('Updated todos after remark change');
        } else {
            console.error('Invalid todo index for remark update:', data.index);
        }
    });

    // 處理重置
    socket.on('reset-todos', () => {
        console.log('Resetting todos');
        sharedTodos = [];
        // 廣播更新給所有客戶端
        io.emit('todos-updated', sharedTodos);
        console.log('Todos reset completed');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = 3001;  // Change port to 3001 or any other available port
http.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});