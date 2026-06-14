const STORAGE_KEY = "pastoral_exam_state";

let remainingSeconds = 9000;
let timerInterval;

/* ================= LOGIN ================= */
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("loginIndexNumber").value.trim();
  if (!id) return;

  const state = loadState() || {};

  state.student = { indexNumber: id };
  state.remainingSeconds = state.remainingSeconds || remainingSeconds;

  saveState(state);

  startExam();
});

/* ================= START EXAM ================= */
function startExam() {
  document.getElementById("loginView").style.display = "none";
  document.getElementById("examView").hidden = false;

  const state = loadState();

  const id = state?.student?.indexNumber;

  if (id) {
    document.querySelector('[name="indexNumber"]').value = id;
  }

  remainingSeconds = state?.remainingSeconds || remainingSeconds;

  restoreState();
  startTimer();
}

/* ================= TIMER ================= */
function startTimer() {
  clearInterval(timerInterval);

  function render() {
    const h = String(Math.floor(remainingSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(remainingSeconds % 60).padStart(2, "0");

    document.getElementById("timer").textContent = `${h}:${m}:${s}`;
  }

  render();

  timerInterval = setInterval(() => {
    remainingSeconds--;

    saveProgress();

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      alert("Time up!");
      document.getElementById("examForm").submit();
      return;
    }

    render();
  }, 1000);
}

/* ================= SAVE ================= */
function saveProgress() {
  const state = loadState() || {};

  state.student = {
    fullName: document.querySelector('[name="fullName"]').value,
    indexNumber: document.querySelector('[name="indexNumber"]').value,
    date: document.querySelector('[name="date"]').value
  };

  state.answers = collectMCQ();
  state.blanks = collectBlanks();
  state.essays = collectEssays();
  state.remainingSeconds = remainingSeconds;

  saveState(state);
}

function saveState(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/* ================= RESTORE ================= */
function restoreState() {
  const state = loadState();
  if (!state) return;

  document.querySelector('[name="fullName"]').value =
    state.student?.fullName || "";

  document.querySelector('[name="date"]').value =
    state.student?.date || "";

  restoreMCQ(state.answers || {});
  restoreBlanks(state.blanks || {});
  restoreEssays(state.essays || []);
}

/* ================= COLLECT ================= */
function collectMCQ() {
  const data = {};
  document.querySelectorAll("[data-mcq]:checked").forEach(el => {
    data[el.name] = el.value;
  });
  return data;
}

function collectBlanks() {
  const data = {};
  document.querySelectorAll("[data-blank]").forEach(el => {
    data[el.name] = el.value;
  });
  return data;
}

function collectEssays() {
  return Array.from(document.querySelectorAll("[data-essay]"))
    .map(el => el.value);
}

/* ================= RESTORE HELPERS ================= */
function restoreMCQ(data) {
  Object.entries(data).forEach(([name, value]) => {
    const el = document.querySelector(`[name="${name}"][value="${value}"]`);
    if (el) el.checked = true;
  });
}

function restoreBlanks(data) {
  Object.entries(data).forEach(([name, value]) => {
    const el = document.querySelector(`[name="${name}"]`);
    if (el) el.value = value;
  });
}

function restoreEssays(data) {
  document.querySelectorAll("[data-essay]").forEach((el, i) => {
    el.value = data[i] || "";
  });
}

/* ================= AUTO RESTORE ================= */
window.addEventListener("load", () => {
  const state = loadState();
  if (state?.student?.indexNumber) {
    startExam();
  }
});