let tasks = JSON.parse(localStorage.getItem('sm_tasks')) || [
    { id: 1, name: "Complete DSA Assignment", desc: "Binary Tree Module", priority: "High", deadline: "2026-08-18", completed: false },
    { id: 2, name: "Finish HTML Project", desc: "Build SmartDesk", priority: "Medium", deadline: "2026-08-17", completed: true }
];

let notes = JSON.parse(localStorage.getItem('sm_notes')) || [
    { id: 1, title: "Data Structure", category: "DSA", content: "Quick Sort uses a pivot to divide an array into smaller sections." }
];

let schedule = JSON.parse(localStorage.getItem('sm_schedule')) || [
    { id: 1, time: "09:00 AM", activity: "CIS Class" },
    { id: 2, time: "11:00 AM", activity: "Data Structures" }
];

// DOM Initialization & Event Handlers
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNavigation();
    initWeatherAPI();
    renderAll();

    // Event Listeners for Forms & Modals
    document.getElementById("openTaskModalBtn").addEventListener("click", () => openModal("taskModal"));
    document.getElementById("closeTaskModal").addEventListener("click", () => closeModal("taskModal"));
    document.getElementById("taskForm").addEventListener("submit", handleTaskSubmit);

    document.getElementById("openNoteModalBtn").addEventListener("click", () => openModal("noteModal"));
    document.getElementById("closeNoteModal").addEventListener("click", () => closeModal("noteModal"));
    document.getElementById("noteForm").addEventListener("submit", handleNoteSubmit);

    document.getElementById("openScheduleModalBtn").addEventListener("click", () => openModal("scheduleModal"));
    document.getElementById("closeScheduleModal").addEventListener("click", () => closeModal("scheduleModal"));
    document.getElementById("scheduleForm").addEventListener("submit", handleScheduleSubmit);

    document.getElementById("themeToggle").addEventListener("click", toggleTheme);
    document.getElementById("hamburgerMenu").addEventListener("click", () => {
        document.getElementById("navLinks").classList.toggle("active");
    });

    document.getElementById("globalSearch").addEventListener("input", handleSearch);
    document.getElementById("priorityFilter").addEventListener("change", renderTasks);
    document.getElementById("statusFilter").addEventListener("change", renderTasks);
    document.getElementById("clearDataBtn").addEventListener("click", clearAllData);
});

// UI Navigation Tab Control
function initNavigation() {
    const links = document.querySelectorAll(".nav-links a");
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            const target = link.getAttribute("href").replace("#", "");
            document.querySelectorAll(".tab-content").forEach(tab => {
                tab.classList.remove("active");
                if (tab.id === target) tab.classList.add("active");
            });

            // Close mobile menu on click
            document.getElementById("navLinks").classList.remove("active");
        });
    });
}

// Render Core Application Component Data
function renderAll() {
    renderTasks();
    renderNotes();
    renderSchedule();
    updateStats();
}

function renderTasks() {
    const mainList = document.getElementById("mainTaskList");
    const dashList = document.getElementById("dashboardTaskList");
    const priorityVal = document.getElementById("priorityFilter").value;
    const statusVal = document.getElementById("statusFilter").value;

    mainList.innerHTML = "";
    dashList.innerHTML = "";

    let filtered = tasks.filter(task => {
        const matchPriority = priorityVal === "ALL" || task.priority === priorityVal;
        const matchStatus = statusVal === "ALL" || 
            (statusVal === "completed" ? task.completed : !task.completed);
        return matchPriority && matchStatus;
    });

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div>
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span style="margin-left: 8px;"><strong>${task.name}</strong> (${task.deadline})</span>
                <span class="badge-priority ${task.priority}">${task.priority}</span>
            </div>
            <div>
                <button onclick="deleteTask(${task.id})" class="icon-btn"><i class="fa-solid fa-trash" style="color:var(--danger)"></i></button>
            </div>
        `;
        mainList.appendChild(li);
    });

    // Populate Dashboard Quick Tasks (First 4 Tasks)
    tasks.slice(0, 4).forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";
        li.innerHTML = `<span>${task.completed ? '☑' : '☐'} ${task.name}</span>`;
        dashList.appendChild(li);
    });

    saveState();
}

function renderNotes() {
    const container = document.getElementById("notesGrid");
    container.innerHTML = "";
    notes.forEach(note => {
        const div = document.createElement("div");
        div.className = "card note-card";
        div.innerHTML = `
            <h3>${note.title}</h3>
            <p><small><strong>Category:</strong> ${note.category}</small></p>
            <p style="margin-top:0.5rem">${note.content}</p>
            <button onclick="deleteNote(${note.id})" class="icon-btn" style="position:absolute; top:10px; right:10px;"><i class="fa-solid fa-times"></i></button>
        `;
        container.appendChild(div);
    });
    saveState();
}

function renderSchedule() {
    const tbody = document.getElementById("scheduleBody");
    tbody.innerHTML = "";
    schedule.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${item.time}</strong></td>
            <td>${item.activity}</td>
            <td><button onclick="deleteSchedule(${item.id})" class="icon-btn"><i class="fa-solid fa-trash" style="color:var(--danger)"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
    saveState();
}

// Dynamic Metrics Updates
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const upcoming = total - completed;
    const score = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("statTotal").innerText = total;
    document.getElementById("statCompleted").innerText = completed;
    document.getElementById("statUpcoming").innerText = upcoming;
    document.getElementById("statProductivity").innerText = `${score}%`;

    // Sync Stats in Profile View
    document.getElementById("profCompleted").innerText = completed;
    document.getElementById("profNotesCount").innerText = notes.length;
    document.getElementById("profProductivity").innerText = `${score}%`;
}

// Data Actions
function handleTaskSubmit(e) {
    e.preventDefault();
    const newTask = {
        id: Date.now(),
        name: document.getElementById("taskName").value,
        desc: document.getElementById("taskDesc").value,
        priority: document.getElementById("taskPriority").value,
        deadline: document.getElementById("taskDeadline").value,
        completed: false
    };
    tasks.push(newTask);
    closeModal("taskModal");
    document.getElementById("taskForm").reset();
    renderAll();
}

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    renderAll();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    renderAll();
}

function handleNoteSubmit(e) {
    e.preventDefault();
    const newNote = {
        id: Date.now(),
        title: document.getElementById("noteTitle").value,
        category: document.getElementById("noteCategory").value,
        content: document.getElementById("noteContent").value
    };
    notes.push(newNote);
    closeModal("noteModal");
    document.getElementById("noteForm").reset();
    renderAll();
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    renderAll();
}

function handleScheduleSubmit(e) {
    e.preventDefault();
    const newSched = {
        id: Date.now(),
        time: document.getElementById("schedTime").value,
        activity: document.getElementById("schedActivity").value
    };
    schedule.push(newSched);
    closeModal("scheduleModal");
    document.getElementById("scheduleForm").reset();
    renderAll();
}

function deleteSchedule(id) {
    schedule = schedule.filter(s => s.id !== id);
    renderAll();
}

// Weather API Integration (Open-Meteo)
async function initWeatherAPI() {
    const container = document.getElementById("weatherContent");
    try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current_weather=true");
        const data = await res.json();
        const temp = data.current_weather.temperature;
        const wind = data.current_weather.windspeed;

        container.innerHTML = `
            <h4>Dhaka, Bangladesh</h4>
            <p style="font-size: 1.8rem; font-weight:bold; margin: 0.5rem 0;">${temp}°C</p>
            <p><small>Wind Speed: ${wind} km/h</small></p>
        `;
    } catch (err) {
        container.innerHTML = `<p style="color:var(--danger)">Failed to fetch live weather data.</p>`;
    }
}

// Global Instant Real-Time Search Handler
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    
    document.querySelectorAll("#mainTaskList .task-item").forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(query) ? "flex" : "none";
    });

    document.querySelectorAll(".note-card").forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(query) ? "block" : "none";
    });
}

// Theme Switcher & Modal Utilities
function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

function initTheme() {
    const savedTheme = localStorage.getItem('sm_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('sm_theme', target);
}

function saveState() {
    localStorage.setItem('sm_tasks', JSON.stringify(tasks));
    localStorage.setItem('sm_notes', JSON.stringify(notes));
    localStorage.setItem('sm_schedule', JSON.stringify(schedule));
}

function clearAllData() {
    if (confirm("Are you sure you want to reset all data back to default?")) {
        localStorage.clear();
        location.reload();
    }
}