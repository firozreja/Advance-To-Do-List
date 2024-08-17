// ##### Element selection
const newTaskForm = document.getElementById("form");
const tbody = document.getElementById("tbody");
const searchEI = document.getElementById("search");
const filterEI = document.getElementById("filter");
const sortEI = document.getElementById("sort");
const byDateEI = document.getElementById("by_date");
const bulkAction = document.getElementById("bulk_action");
const allSelect = document.getElementById("allSelect");
const dismiss = document.getElementById("dismiss");
const deleteBtn = document.getElementById("delete_btn");
const editSection = document.getElementById("edit_section");
const editBtn = document.getElementById("edit_btn");
const editForm = document.getElementById("edit_form");

// #### utilities
function getUID() {
  return Date.now() + Math.round(Math.random() * 10000).toString();
}

// ######### Local storage

// get all task form local storage
function getAllTasksFromLocalStorage() {
  let tasks = [];
  const rowTasks = localStorage.getItem("tasks");
  if (rowTasks) {
    tasks = JSON.parse(rowTasks);
  }
  return tasks;
}

// add tasks to local storage
function addTasksToLocalStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// add task to local storage
function addTaskToLocalStorage(task) {
  const tasks = getAllTasksFromLocalStorage();
  tasks.push(task);
  addTasksToLocalStorage(tasks);
}

// ##### delete & edit & check function
function deleteHandler(id) {
  const tasks = getAllTasksFromLocalStorage();
  const tasksAfterDeleting = tasks.filter((task) => task.id !== id);
  addTasksToLocalStorage(tasksAfterDeleting);
  updateUI();
}
// ######### status handler
function statusHandler(id) {
  const tasks = getAllTasksFromLocalStorage();
  const tasksAfterStatusChange = tasks.map((task) => {
    if (task.id === id) {
      if (task.status === 0) {
        task.status = 1;
      } else {
        task.status = 0;
      }
    }
    return task;
  });
  addTasksToLocalStorage(tasksAfterStatusChange);
  updateUI();
}

// edit handler
function editHandler(id) {
  const listTr = document.getElementById(id);
  const tasks = getAllTasksFromLocalStorage();
  const list = tasks.find((list) => list.id === id) || {};
  const { id: taskId, name, priority, status, date } = list;

  // taskName
  const listNameTd = listTr.querySelector(".taskName");
  const listNameInp = document.createElement("input");
  listNameInp.value = name;
  listNameTd.innerHTML = "";
  listNameTd.appendChild(listNameInp);

  // priority
  const priorityTd = listTr.querySelector(".priority");
  const priorityInp = document.createElement("select");
  priorityInp.innerHTML = `
                          <option ${
                            priority === "high" ? "selected" : ""
                          } value="high">high</option>
                          <option ${
                            priority === "medium" ? "selected" : ""
                          } value="medium">medium</option>
                          <option ${
                            priority === "low" ? "selected" : ""
                          } value="low">low</option>`;
  priorityTd.innerHTML = "";
  priorityTd.appendChild(priorityInp);

  // status
  const statusTd = listTr.querySelector(".status");
  const statusInp = document.createElement("select");
  statusInp.innerHTML = `
                        <option ${
                          status === 1 ? "selected" : ""
                        } value="1">Completed</option>
                        <option ${
                          status === 0 ? "selected" : ""
                        } value="0">Pending</option>`;
  statusTd.innerHTML = "";
  statusTd.appendChild(statusInp);

  // date
  const dateTd = listTr.querySelector(".date");
  const dateInp = document.createElement("input");
  dateInp.type = "date";
  dateInp.value = date;
  dateTd.innerHTML = "";
  dateTd.appendChild(dateInp);

  // action
  const actionTd = listTr.querySelector(".action");
  const saveBtn = document.createElement("button");
  saveBtn.addEventListener("click", () => {
    const name = listNameInp.value;
    const priority = priorityInp.value;
    const status = parseInt(statusInp.value);
    const date = dateInp.value;
    if (name && priority && !isNaN(status) && date) {
      const newList = {
        name,
        priority,
        status,
        date,
      };
      const listAfterEditing = { ...list, ...newList };
      const listsAfterEditing = tasks.map((list) => {
        if (list.id === taskId) {
          return listAfterEditing;
        }
        return list;
      });
      addTasksToLocalStorage(listsAfterEditing);
      updateUI();
    } else {
      alert("please fill up all the input");
    }
  });
  saveBtn.classList.add("saveBTN");
  saveBtn.textContent = "save";
  actionTd.innerHTML = "";
  actionTd.appendChild(saveBtn);
}
//######### event handler function
// action handler
function actionHandler(e) {
  const {
    target: { id: actionID, dataset: { id: taskID } = {} },
  } = e;
  if (actionID === "delete") {
    deleteHandler(taskID);
  } else if (actionID === "check") {
    statusHandler(taskID);
  } else if (actionID) {
    editHandler(taskID);
  }
}

//  new task handler
function newTaskFormHandler(e) {
  e.preventDefault();
  const id = getUID();
  const tasks = {
    id,
    status: 0,
  };
  [...newTaskForm.elements].forEach((element) => {
    if (element.name) {
      tasks[element.name] = element.value;
    }
  });
  newTaskForm.reset();
  addTaskToLocalStorage(tasks);
  updateUI();
}

// UI handler
// create Tr
function createTr({ name, priority, status, date, id }, index) {
  const formattedDate = new Date(date).toDateString();
  return `<tr id='${id}'>
          <td><input class="checkbox" data-id='${id}' data-checkId='${id}' type="checkbox"/> </td>
          <td>${index + 1}</td>
          <td class="taskName">${name}</td>
          <td class="priority">${priority}</td>
          <td class="status">${status ? "Completed" : "Pending"}</td>
          <td class="date">${formattedDate}</td>
          <td class="action"><button data-id=${id} id="edit"><i class="fa-solid fa-pen"></i></button>
          <button data-id=${id} id="check"><i class="fa-solid fa-check"></i></button>
          <button data-id=${id} id="delete"><i class="fa-solid fa-trash"></i></button></td>
  </tr>`;
}

// ###### initial statement
function initialState() {
  return getAllTasksFromLocalStorage().reverse();
}

// UI Update handler
function updateUI(tasks = initialState()) {
  const tasksMessage = document.getElementById("noTasksMessage");
  if (tasks.length === 0) {
    tasksMessage.style.display = "block";
  } else {
    tasksMessage.style.display = "none";
  }
  const tasksList = tasks.map((task, index) => {
    return createTr(task, index);
  });
  const listItem = tasksList.join("");
  tbody.innerHTML = listItem;
}
updateUI();

// ####### search & filtering & sort handler
function handlingSearchWithTimer(searchText) {
  const tasks = getAllTasksFromLocalStorage();
  const searchedList = tasks.filter(({ name }) => {
    name = name.toLowerCase();
    searchText = searchText.toLowerCase();
    return name.includes(searchText);
  });
  updateUI(searchedList);
}

let timer;
function searchHandler(e) {
  const { value: searchText } = e.target;
  clearTimeout(timer);
  timer = setTimeout(() => handlingSearchWithTimer(searchText), 1000);
}

// filter handler
function filterAndRender(filterText) {
  const tasks = getAllTasksFromLocalStorage();
  let tasksAfterFiltering = tasks;
  switch (filterText) {
    case "all":
      tasksAfterFiltering = tasks;
      break;
    case "1":
      tasksAfterFiltering = tasks.filter((task) => task.status === 1);
      break;
    case "0":
      tasksAfterFiltering = tasks.filter((task) => task.status === 0);
      break;
    case "today":
      tasksAfterFiltering = tasks.filter((task) => {
        const today = new Date().toDateString().split("T")[0];
        return today === task.date;
      });
      break;
    case "high":
      tasksAfterFiltering = tasks.filter((task) => task.priority === "high");
      break;
    case "medium":
      tasksAfterFiltering = tasks.filter((task) => task.priority === "medium");
      break;
    case "low":
      tasksAfterFiltering = tasks.filter((task) => task.priority === "low");
      break;
    default:
      break;
  }
  updateUI(tasksAfterFiltering);
}

function filterHandler(e) {
  const { value: filterText } = e.target;
  filterAndRender(filterText);
}

// sort handler
function sortHandler(e) {
  const { value: sortText } = e.target;
  const tasks = getAllTasksFromLocalStorage();
  let tasksAfterSorting = tasks.sort((taskA, taskB) => {
    const taskADate = new Date(taskA.date);
    const taskBDate = new Date(taskB.date);
    if (taskADate < taskBDate) {
      return sortText === "newest" ? 1 : -1;
    } else if (taskADate > taskBDate) {
      return sortText === "newest" ? -1 : 1;
    } else {
      return 0;
    }
  });
  updateUI(tasksAfterSorting);
}

// by date handler
function byDateHandler(e) {
  const { value: selectedDate } = e.target;
  const tasks = getAllTasksFromLocalStorage();
  const filteredTasks = tasks.filter((task) => task.date === selectedDate);
  updateUI(filteredTasks);
}

// ##### task selection handler
let selectedTasks = [];
function taskSelectionHandler(e) {
  const targetEl = e.target;
  if (targetEl.classList.contains("checkbox")) {
    const { id } = targetEl.dataset;
    if (targetEl.checked) {
      selectedTasks.push(id);
    } else {
      const selectedTasksIndex = selectedTasks.findIndex(
        (taskId) => taskId === id
      );
      selectedTasks.splice(selectedTasksIndex, 1);
    }
  }
  bulkActionToggler();
}

// ###bulkActionToggler
function bulkActionToggler() {
  selectedTasks.length
    ? (bulkAction.style.display = "block")
    : (bulkAction.style.display = "none");
  const tasks = getAllTasksFromLocalStorage();
  if (tasks.length === selectedTasks.length && tasks.length > 0) {
    allSelect.checked = true;
  } else {
    allSelect.checked = false;
  }
}

// all select handler
function allSelectHandler(e) {
  if (e.target.checked) {
    const tasks = getAllTasksFromLocalStorage();
    selectedTasks = tasks.map((task) => task.id);
    selectedTasks.forEach((taskId) => {
      document.querySelector(`[data-checkId='${taskId}']`).checked = true;
    });
  } else {
    selectedTasks.forEach((taskId) => {
      document.querySelector(`[data-checkId='${taskId}']`).checked = false;
    });
    selectedTasks = [];
  }
  bulkActionToggler();
}

// ##### delete & edit & dismiss
// dismiss handler
function dismissHandler() {
  selectedTasks.forEach((taskId) => {
    document.querySelector(`[data-checkId='${taskId}']`).checked = false;
  });
  selectedTasks = [];
  bulkActionToggler();
}

// delete btn
function deleteBtnHandler() {
  const isConfirm = confirm("Really, you want to delete this❌");
  if (isConfirm) {
    const tasks = getAllTasksFromLocalStorage();
    const tasksAfterDeletingList = tasks.filter((task) => {
      if (selectedTasks.includes(task.id)) return false;
      return true;
    });
    addTasksToLocalStorage(tasksAfterDeletingList);
    updateUI(tasksAfterDeletingList);
    selectedTasks = [];
    bulkActionToggler();
  }
}
// bulk edit handler
function bulkEditAreaToggler() {
  editSection.style.display === "block"
    ? (editSection.style.display = "none")
    : (editSection.style.display = "block");
}

function bulkEditHandler() {
  bulkEditAreaToggler();
}

function bulkEditFormHandler(e) {
  e.preventDefault();
  const task = {};
  [...editForm.elements].forEach((element) => {
    if (element.name && element.value) {
      task[element.name] = element.value;
    }
  });
  editForm.reset();
  const tasks = getAllTasksFromLocalStorage();
  const modifiedTasks = tasks.map((selectedTask) => {
    if (selectedTasks.includes(selectedTask.id)) {
      selectedTask = { ...selectedTask, ...task };
    }
    return selectedTask;
  });
  addTasksToLocalStorage(modifiedTasks);
  updateUI(modifiedTasks);
  bulkEditAreaToggler();
  selectedTasks = [];
  bulkActionToggler();
}

// ####### Event listeners
newTaskForm.addEventListener("submit", newTaskFormHandler);
tbody.addEventListener("click", actionHandler);
searchEI.addEventListener("input", searchHandler);
filterEI.addEventListener("input", filterHandler);
sortEI.addEventListener("input", sortHandler);
byDateEI.addEventListener("input", byDateHandler);
tbody.addEventListener("input", taskSelectionHandler);
allSelect.addEventListener("input", allSelectHandler);
dismiss.addEventListener("click", dismissHandler);
deleteBtn.addEventListener("click", deleteBtnHandler);
editBtn.addEventListener("click", bulkEditHandler);
editForm.addEventListener("submit", bulkEditFormHandler);
