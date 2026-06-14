const pinInput = document.querySelector("#pin");
const submissionsEl = document.querySelector("#submissions");

async function fetchSubmissions() {
  const pin = pinInput.value.trim();
  submissionsEl.innerHTML = "<p>Loading submissions...</p>";

  try {
    const response = await fetch("/api/submissions", {
      headers: { "x-admin-pin": pin }
    });
    const submissions = await response.json();
    if (!response.ok) throw new Error(submissions.error || "Unable to load submissions.");
    renderSubmissions(submissions);
  } catch (error) {
    submissionsEl.innerHTML = `<p class="status error">${error.message}</p>`;
  }
}

function renderSubmissions(submissions) {
  if (!submissions.length) {
    submissionsEl.innerHTML = "<p>No submissions yet.</p>";
    return;
  }

  submissionsEl.innerHTML = submissions
    .map(
      (submission) => `
        <details class="submission-card">
          <summary>${submission.student.fullName} (${submission.student.indexNumber}) - ${new Date(
            submission.submittedAt
          ).toLocaleString()}</summary>
          <h3>Section A</h3>
          <pre>${JSON.stringify(submission.answers, null, 2)}</pre>
          <h3>Section B</h3>
          <pre>${JSON.stringify(submission.fillBlanks, null, 2)}</pre>
          <h3>Section C</h3>
          ${submission.essays
            .map(
              (essay) => `
                <article>
                  <h4>${essay.title}</h4>
                  <p>${essay.answer.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />")}</p>
                </article>`
            )
            .join("")}
        </details>`
    )
    .join("");
}

document.querySelector("#loadSubmissions").addEventListener("click", fetchSubmissions);

document.querySelector("#downloadCsv").addEventListener("click", () => {
  const pin = encodeURIComponent(pinInput.value.trim());
  window.location.href = `/api/submissions.csv?pin=${pin}`;
});
