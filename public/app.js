const exam = {
  durationSeconds: 2.5 * 60 * 60,
  mcq: [ /* unchanged - your full MCQ list stays EXACTLY as-is */ ],
  blanks: [ /* unchanged */ ],
  essays: [ /* unchanged */ ]
};

let startedAt = localStorage.getItem("exam_startedAt_v1")
  ? Number(localStorage.getItem("exam_startedAt_v1"))
  : null;

let timerHandle = null;
const DRAFT_KEY = "pastoralSchoolThoseWhoAreProudDraft.v1";
const TIMER_KEY = "exam_startedAt_v1";
const SUBMISSION_LOCK_KEY = "exam_submission_lock_v1";

let isRestoringDraft = false;
let isSubmitted = false;

/* UI refs */
const loginView = document.querySelector("#loginView");
const examView = document.querySelector("#examView");
const loginForm = document.querySelector("#loginForm");
const loginIndexNumber = document.querySelector("#loginIndexNumber");
const mcqList = document.querySelector("#mcqList");
const blankList = document.querySelector("#blankList");
const essayList = document.querySelector("#essayList");
const form = document.querySelector("#examForm");
const statusMessage = document.querySelector("#statusMessage");

/* date */
document.querySelector('input[name="date"]').valueAsDate = new Date();

/* helpers */
function optionLetter(index) {
  return String.fromCharCode(65 + index);
}

/* RENDER FUNCTIONS (UNCHANGED) */
function renderMcq() {
  mcqList.innerHTML = exam.mcq.map((q, i) => `
    <fieldset class="question-card">
      <legend>${i + 1}. ${q.text}</legend>
      ${q.options.map((opt, j) => `
        <label class="option">
          <input type="radio" name="${q.id}" value="${optionLetter(j)}" />
          <span>${optionLetter(j)}. ${opt}</span>
        </label>
      `).join("")}
    </fieldset>
  `).join("");
}

function renderBlanks() {
  blankList.innerHTML = exam.blanks.map((q, i) => `
    <div class="question-card">
      <p class="question-title">${i + 1}. ${q.text}</p>
      <div class="blank-inputs">
        ${Array.from({ length: q.blanks }, (_, b) => `
          <label>
            ${q.blanks === 1 ? "Answer" : `Blank ${b + 1}`}
            <input name="${q.id}_${b + 1}" />
          </label>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function renderEssays() {
  essayList.innerHTML = exam.essays.map((q, i) => `
    <div class="question-card">
      <label class="essay-toggle">
        <input type="checkbox" class="essay-select" value="${q.id}" />
        <span>Answer Question ${i + 1}: ${q.title}</span>
      </label>
      <p>${q.prompt.replace(/\n/g, "<br />")}</p>
      <textarea name="${q.id}" disabled></textarea>
    </div>
  `).join("");
}

/* SECTION NAV */
function setActiveSection(id) {
  document.querySelectorAll(".section").forEach(s =>
    s.classList.toggle("active", s.id === id)
  );
}

/* ESSAY CONTROL */
function getSelectedEssays() {
  return [...document.querySelectorAll(".essay-select:checked")].map(x => x.value);
}

function updateEssayControls() {
  const selected = getSelectedEssays();

  document.querySelectorAll(".essay-select").forEach(cb => {
    const ta = document.querySelector(`textarea[name="${cb.value}"]`);

    ta.disabled = !cb.checked;
    if (!cb.checked) ta.value = "";

    cb.disabled = !cb.checked && selected.length >= 4;
  });
}

/* DATA COLLECTION */
function collectPayload() {
  const data = new FormData(form);

  const answers = {};
  exam.mcq.forEach(q => {
    answers[q.id] = data.get(q.id) || "";
  });

  const fillBlanks = {};
  exam.blanks.forEach(q => {
    fillBlanks[q.id] = Array.from({ length: q.blanks }, (_, i) =>
      (data.get(`${q.id}_${i + 1}`) || "").trim()
    );
  });

  const essays = getSelectedEssays().map(id => {
    const q = exam.essays.find(e => e.id === id);
    return {
      id,
      title: q.title,
      answer: (data.get(id) || "").trim()
    };
  });

  return {
    student: {
      indexNumber: (data.get("indexNumber") || "").trim(),
      date: (data.get("date") || "").trim()
    },
    answers,
    fillBlanks,
    essays,
    elapsedSeconds: startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0
  };
}

/* TIMER (PERSISTENT) */
function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
}

function tickTimer() {
  if (!startedAt) return;

  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const remaining = Math.max(0, exam.durationSeconds - elapsed);

  document.querySelector("#timer").textContent = formatTime(remaining);

  if (remaining === 0) {
    statusMessage.textContent = "Time is up. Submit now.";
  }
}

/* LOGIN */
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const studentId = loginIndexNumber.value.trim();
  if (!studentId) return;

  // LOCK CHECK FIRST
  if (localStorage.getItem(SUBMISSION_LOCK_KEY + studentId)) {
    statusMessage.textContent = "You have already submitted this exam.";
    return;
  }

  form.elements.indexNumber.value = studentId;

  loginView.hidden = true;
  examView.hidden = false;

  startedAt = startedAt || Date.now();
  localStorage.setItem(TIMER_KEY, startedAt);

  if (timerHandle) clearInterval(timerHandle);
  timerHandle = setInterval(tickTimer, 1000);

  tickTimer();
  form.elements.fullName.focus();

  saveDraft(); // correct call
});

/* NEXT BUTTON */
document.querySelectorAll(".nextBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    const order = ["sectionA", "sectionB", "sectionC", "review"];
    const current = document.querySelector(".section.active")?.id;
    const next = order[order.indexOf(current) + 1];
    if (next) setActiveSection(next);
  });
});

/* SAVE DRAFT */
function saveDraft() {
  if (isSubmitted || isRestoringDraft) return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(collectPayload()));
}

function restoreDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;

  try {
    const d = JSON.parse(raw);

    Object.entries(d.answers || {}).forEach(([k, v]) => {
      const el = form.querySelector(`input[name="${k}"][value="${v}"]`);
      if (el) el.checked = true;
    });

    Object.entries(d.fillBlanks || {}).forEach(([k, arr]) => {
      arr.forEach((v, i) => {
        const el = form.elements[`${k}_${i + 1}`];
        if (el) el.value = v;
      });
    });

  } catch {}
}

/* VALIDATION (BLANKS OPTIONAL NOW) */
function validate(payload) {
  if (Object.values(payload.answers).some(a => !a)) {
    return "Answer all MCQs.";
  }
  if (payload.essays.length !== 4) {
    return "Select 4 essays.";
  }
  return "";
}

/* INPUT EVENTS */
form.addEventListener("change", e => {
  if (e.target.classList.contains("essay-select")) updateEssayControls();
  saveDraft();
});

form.addEventListener("input", saveDraft);

/* SUBMIT */
form.addEventListener("submit", async e => {
  e.preventDefault();

  const payload = collectPayload();
  const err = validate(payload);

  if (err) {
    statusMessage.textContent = err;
    return;
  }

  const id = payload.student.indexNumber;

  localStorage.setItem(SUBMISSION_LOCK_KEY + id, "true");
  localStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem(TIMER_KEY);

  clearInterval(timerHandle);
  isSubmitted = true;

  const res = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await res.json();

  if (res.ok) {
    statusMessage.textContent = "Submitted: " + result.id;
  } else {
    statusMessage.textContent = "Error submitting";
  }
});

/* INIT */
renderMcq();
renderBlanks();
renderEssays();
updateEssayControls();
tickTimer();
restoreDraft();