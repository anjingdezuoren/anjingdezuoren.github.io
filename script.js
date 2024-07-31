//文档加载完成后执行回调函数
document.addEventListener('DOMContentLoaded', function() {
    //获取ID为tasklist的元素，并赋值给变量taskList，以用于显示事项列表
    const taskList = document.getElementById('taskList');
    //获取ID为taskInput的元素，并赋值给变量taskInput，以用于输入新事项的名称
    const taskInput = document.getElementById('taskInput');
    //获取ID为taskDate的元素，并赋值给变量taskDate，以用于选择新事项的日期
    const taskDate = document.getElementById('taskDate');
    //获取ID为addTaskButton的元素，并赋值给变量addTaskButton，以用于添加新事项
    const addTaskButton = document.getElementById('addTaskButton');
    //获取ID为clearCompletedButton的元素，并赋值给变量clearCompletedButton，以用于删除所有已完成事项
    const clearCompletedButton = document.getElementById('clearCompletedButton');
    //获取类名为leftColumn的元素，并赋值给变量leftColumn，以用于显示事项类别和其数量计数
    const leftColumn = document.querySelector('.left-column');
    //获取类名为rightColumn的元素，并赋值给变量rightColumn，以用于显示事项列表和操作按钮
    const rightColumn = document.querySelector('.right-column');
    //获取ID为searchInput的元素，并赋值给变量searchInput，以用于搜索事项
    const searchInput = document.getElementById('searchInput');
    //获取类名为fa-home的元素，并赋值给变量homeButton，以用于返回主页
    const homeButton = document.querySelector('.fa-home');
    //定义一个空数组tasks，用于存储事项列表
    let tasks = [];
    //定义一个变量currentFilter，初始值为'all'，用于存储当前过滤条件
    let currentFilter = 'all';

    // 初始化事项列表，定义一个initTasks函数用于初始化事项列表
    function initTasks() {
        // 从本地存储获取事项列表，如果没有则初始化为空数组
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        // 调用renderTasks函数，根据当前过滤条件渲染事项列表
        renderTasks(currentFilter);
        // 调用updateCounts函数更新左侧数量计数
        updateCounts();
    }

    // 渲染事项列表，定义一个renderTasks函数用于根据过滤条件渲染事项列表
    function renderTasks(filter) {
        // 清空事项列表
        taskList.innerHTML = '';
        // 将tasks赋值给filteredTasks作为默认的过滤结果
        let filteredTasks = tasks;
        // 根据过滤条件过滤事项列表
        if (filter === '今日事项') {
            filteredTasks = tasks.filter(task => isToday(new Date(task.date)));
        } else if (filter === '未来事项') {
            filteredTasks = tasks.filter(task => !isToday(new Date(task.date)));
        } else if (filter === '重要事项') {
            filteredTasks = tasks.filter(task => task.important);
        } else if (filter === '已完成事项') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        // 遍历filteredTasks，task是当前遍历到的事项对象，index是当前事项在filteredTasks中的索引
        filteredTasks.forEach((task, index) => {
            // 创建一个li元素，并设置其类名为task-item
            const li = document.createElement('li');
            li.className = 'task-item';
            //设置li元素的html内容，并动态生成html结构
            //<div class="task-content">：包含事项的主要内容
            //<i class="fa ${task.completed ? 'fa-toggle-on' : 'fa-toggle-off'} toggle-icon" data-index="${index}"></i>：
            //根据事项的完成状态显示不同的图标（完成状态为 fa-toggle-on，未完成为 fa-toggle-off），并设置 data-index 属性为当前事项的索引
            //<span class="${task.completed ? 'completed' : ''}">${task.text}</span>：显示事项文本，如果事项已完成，则添加 completed 类名
            //<div class="task-date">${task.date}</div>：显示事项日期
            //<div class="task-actions">：包含事项操作按钮
            //<button class="deleteButton">删除</button>：删除事项按钮
            //<button class="importantButton ${task.important ? 'important' : 'not-important'}">重要</button>：
            //重要按钮，根据任务的重要状态添加不同的类名（重要为 important，不重要为 not-important）。
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
            // 为toggle-icon添加点击事件，点击时调用toggleComplete函数切换任务完成状态
            li.querySelector('.toggle-icon').addEventListener('click', () => toggleComplete(index));
            // 为deleteButton添加点击事件，点击时调用deleteTask函数删除当前事项
            li.querySelector('.deleteButton').addEventListener('click', () => deleteTask(index));
            // 为importantButton添加点击事件，点击时调用toggleImportant函数切换任务重要状态
            li.querySelector('.importantButton').addEventListener('click', () => toggleImportant(index));
            // 将li元素添加到事项列表taskList中
            taskList.appendChild(li);
        });
    }

    // 添加事项，定义一个addTask函数用于添加新事项
    function addTask() {
        //获取事项输入框的值，并去除前后空格，赋值给常量text
        const text = taskInput.value.trim();
        //获取事项日期框的值，赋值给常量date
        const date = taskDate.value;
        //如果输入框有值，则创建新事项对象，并将其添加到tasks数组中，并保存到本地存储，然后渲染事项列表，更新左侧数量计数
        if (text) {
            //将新事项对象（包含事项文本、日期、未完成状态和非重要状态）添加到事项数组 tasks 中
            tasks.push({ text, date, completed: false, important: false });
            //调用saveTasks函数，将事项数组tasks保存到本地存储
            saveTasks();
            //调用renderTasks函数，根据当前过滤条件渲染事项列表
            renderTasks(currentFilter);
            //调用updateCounts函数更新左侧事项数量计数
            updateCounts();
            //清空输入框和日期
            taskInput.value = '';
            taskDate.value = '';
        }
    }

    // 删除事项，定义一个deleteTask函数用于删除指定索引的事项
    function deleteTask(index) {
        //从tasks数组中删除指定索引的事项
        tasks.splice(index, 1);
        //调用saveTasks函数，将事项数组tasks保存到本地存储
        saveTasks();
        //调用renderTasks函数，根据当前过滤条件渲染事项列表
        renderTasks(currentFilter);
        //调用updateCounts函数更新左侧事项数量计数
        updateCounts();
    }

    // 切换事项完成状态，定义一个toggleComplete函数用于切换指定索引的事项的完成状态
    function toggleComplete(index) {
        //根据索引获取当前事项对象，并根据其完成状态取反，赋值给任务对象的 completed 属性
        tasks[index].completed = !tasks[index].completed;
        //调用saveTasks函数，将事项数组tasks保存到本地存储
        saveTasks();
        //调用renderTasks函数，根据当前过滤条件渲染事项列表
        renderTasks(currentFilter);
        //调用updateCounts函数更新左侧事项数量计数
        updateCounts();
    }

    // 切换任务重要状态，定义一个toggleImportant函数用于切换指定索引的事项的重要状态
    function toggleImportant(index) {
        //根据索引获取当前事项对象，并根据其重要状态取反，赋值给任务对象的 important 属性
        tasks[index].important = !tasks[index].important;
        //调用saveTasks函数，将事项数组tasks保存到本地存储
        saveTasks();
        //调用renderTasks函数，根据当前过滤条件渲染事项列表
        renderTasks(currentFilter);
        //调用updateCounts函数更新左侧事项数量计数
        updateCounts();
    }

    // 保存事项到本地存储
    function saveTasks() {
        //将事项数组tasks转换为JSON字符串，并保存到本地存储中，键名为'tasks'
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // 判断日期是否是今天
    function isToday(date) {
        //获取当前日期，并赋值给常量today
        const today = new Date();
        //判断日期是否是今天，如果是，则返回true，否则返回false
        return date.toDateString() === today.toDateString();
    }

    // 更新左侧数量计数
    function updateCounts() {
        //获取ID为todayTasksCount的元素，并赋值给常量todayTasksCount，以表示今日事项数量
        const todayTasksCount = document.getElementById('todayTasksCount');
        //获取ID为futureTasksCount的元素，并赋值给常量futureTasksCount，以表示未来事项数量
        const futureTasksCount = document.getElementById('futureTasksCount');
        //获取ID为personalTasksCount的元素，并赋值给常量personalTasksCount，以表示个人事项数量
        const personalTasksCount = document.getElementById('personalTasksCount');
        //获取ID为importantTasksCount的元素，并赋值给常量importantTasksCount，以表示重要事项数量
        const importantTasksCount = document.getElementById('importantTasksCount');
        //获取ID为completedTasksCount的元素，并赋值给常量completedTasksCount，以表示已完成事项数量
        const completedTasksCount = document.getElementById('completedTasksCount');
        //遍历tasks数组，计算各类事项数量，并更新今日事项的数量计数，显示今天且未完成的事项数量
        todayTasksCount.textContent = tasks.filter(task => isToday(new Date(task.date)) && !task.completed).length;
        //遍历tasks数组，计算各类事项数量，并更新未来事项的数量计数，显示非今天且未完成的事项数量
        futureTasksCount.textContent = tasks.filter(task => !isToday(new Date(task.date)) && !task.completed).length;
        //遍历tasks数组，计算各类事项数量，并更新个人事项的数量计数，显示所有未完成的事项数量
        personalTasksCount.textContent = tasks.filter(task => !task.completed).length;
        //遍历tasks数组，计算各类事项数量，并更新重要事项的数量计数，显示所有重要且未完成的事项数量
        importantTasksCount.textContent = tasks.filter(task => task.important && !task.completed).length;
        //遍历tasks数组，计算各类事项数量，并更新已完成事项的数量计数，显示所有已完成的事项数量
        completedTasksCount.textContent = tasks.filter(task => task.completed).length;
    }

    // 处理左侧点击事件，为左侧列leftColumn添加点击事件监听器，当点击事件发生时执行回调函数。
    leftColumn.addEventListener('click', function(event) {
        //判断点击的目标元素是否是LI标签
        if (event.target.tagName === 'LI') {
            //获取点击的目标元素的data-filter属性值，赋值给变量filter
            const filter = event.target.getAttribute('data-filter');
            //更新当前过滤条件currentFilter为新的过滤条件filter
            currentFilter = filter;
            //调用renderTasks函数，根据新的过滤条件渲染事项列表
            renderTasks(filter);
            //调用updateSelectedCategory函数，更新选中类别样式，传入点击的目标元素event.target
            updateSelectedCategory(event.target);
        }
    });

    // 更新选中类别样式
    function updateSelectedCategory(selectedCategory) {
        //获取类名为task-category的元素，并赋值给常量categories
        const categories = document.querySelectorAll('.task-category');
        //遍历categories数组
        categories.forEach(category => {
            //如果当前元素不是选中类别，则移除selected类名
            category.classList.remove('selected');
        });
        //为选中类别添加selected类名
        if (selectedCategory) {
        selectedCategory.classList.add('selected');
        }
    }

    // 为添加事项按钮添加点击事件监听器，当点击时调用addTask函数
    addTaskButton.addEventListener('click', addTask);

    // 为删除所有已完成任务按钮添加点击事件监听器，当点击时执行回调函数
    clearCompletedButton.addEventListener('click', function() {
        //使用filter方法过滤出所有未完成的事项，将过滤后的事项数组赋值给tasks
        tasks = tasks.filter(task => !task.completed);
        //调用saveTasks函数，将事项数组tasks保存到本地存储
        saveTasks();
        //调用renderTasks函数，根据当前过滤条件渲染事项列表
        renderTasks(currentFilter);
        //调用updateCounts函数更新左侧数量计数
        updateCounts();
    });

    // 为搜索输入框searchInpu 添加按键事件监听器，当按键事件发生时执行回调函数
    searchInput.addEventListener('keydown', function(event) {
        //判断按键是否是回车键
        if (event.key === 'Enter') {
            //获取搜索输入框的值，并去除前后空格，并转换为小写字母，赋值给常量searchTerm
            const searchTerm = searchInput.value.trim().toLowerCase();
            //判断搜索输入词是否不为空
            if (searchTerm) {
                //根据搜索词过滤事项数组，将过滤后的事项数组赋值给filteredTasks
                const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(searchTerm));
                //判断过滤后的事项数组是否不为空
                if (filteredTasks.length > 0) {
                    //调用renderSearchResults函数，渲染搜索结果
                    renderSearchResults(filteredTasks);
                } else {
                    //如果搜索结果为空，则提示用户没有找到相关事项，并返回主页
                    alert('没有找到相关事项');
                    homeButton.click(); // 执行fa fa-home按键的作用
                }
            } else {
                //如果搜索输入框为空，则清空搜索结果并渲染所有事项
                renderTasks('all');
            }
        }
    });

    // 渲染搜索结果(函数内容与renderTasks函数内容相同)，定义一个函数renderSearchResults，用于渲染搜索结果，参数为过滤后的任务数组filteredTasks
    function renderSearchResults(filteredTasks) {
        // 清空事项列表taskList的内容
        taskList.innerHTML = '';
        // 遍历filteredTasks，task是当前遍历到的事项对象，index是当前事项在filteredTasks中的索引
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

    // 处理fa fa-home按键，为homeButton添加点击事件监听器，当点击时执行回调函数。
    homeButton.addEventListener('click', function() {
        //将当前过滤条件 currentFilter 设置为 'all'，即显示所有任务
        currentFilter = 'all';
        //调用renderTasks函数，根据新的过滤条件"all"渲染事项列表
        renderTasks('all');
        //调用updateSelectedCategory函数，更新选中类别样式，传入null，表示没有选中任何类别
        updateSelectedCategory(null);
    });

    // 初始化任务列表
    initTasks();
});

