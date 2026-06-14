const submissionsEl = document.querySelector("#submissions");
const searchInput = document.querySelector("#searchInput");
const statsBar = document.querySelector("#statsBar");
const statTotal = document.querySelector("#statTotal");
const statToday = document.querySelector("#statToday");
const resetModal = document.querySelector("#resetModal");
const resetIndexInput = document.querySelector("#resetIndexInput");
const resetMsg = document.querySelector("#resetMsg");

let allSubmissions = [];

function getAdminToken() {
  return sessionStorage.getItem("adminToken") || "";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getAdminToken()}`
  };
}

async function guardAuth() {
  const token = getAdminToken();
  if (!token) {
    window.location.href = "/admin-login.html";
    return false;
  }
  try {
    const res = await fetch("/api/admin/verify", { headers: { "Authorization": `Bearer ${token}` }});
    if (!res.ok) {
      sessionStorage.removeItem("adminToken");
      window.location.href = "/admin-login.html";
      return false;
    }
  } catch (e) {}
  return true;
}

async function fetchSubmissions() {
  submissionsEl.innerHTML = `<div class="loading-state"><p>Loading submissions…</p></div>`;
  try {
    const res = await fetch("/api/submissions", { headers: authHeaders() });
    if (res.status === 401) {
      window.location.href = "/admin-login.html";
      return;
    }
    const data = await res.json();
    allSubmissions = data || [];
    renderStats(allSubmissions);
    renderSubmissions(filterSubmissions(allSubmissions));
  } catch (error) {
    submissionsEl.innerHTML = `<p class="status error">${error.message}</p>`;
  }
}

function filterSubmissions(subs) {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return subs;
  return subs.filter(s => s.student.indexNumber.toLowerCase().includes(q));
}

searchInput.addEventListener("input", () => renderSubmissions(filterSubmissions(allSubmissions)));

function renderStats(subs) {
  statsBar.hidden = false;
  statTotal.textContent = subs.length;
  const today = new Date().toDateString();
  statToday.textContent = subs.filter(s => new Date(s.submittedAt).toDateString() === today).length;
}

function renderSubmissions(subs) {
  if (!subs.length) {
    submissionsEl.innerHTML = `<div class="empty-state"><p>No submissions found.</p></div>`;
    return;
  }

  submissionsEl.innerHTML = subs.map(s => {
    const time = new Date(s.submittedAt).toLocaleString();
    const elapsed = s.elapsedSeconds ? `${Math.floor(s.elapsedSeconds/60)}m ${s.elapsedSeconds%60}s` : "—";
    const mcq = Object.values(s.answers || {}).filter(Boolean).length;
    const blanks = Object.values(s.fillBlanks || {}).flat().filter(Boolean).length;

    return `
      <details class="submission-card">
        <summary>
          <span class="submission-id">${s.student.indexNumber}</span>
          <span class="submission-meta">${time}</span>
          <span class="submission-stats">A:${mcq}/20 B:${blanks}/20 Essays:${(s.essays||[]).length}/4 Time:${elapsed}</span>
        </summary>
        <div class="submission-body">
          <div class="submission-actions">
            <button class="secondary small" onclick="downloadTxt('${s.id}')">Download as TXT</button>
          </div>
          <!-- Tables and essays content (same as before) -->
          <h3>Section A — Multiple Choice</h3>
          <table class="answer-table">...</table>
          <!-- Keep your existing table and essay rendering code here -->
        </div>
      </details>`;
  }).join("");
}

window.downloadTxt = async function(id) {
  const token = getAdminToken();
  window.location.href = `/api/submissions/${id}/txt?token=${encodeURIComponent(token)}`;
};

// Download All as ZIP
document.getElementById("downloadAllTxt").addEventListener("click", () => {
  const token = getAdminToken();
  window.location.href = `/api/submissions/all.zip?token=${encodeURIComponent(token)}`;
});

// Reset, Logout, etc. (same as previous version)
guardAuth().then(ok => { if (ok) fetchSubmissions(); });