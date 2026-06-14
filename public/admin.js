// ─── DOM refs ─────────────────────────────────────────────────────────────────
const submissionsEl   = document.querySelector("#submissions");
const searchInput     = document.querySelector("#searchInput");
const statsBar        = document.querySelector("#statsBar");
const statTotal       = document.querySelector("#statTotal");
const statToday       = document.querySelector("#statToday");
const resetModal      = document.querySelector("#resetModal");
const resetIndexInput = document.querySelector("#resetIndexInput");
const resetMsg        = document.querySelector("#resetMsg");

let allSubmissions = [];

// ─── Auth helpers ─────────────────────────────────────────────────────────────
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
    const res = await fetch("/api/admin/verify", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) { 
      window.location.href = "/admin-login.html"; 
      return false; 
    }
  } catch (e) {
    console.warn("Verify failed, allowing cached view");
  }
  return true;
}

// ─── Load submissions ─────────────────────────────────────────────────────────
async function fetchSubmissions() {
  submissionsEl.innerHTML = `<div class="loading-state"><p>Loading submissions…</p></div>`;
  try {
    const res = await fetch("/api/submissions", { headers: authHeaders() });
    if (res.status === 401) { 
      window.location.href = "/admin-login.html"; 
      return; 
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load");
    allSubmissions = data;
    renderStats(data);
    renderSubmissions(filterSubmissions(data));
  } catch (error) {
    submissionsEl.innerHTML = `<p class="status error">${error.message}</p>`;
  }
}

// Filter, Stats, Render (unchanged but cleaned)
function filterSubmissions(submissions) {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return submissions;
  return submissions.filter((s) =>
    s.student.indexNumber.toLowerCase().includes(q) ||
    (s.student.fullName || "").toLowerCase().includes(q)
  );
}

searchInput.addEventListener("input", () => renderSubmissions(filterSubmissions(allSubmissions)));

function renderStats(submissions) {
  statsBar.hidden = false;
  statTotal.textContent = submissions.length;
  const today = new Date().toDateString();
  statToday.textContent = submissions.filter(
    (s) => new Date(s.submittedAt).toDateString() === today
  ).length;
}

function renderSubmissions(submissions) {
  if (!submissions.length) {
    submissionsEl.innerHTML = `<div class="empty-state"><p>No submissions found.</p></div>`;
    return;
  }

  submissionsEl.innerHTML = submissions
    .map((s) => {
      const label = s.student.indexNumber;
      const submittedAt = new Date(s.submittedAt).toLocaleString();
      const elapsed = s.elapsedSeconds
        ? `${Math.floor(s.elapsedSeconds / 60)}m ${s.elapsedSeconds % 60}s`
        : "—";
      const mcqCount  = Object.values(s.answers || {}).filter(Boolean).length;
      const blankCount = Object.values(s.fillBlanks || {}).flat().filter(Boolean).length;

      return `
        <details class="submission-card">
          <summary>
            <span class="submission-id">${label}</span>
            <span class="submission-meta">${submittedAt}</span>
            <span class="submission-stats">A: ${mcqCount}/20 &nbsp;B: ${blankCount}/20 &nbsp;Essays: ${(s.essays || []).length}/4 &nbsp;Time: ${elapsed}</span>
          </summary>
          <div class="submission-body">
            <div class="submission-actions">
              <button class="secondary small" onclick="downloadSingle('${s.id}')">Download JSON</button>
            </div>
            <!-- MCQ, Blanks, Essays tables unchanged -->
            <h3>Section A — Multiple Choice</h3>
            <table class="answer-table">...</table>
            <!-- (Keep the rest of your original render code for tables/essays) -->
          </div>
        </details>`;
    })
    .join("");
}

// Download helpers (unchanged)
function downloadSingle(id) {
  const token = encodeURIComponent(getAdminToken());
  window.location.href = `/api/submissions/${id}/download?token=${token}`;
}
window.downloadSingle = downloadSingle;

// CSV, Reset, Logout, Init (unchanged but working with new backend)
document.querySelector("#downloadCsv").addEventListener("click", () => {
  const token = encodeURIComponent(getAdminToken());
  window.location.href = `/api/submissions.csv?token=${token}`;
});

// ... (rest of reset, logout, loadSubmissions listeners remain the same)

guardAuth().then((ok) => { if (ok) fetchSubmissions(); });