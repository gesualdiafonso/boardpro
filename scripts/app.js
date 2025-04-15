const deptForm = document.getElementById("dept-form");
const deptNameInput = document.getElementById("dept-name");
const deptTabs = document.getElementById("dept-tabs");
const deptContent = document.getElementById("dept-content");

let departments = [];


// Salvamento en LocalStorage
function saveToLocalStorage() {
    localStorage.setItem("departments", JSON.stringify(departments));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem("departments");
    if (data) {
        departments = JSON.parse(data);
    }
}

// Carregando dados ao iniciar app
window.addEventListener("DOMContentLoaded", () => {
    loadFromLocalStorage();
    departments.forEach(({ id, name, tasks }) => {
        createDepartmentTab(name);
        createDepartmentContent(id, name, tasks || []);
    });
});


// Agregando evento al Submit de DPT
deptForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = deptNameInput.value.trim();
    if (name === "") return;

    const deptId = `dept-${Date.now()}`;

    createDepartmentTab(name);
    createDepartmentContent(deptId, name, []);

    departments.push({ id: deptId, name, tasks: [] });
    saveToLocalStorage();

    deptNameInput.value = "";
});


// Función para crear el tab de un departamento
function createDepartmentTab(name) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = name;
    li.appendChild(a);
    deptTabs.appendChild(li);
}

// Función para crear el contenido del departamento
function createDepartmentContent(id, name, tasks = []) {
    const li = document.createElement("li");
    li.innerHTML = `
        <h3 class="uk-heading-bullet">Tareas Sector - ${name}</h3>
        <div class="uk-card uk-card-default uk-card-body uk-margin-bottom">
            <form class="uk-grid-small task-form" uk-grid>
                <div class="uk-width-1-3">
                    <input class="uk-input task-input" type="text" placeholder="Título de la tarea" required>
                </div>
                <div class="uk-width-1-3">
                    <select class="uk-select task-priority">
                        <option disabled selected>Prioridad</option>
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                    </select>
                </div>
                <div class="uk-width-1-3">
                    <button class="uk-button uk-button-primary" type="submit">Adicionar Tarea</button>
                </div>
            </form>
        </div>
        <ul class="uk-list uk-list-divider task-list"></ul>
    `;

    const form = li.querySelector(".task-form");
    const input = li.querySelector(".task-input");
    const select = li.querySelector(".task-priority");
    const taskList = li.querySelector(".task-list");

    // Recriar tarefas salvas
    tasks.forEach(task => {
        addTask(task.text, task.priority, taskList, task.done);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const taskText = input.value.trim();
        const priority = select.value;
        if (taskText === "" || !priority) return;

        addTask(taskText, priority, taskList, false);

        // Atualiza dados do departamento
        const dept = departments.find(d => d.id === id);
        if (dept) {
            dept.tasks.push({ text: taskText, priority, done: false });
            saveToLocalStorage();
        }

        input.value = "";
        select.selectedIndex = 0;
    });

    deptContent.appendChild(li);
}

// Función para agregar una tarea

function addTask(text, priority, listElement, isDone) {
    const li = document.createElement("li");
    li.classList.add("uk-flex", "uk-flex-between", "uk-flex-middle");

    const priorityLabel = {
        alta: '<strong class="uk-text-danger">[Alta]</strong>',
        media: '<strong class="uk-text-primary">[Media]</strong>',
        baja: '<strong class="uk-text-success">[Baja]</strong>',
    };

    const taskContent = document.createElement("div");
    taskContent.innerHTML = `${priorityLabel[priority] || ""} ${text}`;
    if (isDone) {
        taskContent.classList.add("uk-text-muted");
        taskContent.style.textDecoration = "line-through";
    }

    const controls = document.createElement("div");

    const doneBtn = document.createElement("button");
    doneBtn.className = "uk-button uk-button-small uk-button-default uk-margin-small-right";
    doneBtn.innerText = "Concluir";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "uk-button uk-button-small uk-button-danger";
    deleteBtn.innerText = "Excluir";

    doneBtn.addEventListener("click", () => {
        const isNowDone = !taskContent.classList.contains("uk-text-muted");
        taskContent.classList.toggle("uk-text-muted");
        taskContent.style.textDecoration = isNowDone ? "line-through" : "none";

        // Atualiza status da tarefa no objeto
        updateTaskStatus(text, isNowDone);
    });

    deleteBtn.addEventListener("click", () => {
        li.remove();
        deleteTask(text);
    });

    controls.appendChild(doneBtn);
    controls.appendChild(deleteBtn);

    li.appendChild(taskContent);
    li.appendChild(controls);
    listElement.appendChild(li);
}
// Función para actualizar el estado de la tarea
function updateTaskStatus(taskText, doneStatus) {
    for (const dept of departments) {
        const task = dept.tasks.find(t => t.text === taskText);
        if (task) {
            task.done = doneStatus;
            break;
        }
    }
    saveToLocalStorage();
}

// Función para eliminar una tarea
function deleteTask(taskText) {
    for (const dept of departments) {
        const index = dept.tasks.findIndex(t => t.text === taskText);
        if (index !== -1) {
            dept.tasks.splice(index, 1);
            break;
        }
    }
    saveToLocalStorage();
}
