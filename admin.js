
const API = "https://ahmedwedding-two.vercel.app/api/admin";

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const dashboardMessage = document.getElementById("dashboardMessage");

const tableBody = document.getElementById("rsvpTable");

let currentPage = 1;
const limit = 10;
let allRSVPs = [];

// LOGIN
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const loginBtn = document.getElementById("loginBtn");

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
    loginMessage.textContent = "";

    try {
        const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Login failed");
        }

        localStorage.setItem("walima-admin-token", result.token);

        loginForm.reset();
        showDashboard();

    } catch (error) {
        loginMessage.textContent = error.message;
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
});

// AUTHENTICATED API REQUEST
async function adminFetch(url) {
    const token = localStorage.getItem("walima-admin-token");

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const result = await response.json();

    if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
        throw new Error(result.message || "Request failed");
    }

    return result;
}

// SHOW DASHBOARD
async function showDashboard() {
    loginSection.hidden = true;
    dashboardSection.hidden = false;

    await loadDashboard();
}

// LOAD STATS AND GUESTS
async function loadDashboard() {
    dashboardMessage.textContent = "Loading dashboard...";

    try {
        const statsResult = await adminFetch(`${API}/stats`);

        document.getElementById("totalVisits").textContent =
            statsResult.stats.totalVisits;

        document.getElementById("totalRSVPs").textContent =
            statsResult.stats.totalRSVPs;

        document.getElementById("attending").textContent =
            statsResult.stats.attending;

        document.getElementById("notAttending").textContent =
            statsResult.stats.notAttending;

        document.getElementById("totalGuests").textContent =
            statsResult.stats.totalGuests;

        await loadRSVPs();

        dashboardMessage.textContent = "";

    } catch (error) {
        dashboardMessage.textContent = error.message;
    }
}

// LOAD RSVP RECORDS
async function loadRSVPs() {
    const result = await adminFetch(
        `${API}/rsvps?page=${currentPage}&limit=${limit}`
    );

    allRSVPs = result.rsvps;

    renderRSVPs(allRSVPs);

    document.getElementById("pageInfo").textContent =
        `Page ${result.page} of ${Math.max(1, result.totalPages)}`;

    document.getElementById("prevBtn").disabled =
        result.page <= 1;

    document.getElementById("nextBtn").disabled =
        result.page >= result.totalPages;
}

// RENDER TABLE
function renderRSVPs(records) {
    tableBody.replaceChildren();

    if (records.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "No RSVP records found.";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    records.forEach(guest => {
        const row = document.createElement("tr");

        const values = [
            guest.name,
            guest.phone,
            guest.attendance,
            guest.guestCount,
            new Date(guest.submittedAt).toLocaleString()
        ];

        values.forEach((value, index) => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";

            if (index === 2) {
                cell.className =
                    guest.attendance === "Yes"
                        ? "status-yes"
                        : "status-no";
            }

            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

// SEARCH CURRENT PAGE
document.getElementById("searchInput")
    .addEventListener("input", (e) => {

        const query = e.target.value.toLowerCase();

        const filtered = allRSVPs.filter(guest =>
            guest.name.toLowerCase().includes(query) ||
            guest.phone.toLowerCase().includes(query)
        );

        renderRSVPs(filtered);
    });

// PAGINATION
document.getElementById("nextBtn").addEventListener("click", async () => {
    currentPage++;
    await loadRSVPs();
});

document.getElementById("prevBtn").addEventListener("click", async () => {
    if (currentPage > 1) {
        currentPage--;
        await loadRSVPs();
    }
});

// REFRESH
document.getElementById("refreshBtn").addEventListener("click", async () => {
    currentPage = 1;
    await loadDashboard();
});

// LOGOUT
function logout() {
    localStorage.removeItem("walima-admin-token");

    dashboardSection.hidden = true;
    loginSection.hidden = false;
    loginMessage.textContent = "";
}

document.getElementById("logoutBtn").addEventListener("click", logout);

// CHECK EXISTING SESSION
if (localStorage.getItem("walima-admin-token")) {
    showDashboard();
}
