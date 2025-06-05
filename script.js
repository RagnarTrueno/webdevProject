let tasks = [];
let currentPriorityFilter = 'all';
let currentStatusFilter = 'all';
let editingTaskId = null;
let deletingTaskId = null;

// INITIALIZE THE APP
function init() {
    loadTasks();
    renderTasks();
    updateStats();
}

class Task {
    constructor(title, priority = 'medium', description = '', dueDate = null) {
        this.id = Date.now() + Math.random();
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = 'todo';
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.dueDate = dueDate;
    }
}

function addTask() {
    const titleInput = document.getElementById('taskTitle');
    const prioritySelect = document.getElementById('taskPriority');
    const dueDateInput = document.getElementById('taskDueDate');

    const title = titleInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value ? new Date(dueDateInput.value) : null;

    if (!title) {
        alert('Please enter a task title');
        return;
    }

    const newTask = new Task(title, priority, '', dueDate);
    tasks.push(newTask);

    // CLEARING THE INPUTS BEING TYPED
    titleInput.value = '';
    prioritySelect.value = 'medium';
    dueDateInput.value = '';

    saveTasks();
    renderTasks();
    updateStats();

    // ADDING ANIMATION
    setTimeout(() => {
        const taskElement = document.querySelector(`[data-task-id="${newTask.id}"]`);
        if (taskElement) {
            taskElement.style.transform = 'scale(1.05)';
            setTimeout(() => {
                taskElement.style.transform = 'scale(1)';
            }, 200);
        }
    }, 100);
}

// DELETING TASK
function deleteTask(taskId) {
    deletingTaskId = taskId;
    document.getElementById('deleteModal').style.display = 'block';
}

// EDITING TASK
function editTask(taskId) {
    const taskToEdit = tasks.find(t => t.id === taskId);
    if (!taskToEdit) return;

    editingTaskId = taskId;
    
    // Populate the edit modal with task data
    document.getElementById('editTaskTitle').value = taskToEdit.title;
    document.getElementById('editTaskDescription').value = taskToEdit.description || '';
    document.getElementById('editTaskPriority').value = taskToEdit.priority;
    document.getElementById('editTaskDueDate').value = taskToEdit.dueDate ? taskToEdit.dueDate.toISOString().split('T')[0] : '';
    
    document.getElementById('editModal').style.display = 'block';
}

// SAVE EDITED TASK
function saveEditedTask() {
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const title = document.getElementById('editTaskTitle').value.trim();
    const description = document.getElementById('editTaskDescription').value.trim();
    const priority = document.getElementById('editTaskPriority').value;
    const dueDateInput = document.getElementById('editTaskDueDate');
    const dueDate = dueDateInput.value ? new Date(dueDateInput.value) : null;

    if (!title) {
        alert('Please enter a task title');
        return;
    }

    task.title = title;
    task.description = description;
    task.priority = priority;
    task.dueDate = dueDate;
    task.updatedAt = new Date();

    closeEditModal();
    saveTasks();
    renderTasks();
    updateStats();
}

// CLOSE EDIT MODAL
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingTaskId = null;
}

// CHANGE TASK STATUS
function changeTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);

    if (task) {
        task.status = newStatus;
        task.updatedAt = new Date();
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// FILTER TASKS
function filterTasks(filter, type) {
    if (type === 'priority') {
        currentPriorityFilter = filter;
        document.querySelectorAll('.filter-btn:not(.status-btn)').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            }
        });
    } else if (type === 'status') {
        currentStatusFilter = filter;
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            }
        });
    }
    renderTasks();
}

// CLEAR ALL TASKS
function clearAllTasks() {
    if (confirm('Are you sure you want to clear all tasks? This action cannot be undone.')) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// RENDERING THE TASKS
function renderTasks() {
    const todoList = document.getElementById('todoList');
    const progressList = document.getElementById('progressList');
    const doneList = document.getElementById('doneList');
            
    // CLEARING EXISTING TASKS
    todoList.innerHTML = '';
    progressList.innerHTML = '';
    doneList.innerHTML = '';
            
    // FILTER TASKS
    let filteredTasks = tasks;
    if (currentPriorityFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === currentPriorityFilter);
    }
    if (currentStatusFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === currentStatusFilter);
    }
            
    // GROUPING THE TASK BY STATUS
    const todoTasks = filteredTasks.filter(task => task.status === 'todo');
    const progressTasks = filteredTasks.filter(task => task.status === 'progress');
    const doneTasks = filteredTasks.filter(task => task.status === 'done');
            
    // RENDERING TASK IN EACH COLUMN
    renderTasksInColumn(todoTasks, todoList);
    renderTasksInColumn(progressTasks, progressList);
    renderTasksInColumn(doneTasks, doneList);
            
    // SHOW EMPTY STATES IF THERE IS NO TASKS
    if (todoTasks.length === 0) showEmptyState(todoList, 'No tasks yet. Add your first task!');
    if (progressTasks.length === 0) showEmptyState(progressList, 'No tasks in progress');
    if (doneTasks.length === 0) showEmptyState(doneList, 'No completed tasks');
}

// Render tasks in specific column
        function renderTasksInColumn(taskList, container) {
            taskList.forEach(task => {
                const taskElement = createTaskElement(task);
                container.appendChild(taskElement);
            });
        }

        // Create task element
        function createTaskElement(task) {
            const taskDiv = document.createElement('div');
            taskDiv.className = `task-item ${isOverdue(task) ? 'overdue' : ''}`;
            taskDiv.setAttribute('data-task-id', task.id);
            
            const timeAgo = getTimeAgo(task.createdAt);
            const priorityClass = `priority-${task.priority}`;
            
            // Only show promote button if not in 'done' status
            const promoteButton = task.status !== 'done' ? 
                `<button class="task-btn btn-promote" onclick="promoteTask(${task.id})">Promote</button>` : '';
            
            // Only show demote button if not in 'todo' status
            const demoteButton = task.status !== 'todo' ? 
                `<button class="task-btn btn-demote" onclick="demoteTask(${task.id})">Demote</button>` : '';
            
            taskDiv.innerHTML = `
                <div class="task-header">
                    <div>
                        <div class="task-title">${task.title}</div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                        ${task.dueDate ? `<div class="due-date">${isOverdue(task) ? '⚠️ OVERDUE - ' : ''}Due: ${formatDate(task.dueDate)}</div>` : ''}
                    </div>
                    <span class="task-priority ${priorityClass}">${task.priority}</span>
                </div>
                <div class="task-meta">
                    <span>Created ${timeAgo}</span>
                    <span>ID: ${task.id.toString().substr(-4)}</span>
                </div>
                <div class="task-actions">
                    ${demoteButton}
                    ${promoteButton}
                    <button class="task-btn btn-edit" onclick="editTask(${task.id})">Edit</button>
                    <button class="task-btn btn-delete" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            `;
            
            return taskDiv;
        }

        // Show empty state
        function showEmptyState(container, message) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';
            emptyDiv.innerHTML = `
                <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>${message}</p>
            `;
            container.appendChild(emptyDiv);
        }

        // Get time ago string
        function getTimeAgo(date) {
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            
            if (diffDays > 0) return `${diffDays}d ago`;
            if (diffHours > 0) return `${diffHours}h ago`;
            if (diffMinutes > 0) return `${diffMinutes}m ago`;
            return 'Just now';
        }

        // Update statistics
        function updateStats() {
            const total = tasks.length;
            const todo = tasks.filter(t => t.status === 'todo').length;
            const progress = tasks.filter(t => t.status === 'progress').length;
            const done = tasks.filter(t => t.status === 'done').length;
            
            document.getElementById('totalTasks').textContent = total;
            document.getElementById('todoTasks').textContent = todo;
            document.getElementById('progressTasks').textContent = progress;
            document.getElementById('doneTasks').textContent = done;
        }

// SAVE TASKS TO LOCALSTORAGE
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// LOAD TASKS FROM LOCALSTORAGE
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        tasks.forEach(task => {
            task.createdAt = new Date(task.createdAt);
            task.updatedAt = new Date(task.updatedAt);
            if (task.dueDate) {
                task.dueDate = new Date(task.dueDate);
            }
        });
    }
}

// PROMOTE TASK TO NEXT STATUS
function promoteTask(taskId) {
    const task = tasks.find(t => t.id === parseFloat(taskId));
    if (task) {
        if (task.status === 'todo') {
            task.status = 'progress';
        } else if (task.status === 'progress') {
            task.status = 'done';
        }
        task.updatedAt = new Date();
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// FORMAT DATE
function formatDate(date) {
    const d = new Date(date);
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    
    if (d.toDateString() === now.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return d.toLocaleDateString();
}

// CHECK IF TASK IS OVERDUE
function isOverdue(task) {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
}

// DEMOTE TASK TO PREVIOUS STATUS
function demoteTask(taskId) {
    const task = tasks.find(t => t.id === parseFloat(taskId));
    if (task) {
        if (task.status === 'done') {
            task.status = 'progress';
        } else if (task.status === 'progress') {
            task.status = 'todo';
        }
        task.updatedAt = new Date();
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// CONFIRM DELETE
function confirmDelete() {
    const task = tasks.find(t => t.id === deletingTaskId);
    if (task) {
        tasks = tasks.filter(t => t.id !== deletingTaskId);
        saveTasks();
        renderTasks();
        updateStats();
    }
    closeDeleteModal();
}

// CLOSE DELETE MODAL
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deletingTaskId = null;
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init);