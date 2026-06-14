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
      sessionStorage.removeItem("adminToken");
      window.location.href = "/admin-login.html";
      return false;
    }
  } catch (e) {
    console.warn("Auth verify failed - using cached token");
  }
  return true;
}

// ─── Load submissions ─────────────────────────────────────────────────────────
async function fetchSubmissions() {
  submissionsEl.innerHTML = `<div class="loading-state"><p>Loading submissions…</p></div>`;

  try {
    const res = await fetch("/api/submissions", { headers: authHeaders() });
    
    if (res.status === 401) {
      sessionStorage.removeItem("adminToken");
      window.location.href = "/admin-login.html";
      return;
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load submissions");

    allSubmissions = data || [];
    renderStats(allSubmissions);
    renderSubmissions(filterSubmissions(allSubmissions));
  } catch (error) {
    submissionsEl.innerHTML = `<p class="status error">${error.message}</p>`;
  }
}

function filterSubmissions(submissions) {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return submissions;
  return submissions.filter(s => 
    s.student.indexNumber.toLowerCase().includes(q)
  );
}

searchInput.addEventListener("input", () => {
  renderSubmissions(filterSubmissions(allSubmissions));
});

// ─── Stats ────────────────────────────────────────────────────────────────────
function renderStats(submissions) {
  statsBar.hidden = false;
  statTotal.textContent = submissions.length;
  const today = new Date().toDateString();
  statToday.textContent = submissions.filter(s => 
    new Date(s.submittedAt).toDateString() === today
  ).length;
}

// ─── Render submissions ───────────────────────────────────────────────────────
function renderSubmissions(submissions) {
  if (!submissions || submissions.length === 0) {
    submissionsEl.innerHTML = `<div class="empty-state"><p>No submissions found.</p></div>`;
    return;
  }

  submissionsEl.innerHTML = submissions.map(s => {
    const submittedAt = new Date(s.submittedAt).toLocaleString();
    const elapsed = s.elapsedSeconds 
      ? `${Math.floor(s.elapsedSeconds / 60)}m ${s.elapsedSeconds % 60}s` 
      : "—";
    const mcqCount = Object.values(s.answers || {}).filter(Boolean).length;
    const blankCount = Object.values(s.fillBlanks || {}).flat().filter(Boolean).length;

    return `
      <details class="submission-card">
        <summary>
          <span class="submission-id">${s.student.indexNumber}</span>
          <span class="submission-meta">${submittedAt}</span>
          <span class="submission-stats">
            A: ${mcqCount}/20 &nbsp;B: ${blankCount}/20 &nbsp;Essays: ${(s.essays || []).length}/4 &nbsp;Time: ${elapsed}
          </span>
        </summary>
        <div class="submission-body">
          <div class="submission-actions">
            <button class="secondary small" onclick="downloadSingle('${s.id}')">Download JSON</button>
          </div>
          <!-- MCQ Table -->
          <h3>Section A — Multiple Choice</h3>
          <table class="answer-table">
            <thead><tr><th>Q</th><th>Answer</th></tr></thead>
            <tbody>
              ${Object.entries(s.answers || {}).map(([q, a]) => `
                <tr><td>${q}</td><td>${a || '<em class="no-answer">Not answered</em>'}</td></tr>
              `).join("")}
            </tbody>
          </table>
          <!-- Fill Blanks Table -->
          <h3>Section B — Fill in Blanks</h3>
          <table class="answer-table">
            <thead><tr><th>Q</th><th>Answers</th></tr></thead>
            <tbody>
              ${Object.entries(s.fillBlanks || {}).map(([q, vals]) => `
                <tr><td>${q}</td><td>${vals.map(v => v || '<em class="no-answer">—</em>').join(", ")}</td></tr>
              `).join("")}
            </tbody>
          </table>
          <!-- Essays -->
          <h3>Section C — Essays</h3>
          ${(s.essays || []).map(essay => `
            <article class="essay-block">
              <h4>${essay.title}</h4>
              <div class="essay-answer">${(essay.answer || "").replace(/\n/g, "<br>")}</div>
            </article>
          `).join("")}
        </div>
      </details>`;
  }).join("");
}

function downloadSingle(id) {
  const token = encodeURIComponent(getAdminToken());
  window.location.href = `/api/submissions/${id}/download?token=${token}`;
}
window.downloadSingle = downloadSingle;

// CSV Download
document.getElementById("downloadCsv").addEventListener("click", () => {
  const token = encodeURIComponent(getAdminToken());
  window.location.href = `/api/submissions.csv?token=${token}`;
});

// Reset functionality
document.getElementById("resetSubmission").addEventListener("click", () => {
  resetIndexInput.value = searchInput.value.trim();
  resetMsg.textContent = "";
  resetModal.hidden = false;
});

document.getElementById("cancelReset").addEventListener("click", () => {
  resetModal.hidden = true;
});

document.getElementById("confirmReset").addEventListener("click", async () => {
  const indexNumber = resetIndexInput.value.trim();
  if (!indexNumber) {
    resetMsg.textContent = "Please enter a student ID.";
    resetMsg.classList.add("error");
    return;
  }

  const btn = document.getElementById("confirmReset");
  btn.disabled = true;
  btn.textContent = "Resetting…";

  try {
    const res = await fetch("/api/admin/reset-submission", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ indexNumber })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Reset failed");

    resetMsg.textContent = `Lock reset for ${indexNumber}.`;
    setTimeout(() => {
      resetModal.hidden = true;
      fetchSubmissions();
    }, 1200);
  } catch (error) {
    resetMsg.textContent = error.message;
    resetMsg.classList.add("error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Reset";
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("adminToken");
  window.location.href = "/admin-login.html";
});

// Load on page start
document.getElementById("loadSubmissions").addEventListener("click", fetchSubmissions);

guardAuth().then(ok => {
  if (ok) fetchSubmissions();
});