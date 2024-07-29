// script.js
document.addEventListener('DOMContentLoaded', function() {
    const taskList = document.getElementById('taskList');
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const addTaskButton = document.getElementById('addTaskButton');
    const clearCompletedButton = document.getElementById('clearCompletedButton');
    const leftColumn = document.querySelector('.left-column');
    const rightColumn = document.querySelector('.right-column');
    const searchInput = document.getElementById('searchInput');
    const homeButton = document.querySelector('.fa-home');
    let tasks = [];
    let currentFilter = 'all';

    // 初始化任务列表
    function initTasks() {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        renderTasks(currentFilter);
        updateCounts();
    }

    // 渲染任务列表
    function renderTasks(filter) {
        taskList.innerHTML = '';
        let filteredTasks = tasks;
        if (filter === '今日事项') {
            filteredTasks = tasks.filter(task => isToday(new Date(task.date)));
        } else if (filter === '未来事项') {
            filteredTasks = tasks.filter(task => !isToday(new Date(task.date)));
        } else if (filter === '重要事项') {
            filteredTasks = tasks.filter(task => task.important);
        } else if (filter === '已完成事项') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <div class="task-content">
                    <i class="fa ${task.completed ? 'fa-toggle-on' : 'fa-toggle-off'} toggle-icon" data-index="${index}"></i>
                    <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
                </div>
                <div class="task-date">${task.date}</div>
                <div class="task-actions">
                    <button class="deleteButton">删除</button>
                    <button class="importantButton ${task.important ? 'important' : 'not-important'}">重要</button>
                </div>
            `;
            li.querySelector('.toggle-icon').addEventListener('click', () => toggleComplete(index));
            li.querySelector('.deleteButton').addEventListener('click', () => deleteTask(index));
            li.querySelector('.importantButton').addEventListener('click', () => toggleImportant(index));
            taskList.appendChild(li);
        });
    }

    // 添加任务
    function addTask() {
        const text = taskInput.value.trim();
        const date = taskDate.value;
        if (text) {
            tasks.push({ text, date, completed: false, important: false });
            saveTasks();
            renderTasks(currentFilter);
            updateCounts();
            taskInput.value = '';
            taskDate.value = '';
        }
    }

    // 删除任务
    function deleteTask(index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks(currentFilter);
        updateCounts();
    }

    // 切换任务完成状态
    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks(currentFilter);
        updateCounts();
    }

    // 切换任务重要状态
    function toggleImportant(index) {
        tasks[index].important = !tasks[index].important;
        saveTasks();
        renderTasks(currentFilter);
        updateCounts();
    }

    // 保存任务到本地存储
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // 判断日期是否是今天
    function isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    // 更新左侧数量计数
    function updateCounts() {
        const todayTasksCount = document.getElementById('todayTasksCount');
        const futureTasksCount = document.getElementById('futureTasksCount');
        const personalTasksCount = document.getElementById('personalTasksCount');
        const importantTasksCount = document.getElementById('importantTasksCount');
        const completedTasksCount = document.getElementById('completedTasksCount');

        todayTasksCount.textContent = tasks.filter(task => isToday(new Date(task.date)) && !task.completed).length;
        futureTasksCount.textContent = tasks.filter(task => !isToday(new Date(task.date)) && !task.completed).length;
        personalTasksCount.textContent = tasks.filter(task => !task.completed).length;
        importantTasksCount.textContent = tasks.filter(task => task.important && !task.completed).length;
        completedTasksCount.textContent = tasks.filter(task => task.completed).length;
    }

    // 处理左侧点击事件
    leftColumn.addEventListener('click', function(event) {
        if (event.target.tagName === 'LI') {
            const filter = event.target.getAttribute('data-filter');
            currentFilter = filter;
            renderTasks(filter);
            updateSelectedCategory(event.target);
        }
    });

    // 更新选中类别样式
    function updateSelectedCategory(selectedCategory) {
        const categories = document.querySelectorAll('.task-category');
        categories.forEach(category => {
            category.classList.remove('selected');
        });
        selectedCategory.classList.add('selected');
    }

    // 处理添加任务按钮点击事件
    addTaskButton.addEventListener('click', addTask);

    // 处理删除所有已完成任务按钮点击事件
    clearCompletedButton.addEventListener('click', function() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks(currentFilter);
        updateCounts();
    });

    // 处理搜索栏输入事件
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const searchTerm = searchInput.value.trim().toLowerCase();
            if (searchTerm) {
                const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(searchTerm));
                if (filteredTasks.length > 0) {
                    renderSearchResults(filteredTasks);
                } else {
                    alert('没有找到相关事项');
                    homeButton.click(); // 执行fa fa-home按键的作用
                }
            } else {
                renderTasks('all');
            }
        }
    });

    // 渲染搜索结果
    function renderSearchResults(filteredTasks) {
        taskList.innerHTML = '';
        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <div class="task-content">
                    <i class="fa ${task.completed ? 'fa-toggle-on' : 'fa-toggle-off'} toggle-icon" data-index="${index}"></i>
                    <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
                </div>
                <div class="task-date">${task.date}</div>
                <div class="task-actions">
                    <button class="deleteButton">删除</button>
                    <button class="importantButton ${task.important ? 'important' : 'not-important'}">重要</button>
                </div>
            `;
            li.querySelector('.toggle-icon').addEventListener('click', () => toggleComplete(index));
            li.querySelector('.deleteButton').addEventListener('click', () => deleteTask(index));
            li.querySelector('.importantButton').addEventListener('click', () => toggleImportant(index));
            taskList.appendChild(li);
        });
    }

    // 处理fa fa-home按键点击事件
    homeButton.addEventListener('click', function() {
        currentFilter = 'all';
        renderTasks('all');
        updateSelectedCategory(document.querySelector('.task-category[data-filter="今日事项"]'));
    });

    // 初始化任务列表
    initTasks();
});

