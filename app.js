// ##### element selecting
const newTaskForm = document.getElementById('form');
const tbody = document.getElementById('tbody');
const searchEl = document.getElementById('search')
const filterEl = document.getElementById('filter')
const sortEl = document.getElementById('sort')
const byDateEl = document.getElementById('by_date');
const bulkAction = document.getElementById('bulk_action')
const allSelect = document.getElementById('allSelect')
const dismiss = document.getElementById('dismiss')
const deleteBtn = document.getElementById('delete_btn')
const editSection = document.getElementById('edit_section')
const editBtn = document.getElementById('edit_btn')
const editForm = document.getElementById('edit_form')

// ####### utilities
function getUID(){
    return Date.now()+ Math.round(Math.random() *1000).toString();
}


// ####### local storage
// get all tasks to local storage
function getAllTasksFromLocalStorage(){
    let tasks = [];
    const rowTasks = localStorage.getItem('tasks');
    if(rowTasks){
        tasks = JSON.parse(rowTasks);
    }
    return tasks;
}

// add tasks to local storage
function addTasksToLocalStorage(tasks){
    localStorage.setItem('tasks',JSON.stringify(tasks));
}

// add task to local storage
function addTaskToLocalStorage(task){
    const tasks = getAllTasksFromLocalStorage();
    tasks.push(task);
    addTasksToLocalStorage(tasks);
}

// ### delete and edit and check handler
// delete handler
function deleteHandler(id){
    const tasks = getAllTasksFromLocalStorage();
    const tasksAfterDeleting = tasks.filter(task => task.id !==id)
    addTasksToLocalStorage(tasksAfterDeleting);
    updateUI();
}

// status handler
function statusHandler(id){
    const tasks = getAllTasksFromLocalStorage();
    const tasksAfterChangingStatus = tasks.map((task) =>{
        if(task.id === id){
            if(task.status === 0){
                task.status =1;
            }else{
                task.status = 0;
            }
        }
        return task;
    });
    addTasksToLocalStorage(tasksAfterChangingStatus);
    updateUI();
}

//######################### edit handler
function editHandler(id){
    const taskTr = document.getElementById(id);
    const tasks = getAllTasksFromLocalStorage();
    const task = tasks.find(task => task.id ===id) || {};

    const { id:taskID, name, priority, status,date}=task;
    

// taskname
    const taskNameTd = taskTr.querySelector(".taskName");
    const taskNameInp = document.createElement("input");
    taskNameInp.value = name;
    taskNameTd.innerHTML='';
    taskNameTd.appendChild(taskNameInp);

    // priority
    const priorityTd = taskTr.querySelector('.priority');
    const priorityInp = document.createElement("select")
    priorityInp.innerHTML = `<option ${priority==="high" ? "selected" : ""} value="high">high</option>
                            <option ${priority==="medium" ? "selected" : ""} value="medium">medium</option>
                            <option ${priority==="low" ? "selected" : ""} value="low">low</option>`

    priorityTd.innerHTML = '';
    priorityTd.appendChild(priorityInp);

    // #### status
    const statusTd = taskTr.querySelector('.status');
    const statusInp = document.createElement("select");
    statusInp.innerHTML = `<option ${status ===1 ? "selected": ""} value="1">Completed</option>
                            <option ${status ===0 ? "selected": ""} value="0">Pending</option>`

    
    statusTd.innerHTML = '';
    statusTd.appendChild(statusInp);

    // date
    const dateTd = taskTr.querySelector('.date');
    const dateInp = document.createElement('input')
    dateInp.type ="date";
    dateInp.value = date;
    dateTd.innerHTML ='';
    dateTd.appendChild(dateInp);

    // action
    const actionTd =taskTr.querySelector('.action');
    const saveBtn = document.createElement('button')
    saveBtn.addEventListener('click', ()=>{
        const name = taskNameInp.value;
        const priority = priorityInp.value;
        const status = parseInt(statusInp.value);
        const date = dateInp.value;
        if(name && priority && !isNaN(status) && date){
           const newTask ={
            name,
            priority,
            status,
            date
           };
           const newTaskAfterEditing = {...task, ...newTask};
           const newTasksAfterEditing = tasks.map((task) =>{
            if(task.id=== taskID){
                return newTaskAfterEditing;
            }
            return task;
           });
           addTasksToLocalStorage(newTasksAfterEditing)
           updateUI();
        }
    })
    saveBtn.classList.add('saveBTN');
    saveBtn.textContent="save";
    actionTd.innerHTML='';
    actionTd.appendChild(saveBtn);

}

//##### handler fuctions

// action handler
function actionHandler(e){
    const {
        target: {id:actionID, dataset: {id:taskID} ={}},
    } = e;
    if(actionID === "delete"){
        deleteHandler(taskID);
    }else if(actionID === "check") {
        statusHandler(taskID);
    }else if(actionID === "edit"){
        editHandler(taskID)
    }
}

// new task ceation
function newTaskFormHandler(e){
    e.preventDefault();
    const id = getUID();
    const tasks = {
        id,
        status:0,
    };
    [...newTaskForm.elements].forEach((element) =>{
        if(element.name){
            tasks[element.name] = element.value;
        }
    })
    newTaskForm.reset();
    addTaskToLocalStorage(tasks);
    updateUI();
}



// ##### UI handler
// create Tr
function createTr({name,priority,status,date,id},index){
    const formattedDate = new Date(date).toDateString();
    return `  <tr id='${id}'>
        <td>
         <input class="checkbox" data-id='${id}' data-checkid='${id}' type="checkbox"/>
         </td>
        <td>${index + 1}</td>
        <td class="taskName">${name}</td>
        <td class="priority">${priority}</td>
        <td class="status">${status ? "Completed": "Pending"}</td>
        <td class="date">${formattedDate}</td>
        <td class="action">
            <button data-id="${id}" id="edit"><i class="fa-solid fa-pen"></i></button>
            <button data-id="${id}" id="check"><i class="fa-solid fa-check"></i></button>
            <button data-id="${id}" id="delete"><i class="fa-solid fa-trash"></i></button>
        </td>
    </tr>`;
}

// #### initial state
function getInitialState(){
    return getAllTasksFromLocalStorage().reverse();
}

// Update UI handler
function updateUI(tasks=getInitialState()){
    // const tasks = getAllTasksFromLocalStorage();
    const noTasksMessage = document.getElementById('noTasksMessage');
    if (tasks.length === 0) {
        noTasksMessage.style.display = 'block';
    } else {
        noTasksMessage.style.display = 'none';
    }

    const tasksHtmlList = tasks.map((task,index)=>{
        return createTr(task,index);
    });
    const taskLists = tasksHtmlList.join("");
    tbody.innerHTML = taskLists;/* <center>Nothing to show</center> */
}
updateUI();

// ###### search & filtering handler && sort
function handlingSearchWithTimeOut(searchText){
    const tasks = getAllTasksFromLocalStorage();
    const searchedTasks = tasks.filter(({name})=>{
        name= name.toLowerCase();
        searchText = searchText.toLowerCase();
        return name.includes(searchText);
    });
    updateUI(searchedTasks);
}

let timer;
function searchHandler(e){
    const {value:searchText} = e.target;
    clearTimeout(timer);
    timer =setTimeout(()=>handlingSearchWithTimeOut(searchText), 500)
}

// ### filtrhandler
function filterAndRender(filterText){
    const tasks = getAllTasksFromLocalStorage();
    let tasksAfterFiltering = tasks;
    switch(filterText){
        case 'all':
            tasksAfterFiltering = tasks;
            break;
        case '1':
            tasksAfterFiltering = tasks.filter(task => task.status === 1)
            break;
        case '0':
            tasksAfterFiltering = tasks.filter(task => task.status === 0)
            break;
        case 'today':
            tasksAfterFiltering = tasks.filter(task =>{
                const today = new Date().toISOString().split("T")[0];
                return today === task.date;
            })
            break;
        case 'high':
            tasksAfterFiltering = tasks.filter(task => task.priority === 'high')
            break;
        case 'medium':
            tasksAfterFiltering = tasks.filter(task => task.priority === 'medium')
            break;
        case 'low':
            tasksAfterFiltering = tasks.filter(task => task.priority === 'low')
            break;
        default:
            break;
    }
    updateUI(tasksAfterFiltering)
}

function filterHandler(e){
    const {value :filterText} = e.target;
    filterAndRender(filterText)
}


// ###### sort handler
function sortHandler(e){
    const sortText =e.target.value;
    const tasks = getAllTasksFromLocalStorage();
    let tasksAfterSorting = tasks.sort((taskA,taskB) =>{
        const taskADate = new Date(taskA.date);
        const taskBDate = new Date(taskB.date);
        if(taskADate < taskBDate){
            return sortText === "newest" ? 1 : -1;
        }else if(taskADate > taskBDate){
            return sortText === "newest" ? -1 : 1;
        }else{
            return 0;
        }
    });
    updateUI(tasksAfterSorting);
}

// ##### by_date handler
function byDateHandler(e) {
    const selectedDate = e.target.value;
    const tasks = getAllTasksFromLocalStorage();
    const filteredTasks = tasks.filter(task => task.date === selectedDate);
    updateUI(filteredTasks);
}

// ###### task selection handler
let selectedTasks = [];

function tasksSelectionHandler(e){
    const targetEl = e.target;
    if(targetEl.classList.contains("checkbox")){
        const {id} = targetEl.dataset;
        if(targetEl.checked){
            selectedTasks.push(id);
        }else{
            const selectedTasksIndex = selectedTasks.findIndex(taskId=> taskId===id)
            selectedTasks.splice(selectedTasksIndex,1)
        }
    }
    bulkActionToggler();
}


// #### bulk action
function bulkActionToggler(){
    selectedTasks.length ? (bulkAction.style.display = "block")
    : (bulkAction.style.display = "none")
    const tasks = getAllTasksFromLocalStorage();
    if(tasks.length === selectedTasks.length && tasks.length > 0){
        allSelect.checked = true;
    }else{
        allSelect.checked= false;
    }
}

// ### all Select handler
function allSelectHandler(e){
   if(e.target.checked){
    const tasks = getAllTasksFromLocalStorage();
    selectedTasks = tasks.map(task=> task.id)
    selectedTasks.forEach((taskId)=>{
    document.querySelector(`[data-checkid='${taskId}']`).checked =true;
    })
   }else{
    selectedTasks.forEach((taskId)=>{
        document.querySelector(`[data-checkid='${taskId}']`).checked =false;
        });
        selectedTasks =[];
   }
   bulkActionToggler();
}

// ####### dismiss
function dismissHandler(){
    selectedTasks.forEach((taskId)=>{
        document.querySelector(`[data-checkid='${taskId}']`).checked =false;
        });
    selectedTasks=[];
    bulkActionToggler();
}


// ###### delete btn
function deleteBtnHandler(){
    const isConfirm = confirm('Really, you want to delete this❌')
    if(isConfirm){
        const tasks = getAllTasksFromLocalStorage();
        const tasksAfterDeletingList= tasks.filter(task =>{
            if(selectedTasks.includes(task.id)) return false;
            return true;
        });
        addTasksToLocalStorage(tasksAfterDeletingList)
        updateUI(tasksAfterDeletingList)
        selectedTasks = [];
        bulkActionToggler();
    }
}

// bulk edite handler

function bulkEditAreaToggler(){
    editSection.style.display === "block" ? (editSection.style.display= "none") : (editSection.style.display = "block")
}

function bulkEditHandler(){
    bulkEditAreaToggler()
}

function bulkEditFormHandler(e){
    e.preventDefault();
    const task = { };
    [...editForm.elements].forEach((element)=>{
        if(element.name && element.value){
            task[element.name] = element.value;
        }
    });
    editForm.reset();
    const tasks = getAllTasksFromLocalStorage();
    const modifiedTasks= tasks.map(selectedTask =>{
        if(selectedTasks.includes(selectedTask.id)){
            selectedTask = {...selectedTask, ...task}
        }
        return selectedTask;
    });
    addTasksToLocalStorage(modifiedTasks);
    updateUI(modifiedTasks);
    bulkEditAreaToggler();
    selectedTasks = [];
    bulkActionToggler();
}

//##### event listeners
newTaskForm.addEventListener('submit',newTaskFormHandler);
tbody.addEventListener('click', actionHandler);
searchEl.addEventListener('input', searchHandler);
filterEl.addEventListener("input", filterHandler)
sortEl.addEventListener("input", sortHandler)
byDateEl.addEventListener("input", byDateHandler);
tbody.addEventListener('input',tasksSelectionHandler)
allSelect.addEventListener('input',allSelectHandler)
dismiss.addEventListener('click',dismissHandler)
deleteBtn.addEventListener('click',deleteBtnHandler)
editBtn.addEventListener('click',bulkEditHandler)
editForm.addEventListener('submit', bulkEditFormHandler)