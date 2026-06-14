const pinInput = document.querySelector("#pin");
const submissionsEl = document.querySelector("#submissions");
const statusEl = document.querySelector("#adminStatus");

let isLoading = false;

function setStatus(message, type = "") {
  if (!statusEl) return;
  statusEl.className = `admin-status ${type}`;
  statusEl.textContent = message;
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function fetchSubmissions() {
  const pin = pinInput.value.trim();

  if (!pin) {
    setStatus("Please enter admin PIN before loading submissions.", "error");
    return;
  }

  if (isLoading) return;
  isLoading = true;

  setStatus("Loading submissions...", "info");
  submissionsEl.innerHTML = "<p class='status'>Loading submissions...</p>";

  try {
    const response = await fetch("/api/submissions", {
      method: "GET",
      headers: { "x-admin-pin": pin }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to load submissions.");
    }

    renderSubmissions(data);
    setStatus(`Loaded ${data.length} submission(s).`, "success");

  } catch (error) {
    submissionsEl.innerHTML = "";
    setStatus(error.message, "error");
  } finally {
    isLoading = false;
  }
}

function renderSubmissions(submissions) {
  if (!submissions || submissions.length === 0) {
    submissionsEl.innerHTML = "<p class='status'>No submissions yet.</p>";
    return;
  }

  submissionsEl.innerHTML = submissions
    .map((submission) => {
      const student = submission.student || {};
      const name = escapeHtml(student.fullName || "Unknown");
      const index = escapeHtml(student.indexNumber || "Unknown");

      const time = submission.submittedAt
        ? new Date(submission.submittedAt).toLocaleString()
        : "Unknown time";

      return `
        <details class="submission-card">
          <summary>
            <strong>${name}</strong> (${index}) — ${time}
          </summary>

          <section>
            <h3>Section A</h3>
            <pre>${escapeHtml(JSON.stringify(submission.answers, null, 2))}</pre>
          </section>

          <section>
            <h3>Section B</h3>
            <pre>${escapeHtml(JSON.stringify(submission.fillBlanks, null, 2))}</pre>
          </section>

          <section>
            <h3>Section C</h3>
            ${
              (submission.essays || [])
                .map(
                  (essay) => `
                    <article>
                      <h4>${escapeHtml(essay.title)}</h4>
                      <p>${escapeHtml(essay.answer).replace(/\n/g, "<br />")}</p>
                    </article>
                  `
                )
                .join("") || "<p>No essays submitted.</p>"
            }
          </section>
        </details>
      `;
    })
    .join("");
}

// Load button
document.querySelector("#loadSubmissions").addEventListener("click", fetchSubmissions);

// CSV download with validation
document.querySelector("#downloadCsv").addEventListener("click", () => {
  const pin = pinInput.value.trim();

  if (!pin) {
    setStatus("Enter admin PIN before downloading CSV.", "error");
    return;
  }

  window.location.href = `/api/submissions.csv?pin=${encodeURIComponent(pin)}`;
});