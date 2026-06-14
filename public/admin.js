// ================================================
// ADMIN.JS - Complete & Fixed
// ================================================

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
    const res = await fetch("/api/admin/verify", { 
      headers: { "Authorization": `Bearer ${token}` } 
    });
    if (!res.ok) {
      sessionStorage.removeItem("adminToken");
      window.location.href = "/admin-login.html";
      return false;
    }
  } catch (e) {
    console.warn("Auth verify failed");
  }
  return true;
}

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
  return subs.filter(s => 
    s.student.indexNumber.toLowerCase().includes(q)
  );
}

searchInput.addEventListener("input", () => {
  renderSubmissions(filterSubmissions(allSubmissions));
});

function renderStats(subs) {
  statsBar.hidden = false;
  statTotal.textContent = subs.length;
  const today = new Date().toDateString();
  statToday.textContent = subs.filter(s => 
    new Date(s.submittedAt).toDateString() === today
  ).length;
}

function renderSubmissions(subs) {
  if (!subs || subs.length === 0) {
    submissionsEl.innerHTML = `<div class="empty-state"><p>No submissions found.</p></div>`;
    return;
  }

  submissionsEl.innerHTML = subs.map(s => {
    const time = new Date(s.submittedAt).toLocaleString();
    const elapsed = s.elapsedSeconds 
      ? `${Math.floor(s.elapsedSeconds / 60)}m ${s.elapsedSeconds % 60}s` 
      : "—";
    const mcq = Object.values(s.answers || {}).filter(Boolean).length;
    const blanks = Object.values(s.fillBlanks || {}).flat().filter(Boolean).length;

    return `
      <details class="submission-card">
        <summary>
          <span class="submission-id">${s.student.indexNumber}</span>
          <span class="submission-meta">${time}</span>
          <span class="submission-stats">
            A: ${mcq}/20 &nbsp; B: ${blanks}/20 &nbsp; Essays: ${(s.essays || []).length}/4 &nbsp; Time: ${elapsed}
          </span>
        </summary>
        <div class="submission-body">
          <div class="submission-actions">
            <button class="secondary small" onclick="downloadTxt('${s.id}')">Download as TXT</button>
          </div>

          <h3>Section A — Multiple Choice</h3>
          <table class="answer-table">
            <thead><tr><th>Q</th><th>Answer</th></tr></thead>
            <tbody>
              ${Object.entries(s.answers || {}).map(([q, a]) => `
                <tr><td>${q}</td><td>${a || '<em class="no-answer">Not answered</em>'}</td></tr>
              `).join("")}
            </tbody>
          </table>

          <h3>Section B — Fill in Blanks</h3>
          <table class="answer-table">
            <thead><tr><th>Q</th><th>Answers</th></tr></thead>
            <tbody>
              ${Object.entries(s.fillBlanks || {}).map(([q, vals]) => `
                <tr><td>${q}</td><td>${vals.map(v => v || '<em class="no-answer">—</em>').join(", ")}</td></tr>
              `).join("")}
            </tbody>
          </table>

          <h3>Section C — Essays</h3>
          ${(s.essays || []).map((essay, i) => `
            <article class="essay-block">
              <h4>Essay ${i + 1}: ${essay.title}</h4>
              <div class="essay-answer">${(essay.answer || "").replace(/\n/g, "<br />")}</div>
            </article>
          `).join("")}
        </div>
      </details>`;
  }).join("");
}

// Download single submission as TXT
window.downloadTxt = function(id) {
  const token = encodeURIComponent(getAdminToken());
  window.location.href = `/api/submissions/${id}/txt?token=${token}`;
};

// Download All as ZIP
document.getElementById("downloadAllTxt").addEventListener("click", () => {
  const token = encodeURIComponent(getAdminToken());
  window.location.href = `/api/submissions/all.zip?token=${token}`;
});

// Reset Modal
document.getElementById("resetSubmission").addEventListener("click", () => {
  resetIndexInput.value = searchInput.value.trim();
  resetMsg.textContent = "";
  resetMsg.classList.remove("error");
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
  resetMsg.textContent = "";

  try {
    const res = await fetch("/api/admin/reset-submission", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ indexNumber })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Reset failed.");

    resetMsg.textContent = `Submission lock cleared for ${indexNumber}.`;
    setTimeout(() => {
      resetModal.hidden = true;
      fetchSubmissions();
    }, 1500);
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

// Load submissions
document.getElementById("loadSubmissions").addEventListener("click", fetchSubmissions);

guardAuth().then(ok => {
  if (ok) fetchSubmissions();
});