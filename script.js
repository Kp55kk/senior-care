// ------------------------------------------------
// Data Initialization
// ------------------------------------------------
const seedData = {
    users: [
        { id: 1, name: "Ram", age: 75, role: "senior", email: "senior@care.com", password: "1234" },
        { id: 2, name: "Meena", age: 68, role: "senior", email: "senior2@care.com", password: "1234" },
        { id: 3, name: "Suresh", age: 72, role: "senior", email: "senior3@care.com", password: "1234" },
        { id: 4, name: "Priya", age: 40, role: "caregiver", email: "care@care.com", password: "1234" },
        { id: 5, name: "Admin", age: 35, role: "admin", email: "admin@care.com", password: "1234" },
        { id: 6, name: "Food Express", age: 0, role: "provider", email: "provider@care.com", password: "1234" }
    ],
    foodRequests: [
        { id: 1, seniorId: 1, type: "Breakfast", diet: "Diabetic", status: "Pending", time: "08:00", instructions: "No sugar in tea." },
        { id: 2, seniorId: 2, type: "Lunch", diet: "Regular", status: "Delivered", time: "13:00", instructions: "" },
        { id: 3, seniorId: 3, type: "Dinner", diet: "Soft Diet", status: "Pending", time: "19:00", instructions: "Well cooked rice." },
        { id: 4, seniorId: 1, type: "Snacks", diet: "Vegetarian", status: "Accepted", time: "16:00", instructions: "" },
        { id: 5, seniorId: 2, type: "Breakfast", diet: "Low Salt", status: "Delivered", time: "09:00", instructions: "" }
    ],
    medicines: [
        { id: 1, seniorId: 1, name: "Metformin", dosage: "500mg", freq: "Morning", startDate: "2026-03-01", endDate: "2026-04-01", takenToday: false },
        { id: 2, seniorId: 1, name: "Aspirin", dosage: "1 Pill", freq: "Night", startDate: "2026-01-01", endDate: "2026-12-31", takenToday: true },
        { id: 3, seniorId: 1, name: "Calcium", dosage: "1 Tablet", freq: "Afternoon", startDate: "2026-03-10", endDate: "2026-05-10", takenToday: false },
        { id: 4, seniorId: 2, name: "Atorvastatin", dosage: "10mg", freq: "Night", startDate: "2026-03-01", endDate: "2026-09-01", takenToday: true },
    ]
};

function getDB() {
    let data = localStorage.getItem('seniorCareData');
    if(!data) {
        localStorage.setItem('seniorCareData', JSON.stringify(seedData));
        return seedData;
    }
    return JSON.parse(data);
}

function saveDB(data) {
    localStorage.setItem('seniorCareData', JSON.stringify(data));
}

function getCurrentUser() {
    let user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    if(user) localStorage.setItem('currentUser', JSON.stringify(user));
    else localStorage.removeItem('currentUser');
}

// ------------------------------------------------
// Routing & State
// ------------------------------------------------
let currentRoleTab = 'senior';

window.onload = function() {
    getDB(); // Initialize DB if empty
    const user = getCurrentUser();
    if(user) {
        routeBasedOnRole(user.role);
    } else {
        showPage('page-landing');
    }
    resetInactivityTimer();
};

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0,0);
    updateNavbar();
    
    // Call specific rendering functions based on page
    if(pageId === 'page-senior-dashboard') renderSeniorDashboard();
    if(pageId === 'page-medicine') renderMedicinePage();
    if(pageId === 'page-caregiver-dashboard') renderCaregiverDashboard();
    if(pageId === 'page-admin') renderAdminDashboard();
    if(pageId === 'page-provider') renderProviderDashboard();
}

function routeBasedOnRole(role) {
    switch(role) {
        case 'senior': showPage('page-senior-dashboard'); break;
        case 'caregiver': showPage('page-caregiver-dashboard'); break;
        case 'admin': showPage('page-admin'); break;
        case 'provider': showPage('page-provider'); break;
        default: showPage('page-landing');
    }
}

function navigateToHome() {
    const user = getCurrentUser();
    if(user) {
        routeBasedOnRole(user.role);
    } else {
        showPage('page-landing');
    }
}

function updateNavbar() {
    const user = getCurrentUser();
    const navLinks = document.getElementById('nav-links');
    if(!user) {
        navLinks.innerHTML = `
            <a class="nav-link" onclick="showPage('page-landing')">Home</a>
            <a class="nav-link" onclick="showPage('page-login')">Login</a>
        `;
        return;
    }

    let links = '';
    if(user.role === 'senior') {
        links = `
            <a class="nav-link" onclick="showPage('page-senior-dashboard')">Dashboard</a>
            <a class="nav-link" onclick="showPage('page-medicine')">Medicines</a>
            <a class="nav-link" onclick="showPage('page-food-request')">Food</a>
        `;
    } else if(user.role === 'caregiver') {
        links = `<a class="nav-link" onclick="showPage('page-caregiver-dashboard')">Dashboard</a>`;
    } else if(user.role === 'admin') {
        links = `<a class="nav-link" onclick="showPage('page-admin')">Admin</a>`;
    } else if(user.role === 'provider') {
        links = `<a class="nav-link" onclick="showPage('page-provider')">Orders</a>`;
    }

    links += `<a class="nav-link" style="color:var(--danger);" onclick="handleLogout()">Logout</a>`;
    navLinks.innerHTML = links;
}

// ------------------------------------------------
// Auth Logic
// ------------------------------------------------
function selectRole(role) {
    currentRoleTab = role;
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    
    // Set hints
    const hints = {
        'senior': 'senior@care.com / 1234',
        'caregiver': 'care@care.com / 1234',
        'admin': 'admin@care.com / 1234',
        'provider': 'provider@care.com / 1234'
    };
    document.getElementById('hint-text').innerText = "Hint: " + hints[role];
}

function handleLogin(e) {
    e.preventDefault();
    
    const db = getDB();
    // For prototype: Allow any credentials, just grab the first user matching the selected role
    let user = db.users.find(u => u.role === currentRoleTab);
    
    if (!user) {
        user = { id: Date.now(), name: "Test User", role: currentRoleTab };
    }
    
    setCurrentUser(user);
    showToast(`Welcome! Logged in as ${currentRoleTab}.`, 'success');
    routeBasedOnRole(user.role);
    document.getElementById('login-form').reset();
}

function handleLogout() {
    setCurrentUser(null);
    showPage('page-landing');
    showToast('Logged out successfully.', 'success');
}

// ------------------------------------------------
// Auto Logout
// ------------------------------------------------
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if(getCurrentUser()) {
        // 30 mins
        inactivityTimer = setTimeout(() => {
            handleLogout();
            showToast('Logged out due to 30 minutes of inactivity.', 'warning');
        }, 30 * 60 * 1000);
    }
}
document.onmousemove = resetInactivityTimer;
document.onkeypress = resetInactivityTimer;
document.onclick = resetInactivityTimer;

// ------------------------------------------------
// Toasts & Modals
// ------------------------------------------------
function showToast(msg, type='success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = { success: '✅', error: '❌', warning: '⚠️' };
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span> <div>${msg}</div>`;
    
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'fadeOut 0.3s forwards'; setTimeout(() => toast.remove(), 300); }, 4000);
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ------------------------------------------------
// Extra Features (Removed Siren)
// ------------------------------------------------

// ------------------------------------------------
// Senior Dash Logic
// ------------------------------------------------
function renderSeniorDashboard() {
    const user = getCurrentUser();
    if(!user || user.role !== 'senior') return;
    
    document.getElementById('senior-welcome').innerText = `Good Morning, ${user.name} 👋`;
    
    const db = getDB();
    
    // Render Medicines Overview
    const myMeds = db.medicines.filter(m => m.seniorId === user.id);
    const medHtml = myMeds.length > 0 ? myMeds.slice(0, 3).map(m => `
        <div style="padding: 12px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items:center;">
            <div>
                <strong>${m.name}</strong><br>
                <small style="color:var(--text-muted);">${m.dosage} - ${m.freq}</small>
            </div>
            ${m.takenToday ? `<span class="badge badge-delivered">Taken</span>` : `<span class="badge badge-pending">Pending</span>`}
        </div>
    `).join('') : '<p class="text-muted">No medicines scheduled.</p>';
    document.getElementById('senior-medicine-list').innerHTML = medHtml;

    // Render Food Overview
    const myFoods = db.foodRequests.filter(f => f.seniorId === user.id).reverse();
    const foodHtml = myFoods.length > 0 ? myFoods.slice(0, 3).map(f => `
        <div style="padding: 12px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items:center;">
            <div>
                <strong>${f.type}</strong><br>
                <small style="color:var(--text-muted);">${f.time}</small>
            </div>
            <span class="badge badge-${f.status.toLowerCase() === 'delivered' ? 'delivered' : 'pending'}">${f.status}</span>
        </div>
    `).join('') : '<p class="text-muted">No food requests.</p>';
    document.getElementById('senior-food-list').innerHTML = foodHtml;
}

function handleFoodRequest(e) {
    e.preventDefault();
    const user = getCurrentUser();
    const db = getDB();
    
    const req = {
        id: Date.now(),
        seniorId: user.id,
        type: document.getElementById('food-type').value,
        diet: document.getElementById('food-diet').value,
        time: document.getElementById('food-time').value,
        instructions: document.getElementById('food-instructions').value,
        status: 'Pending'
    };
    
    db.foodRequests.push(req);
    saveDB(db);
    showToast('Food request submitted successfully!', 'success');
    e.target.reset();
    showPage('page-senior-dashboard');
}

// ------------------------------------------------
// Medicine Logic
// ------------------------------------------------
function renderMedicinePage() {
    const user = getCurrentUser();
    const db = getDB();
    const myMeds = db.medicines.filter(m => m.seniorId === user.id);
    
    let hasMissed = false;
    
    const html = myMeds.length > 0 ? myMeds.map(m => {
        if(!m.takenToday) hasMissed = true;
        const cardClass = m.takenToday ? 'med-taken' : 'med-missed';
        return `
        <div class="card mb-4 ${cardClass}" style="padding: 15px;">
            <div class="flex justify-between items-center">
                <div>
                    <h4 style="margin-bottom: 2px;">${m.name}</h4>
                    <p style="margin:0; font-size:14px; color:var(--text-muted);">
                        💊 ${m.dosage} | 🕒 ${m.freq}
                    </p>
                    <small style="color:var(--text-muted);">Until: ${m.endDate}</small>
                </div>
                <div>
                    <button class="btn btn-success" onclick="markMedTaken(${m.id})">Mark Taken</button>
                </div>
            </div>
        </div>
    `}).join('') : '<div class="empty-state">No medicines added yet.</div>';
    
    document.getElementById('med-management-list').innerHTML = html;
    document.getElementById('missed-med-badge').style.display = hasMissed ? 'inline-block' : 'none';
}

function handleAddMedicine(e) {
    e.preventDefault();
    const user = getCurrentUser();
    const db = getDB();
    
    const med = {
        id: Date.now(),
        seniorId: user.id,
        name: document.getElementById('med-name').value,
        dosage: document.getElementById('med-dosage').value,
        freq: document.getElementById('med-freq').value,
        startDate: document.getElementById('med-start').value,
        endDate: document.getElementById('med-end').value,
        takenToday: false
    };
    
    db.medicines.push(med);
    saveDB(db);
    showToast('Medicine schedule saved!', 'success');
    e.target.reset();
    renderMedicinePage();
}

function markMedTaken(medId) {
    const db = getDB();
    const med = db.medicines.find(m => m.id === medId);
    if(med) {
        med.takenToday = true;
        saveDB(db);
        showToast(`Marked ${med.name} as taken.`, 'success');
        renderMedicinePage();
    }
}


// ------------------------------------------------
// Caregiver Dashboard
// ------------------------------------------------
function renderCaregiverDashboard() {
    const db = getDB();
    const seniors = db.users.filter(u => u.role === 'senior');
    const pendingFoods = db.foodRequests.filter(f => f.status === 'Pending');
    
    document.getElementById('cg-pending-count').innerText = pendingFoods.length;
    
    // Seniors list
    document.getElementById('cg-seniors-list').innerHTML = seniors.map(s => `
        <tr>
            <td><strong>${s.name}</strong><br><small>${s.email}</small></td>
            <td>${s.age} yrs</td>
            <td><span class="badge badge-active">Monitored</span></td>
        </tr>
    `).join('');
}

// ------------------------------------------------
// Admin Logic
// ------------------------------------------------
function renderAdminDashboard() {
    const db = getDB();
    document.getElementById('admin-users-txt').innerText = db.users.length;
    
    document.getElementById('admin-users-table').innerHTML = db.users.map(u => `
        <tr>
            <td><strong>${u.name}</strong></td>
            <td>${u.email}</td>
            <td><span class="badge" style="background:var(--border);">${u.role.toUpperCase()}</span></td>
            <td><button class="btn btn-outline" style="padding: 4px 10px; font-size:12px;">Edit</button></td>
        </tr>
    `).join('');
}

// ------------------------------------------------
// Provider Logic
// ------------------------------------------------
function renderProviderDashboard() {
    const db = getDB();
    const requests = db.foodRequests.filter(f => f.status !== 'Delivered').reverse();
    
    document.getElementById('provider-incoming-list').innerHTML = requests.length > 0 ? requests.map(f => {
        const senior = db.users.find(u => u.id === f.seniorId);
        const isPending = f.status === 'Pending';
        return `
        <tr>
            <td><strong>#ORD-${f.id.toString().substring(0,5)}</strong><br><small>${senior ? senior.name : ''}</small></td>
            <td>${f.type}<br><small class="badge" style="background:#eee;">${f.diet}</small></td>
            <td>${f.time}</td>
            <td><span class="badge badge-${isPending ? 'pending' : 'active'}">${f.status}</span></td>
            <td>
                ${isPending ? 
                    `<button class="btn btn-primary" style="padding: 6px 12px; font-size:13px;" onclick="acceptOrder(${f.id})">Accept Order</button>` :
                    `<button class="btn btn-success" style="padding: 6px 12px; font-size:13px;" onclick="deliverOrder(${f.id})">Mark Delivered</button>`
                }
            </td>
        </tr>
    `}).join('') : '<tr><td colspan="5" class="text-center text-muted">No pending orders.</td></tr>';
}

function acceptOrder(id) {
    const db = getDB();
    const req = db.foodRequests.find(f => f.id === id);
    if(req) {
        req.status = 'Accepted';
        saveDB(db);
        showToast('Order Accepted. Start preparing!', 'success');
        renderProviderDashboard();
    }
}

function deliverOrder(id) {
    const db = getDB();
    const req = db.foodRequests.find(f => f.id === id);
    if(req) {
        req.status = 'Delivered';
        saveDB(db);
        showToast('Order delivered successfully.', 'success');
        renderProviderDashboard();
    }
}
