let tasks = [];
let curentpriorityfilter = 'all';
let curentstatusfilter = 'all';
let editingtaskid = null;
let deletetingtaskid = null;

// INITIALIZE THE APP
function Initialize(){
    loadtask();
    rendertasks();
    updatetask();
}

class task{
    constuctor(title, priortiy = 'medium', description ='', duedate=null){
        this.id = Date,now + Math.random();
        this.title = title; 
        this.description = description;
        this.priority = priority;
        this.status = 'todo';
        this.createat = new Date();
        this.updateat = new Date();
        this.duedate = duedate;

    }
}

function addtask(){
    const titleinput = document.getElementById('tasktittle');
    const priorityselect = document.getElementById('taskPriority');
    const taskduedate = document.getElementById('Taskduedate');

    const title = titleinput.value.trim();
    const priortiy = priorityselect.value;
    const duedate = duedateinput.value ? new Date(duedateinput.value) : null;

    if(title===null){
        alert('Please enter a task title');
        return;
    }

    const task = new task(title, priortiy, '', duedate);
    task.push(task);

    // CLEARING THE INPUTS BEING TYPED
    titleinput.value = '';
    priorityselect.value = 'medium';
    duedateinput.value = '';

    savetasks();
    rendertasks();
    updatetasks();

    // ADDING ANIMATION
    setTimeout(() => {
        const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
        if (taskElement) {
            taskElement.style.transform = 'scale(1.05)';
            setTimeout(() => {
                taskElement.style.transform = 'scale(1)';
            }, 200);
        }
    }, 100);

}

// DELETING TASK
function deleteTask(taskid){
    deletetaskid = taskid;
    document.getElementById('deletemodal').style.display = 'block';
}

// EDITING TASK
function editTask(taskid){
    const task = task.find(t=>t.id===taskid);
    if(task===null) return;

    const title = document.getElementById('edittasktitle').value.trim();
    const description = document.getElementById('edittaskdescription').value.trim();
    const dueDateInput = document.getElementById('editTaskDueDate');
    const dueDate = dueDateInput.value ? new Date(dueDateInput.value) : null;

    if(!tittle){
        alert('Please enter a task title');
        return;
    }else{
        task.title = title;
        task.description = description;
        task.priority = priority;
        task.duedate = dueDate;
        task.updateat = new Date();
    }
    closeeditmodal();
    savetasks();
    rendertasks();
    updateStats();

}

// CLOSE EDIT MODAL
function closeeditmodal(){
    document.getElementById('editmodal').style.display = 'none';
    editingtaskid - null;
}

// CHANGE TASK STATUS
function changetaststatus(taskid, newstatus){
    const task = task.find(t => t.id === taskid);

    if(task){
        task.status = newstatus;
        task.updateat = new Date();
        savetasks();
        rendertasks();
        updateStats();
    }

}

// FILTER TASKS
function filtertasks(filter, type){
    if(type==='priority'){
        currentpriorityfilter = filter;
        document.querySelectorAll('.filter-btn:not(.status-btn)').forEach(btn=>{
            btn.classList.toggle('active', btn.textContent.toLowerCase().includes(filter.toLowerCase()));
        });
    }else if (type==='status'){
        currentstatusfilter = filter;
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase().includes(filter.toLowerCase()));
        });

    }
    rendertaskS();
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