// ─────────────────────────────────────────────────────────────────────────────
// Pastoral School Exam - app.js (Separated Pages Version)
// ─────────────────────────────────────────────────────────────────────────────

const exam = {
  durationSeconds: 2.5 * 60 * 60,
  mcq: [
    { id: "a1", text: "The author uses Adolf Hitler's rise and fall to illustrate which key principle?", options: ["That political power is always corrupted by pride", "That wars are always caused by economic factors", "That delusions caused by pride take approximately ten years to fully unravel", "That Germany was led by a Satanic leader"] },
    { id: "a2", text: "According to James 4:6, what does God give to humble people?", options: ["Wisdom and understanding", "Wealth and long life", "Undeserved help and favor", "Peace and contentment"] },
    { id: "a3", text: "According to the author, the greatest person in the Kingdom of Heaven will be:", options: ["The person who prays the most", "The person who gives the most to the church", "The person who is the most humble", "The person who wins the most souls"] },
    { id: "a4", text: "Which of the following best describes how the author personally applied the principle of copying in his own ministry?", options: ["He copied no one and developed all his methods from personal revelation", "He copied Fred Price for teaching, Yonggi Cho for church growth, Benny Hinn for miracles, and Reinhard Bonnke for mass crusades", "He copied only African ministers because he believed Western methods were irrelevant", "He copied the methods of the Apostle Paul exclusively"] },
    { id: "a5", text: "What is the primary reason ministers stop learning and growing in the Lord, according to Bishop Dag Heward-Mills?", options: ["They become too busy with the work of ministry", "They lack access to good books and resources", "They stop learning at the rate at which they become proud", "They reach a natural ceiling of spiritual development"] },
    { id: "a6", text: "What was the fatal error Rehoboam made that led to the loss of ten tribes of Israel?", options: ["He raised taxes on the people without justification", "He went to war against neighboring nations unnecessarily", "He rejected the counsel of the elders and followed the advice of young men to rule harshly", "He abandoned the worship of God and served idols"] },
    { id: "a7", text: "The author specifically identifies which characteristic as a sign that a minister is \"puffed up like Korah\"?", options: ["Seeking to build the largest church in the city", "Rising up to correct or challenge a spiritual authority that God has placed over them", "Refusing to share the pulpit with other ministers", "Demanding a higher salary from the church"] },
    { id: "a8", text: "According to 1 Timothy 3:6, what specific danger awaits a person who is lifted up with pride?", options: ["They will fall into financial ruin and poverty", "They will fall into the condemnation of the devil", "They will lose their anointing and calling from God", "They will be rejected by their congregation"] },
    { id: "a9", text: "According to Luke 1:51, what does God do to the proud?", options: ["God corrects and disciplines them through suffering", "God sends prophets to warn them before judging them", "God scatters the proud in the imagination of their hearts", "God removes their families and loved ones from them"] },
    { id: "a10", text: "According to Bishop Dag Heward-Mills, pride is described as:", options: ["A minor character flaw that can be easily corrected", "The most deadly evil that afflicts the human race", "A natural part of human development and growth", "A problem that only affects leaders and politicians"] },
    { id: "a11", text: "The author states that the fundamental object of human history is best described as:", options: ["The pursuit of wealth and power by nations", "The advancement of science and technology", "The history of the manifestation of pride through satanic nature working in man", "The story of God's redemption of mankind"] },
    { id: "a12", text: "According to Job 41:34, Satan is described as:", options: ["The father of lies and the ruler of darkness", "A king over all the children of pride", "The prince of the power of the air", "The accuser of the brethren"] },
    { id: "a13", text: "The author teaches that humility must be practiced specifically:", options: ["In the sight of man so that others can see it", "In the sight of the Lord and not in the sight of man", "In the workplace so that colleagues respect you", "In the church so that the pastor notices it"] },
    { id: "a14", text: "According to 1 Peter 5:5, humility is described as:", options: ["A way of thinking and speaking humbly", "A spiritual cloak or covering that protects the believer", "A gift given only to ministers of the gospel", "A discipline that must be practiced daily"] },
    { id: "a15", text: "The author states that children are humble because they:", options: ["Are weak and have no strength of their own", "Are ignorant of the ways of the world", "Naturally possess the formula for humility that Jesus described", "Have been taught humility by their parents"] },
    { id: "a16", text: "The author argues that Proverbs 13:10, \"Only by pride cometh contention\", applies most directly to which common human relationship?", options: ["The relationship between employers and employees", "The relationship between politicians and citizens", "The relationship between husbands and wives in marriage", "The relationship between teachers and students"] },
    { id: "a17", text: "Queen Vashti was described as \"puffed up\" primarily because she:", options: ["Claimed to be more beautiful than the other women in the kingdom", "Refused to obey the king's command and appear before him", "Conspired against the king with the other princes", "Demanded to be made co-ruler of the kingdom"] },
    { id: "a18", text: "What was the specific consequence that God brought upon Nebuchadnezzar because of his pride?", options: ["He was killed by his own servants", "His kingdom was divided among his enemies", "He was driven from men and dwelt with beasts, eating grass for seven years", "He was blinded and imprisoned in the dungeon"] },
    { id: "a19", text: "The author argues that Belshazzar was puffed up most critically because:", options: ["He was younger and less experienced than his father", "He did not learn from his father Nebuchadnezzar's mistakes even though he knew about them", "He was influenced by evil advisers in his court", "He had too much wealth and became complacent"] },
    { id: "a20", text: "According to Psalm 138:6, what does the Lord do to the proud?", options: ["He destroys them immediately with His wrath", "He gives them over to their enemies", "He knows them from afar; they lose closeness and access to Him", "He removes their wealth and position"] }
  ],
  blanks: [
    { id: "b1", text: "The author states that pride is the reason for the _____ and the _____ in our world.", blanks: 2 },
    { id: "b2", text: "The scripture in Proverbs 13:10 states: \"Only by pride cometh _____ but with the well advised is _____.\"", blanks: 2 },
    { id: "b3", text: "The author teaches that Satan fell out of Heaven through his _____, _____ and pride.", blanks: 2 },
    { id: "b4", text: "According to the author, every one that is proud in heart is an _____ to the Lord.", blanks: 1 },
    { id: "b5", text: "The author teaches that when the earth opens up and swallows a person because of pride, it is an illustration of falling into the _____ never to rise again.", blanks: 1 },
    { id: "b6", text: "The author states that proud people are isolate in their _____ and have no one to enjoy their lives with, having fallen from joy and fellowship into loneliness.", blanks: 1 },
    { id: "b7", text: "According to the author, to fall because of pride is to have your heaven turned into _____ and your earth turned into _____.", blanks: 2 },
    { id: "b8", text: "Bishop Dag Heward-Mills states that Korah was a man of _____ among the congregation, and yet his pride led him to rise up against _____.", blanks: 2 },
    { id: "b9", text: "According to the author, Nebuchadnezzar's pride was most evident when he declared: 'is not this great Babylon that I have built... by the _____ of my power, and for the _____ of my majesty?'", blanks: 2 },
    { id: "b10", text: "According to 1 Peter 5:6, believers are instructed: 'Humble yourselves therefore under the mighty hand of God, that he may _____ you in _____ time.'", blanks: 2 },
    { id: "b11", text: "According to the Author, the four ministers he copied in his own ministry were Fred Price, _____ Cho, Benny Hinn, and Reinhard _____.", blanks: 2 },
    { id: "b12", text: "The author argues that children copy easily and that is why they are able to learn _____ quickly.", blanks: 1 }
  ],
  essays: [
    {
      id: "c1",
      title: "Pride as Satanic in Origin and Nature",
      prompt:
        "Dag Heward-Mills describes pride as \"the most deadly evil that afflicts the human race\" and argues that it is fundamentally satanic in origin and nature.\n\n(a) With reference to the book, discuss the author's argument that pride is essentially satanic and demonic in nature, tracing the origins of pride to Lucifer and explaining how this same spirit operates in human beings today, particularly in the context of ministry and church leadership. (10 marks)\n\n(b) The author uses the analogy of Adolf Hitler to explain how delusions, which are products of pride, take time to unravel. Critically analyze this analogy and explain what lesson the author draws from it for ministers of the gospel who follow rebellious and disloyal leaders. (10 marks)"
    },
    {
      id: "c2",
      title: "Seven Reasons to Humble Yourself",
      prompt:
        "In Chapter 1, the author provides seven reasons why every person should humble themselves before the Lord, drawing extensively from Scripture.\n\n(a) Identify and discuss any four of these seven reasons, explaining in each case the spiritual consequence of failing to humble oneself and the corresponding blessing that flows from humility. Support your answer with the scriptural references cited by the author. (12 marks)\n\n(b) The author makes a sharp distinction between humility in the sight of God and humility in the sight of man. What is the significance of this distinction, and why does the author argue that only God's definition of humility ultimately matters? (8 marks)"
    },
    {
      id: "c3",
      title: "Childlike and Servant Humility",
      prompt:
        "In Chapters 2 and 3, the author presents two practical and concrete formulas for humility, being humble like a child and being humble like a servant.\n\n(a) Drawing from the author's discussion of childlike humility, identify and explain any five characteristics of a humble child and discuss how the loss of each characteristic manifests as pride in adult life. Use specific examples from the book in your answer. (12 marks)\n\n(b) The author argues that the ability to copy others is one of the most important expressions of childlike humility, and that pride is what prevents people from copying good things from others. Do you agree with this position? Discuss, with reference to the author's personal examples from his own ministry. (8 marks)"
    },
    {
      id: "c4",
      title: "Biblical Figures Who Were Puffed Up",
      prompt:
        "The author dedicates several chapters to examining the lives of biblical figures who were \"puffed up\", Lucifer, Vashti, Nebuchadnezzar, Belshazzar, Rehoboam, Pharaoh, and Korah, drawing practical lessons from each for the modern reader.\n\n(a) Select any three of these biblical figures and, for each one, explain: (i) The specific manifestation of pride that characterized them; (ii) The consequences of their pride; and (iii) The lesson the author draws from their experience for believers today. (15 marks)\n\n(b) The author observes that Belshazzar failed to learn from the mistakes of his father Nebuchadnezzar. What does this reveal about the relationship between pride and the refusal to receive wisdom from those who have gone before us? How does this apply to the modern minister or leader? (5 marks)"
    },
    {
      id: "c5",
      title: "Proud Speaking and the Fall From Pride",
      prompt:
        "In Chapter 5, the author examines what he calls \"proud speaking\", identifying it as one of the most visible and diagnosable symptoms of pride, and in Chapter 6 discusses the significance of a \"proud look.\"\n\n(a) With reference to the book, explain what the author means by \"proud speaking.\" What are the various forms that proud speaking takes, and why does the author argue that the words a person speaks are one of the surest indicators of the presence of pride in their heart? Support your answer with at least three specific examples or categories of proud speech discussed in the book. (12 marks)\n\n(b) In Chapter 17, the author describes twelve different forms that a \"fall from pride\" can take. Drawing from at least four of these, discuss the author's contention that the consequences of pride are not merely spiritual but are manifested concretely in a person's relationships, position, and circumstances. (8 marks)"
    },
    {
      id: "c6",
      title: "Humble Yourself Means Do It Yourself",
      prompt:
        "The author argues throughout the book that humility is not passive or vague but is an active, deliberate, and personal responsibility, encapsulated in his central theme that \"humble yourself means do it yourself\" (Chapter 7).\n\n(a) What does the author mean when he says that humbling yourself is something you must do yourself? Why is self-humbling more beneficial and less painful than being humbled by external circumstances such as sickness, failure, or tragedy? Illustrate your answer with examples from the book. (10 marks)\n\n(b) In Chapter 8, the author discusses what it means to be a humble minister like Jesus Christ. Evaluate the author's description of Christ's humility and explain how the author argues that Jesus serves as the supreme model and standard for humility in ministry. What specific aspects of Christ's humility does the author identify as being most relevant to the modern minister? (10 marks)"
    }
  ]
};

// ─── State ────────────────────────────────────────────────────────────────────
// State
let startedAt = null;
let timerHandle = null;
const DRAFT_KEY = "pastoralSchoolThoseWhoAreProudDraft.v2";
let isRestoringDraft = false;

const currentPath = window.location.pathname;

// ====================== LOGIN PAGE ======================
if (currentPath.includes("index.html") || currentPath === "/" || currentPath === "") {
  const loginForm = document.getElementById("loginForm");
  const loginIndexNum = document.getElementById("loginIndexNumber");

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const studentId = loginIndexNum.value.trim();
    if (!studentId) return;

    const btn = loginForm.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Checking...";

    try {
      const res = await fetch(`/api/check-submitted?indexNumber=${encodeURIComponent(studentId)}`);
      const data = await res.json();
      if (data.submitted) {
        window.location.href = `/submitted.html?confirmationId=${encodeURIComponent(data.confirmationId || "N/A")}`;
        return;
      }
    } catch (err) {
      console.warn("Check failed");
    }

    localStorage.setItem("currentStudentId", studentId);
    window.location.href = "/exam.html";
  });
}

// ====================== EXAM PAGE ======================
if (currentPath.includes("exam.html")) {
  const form = document.getElementById("examForm");
  const statusMessage = document.getElementById("statusMessage");
  const mcqList = document.getElementById("mcqList");
  const blankList = document.getElementById("blankList");
  const essayList = document.getElementById("essayList");

  // Set student ID
  const savedId = localStorage.getItem("currentStudentId");
  if (savedId) {
    const idxInput = form.querySelector('input[name="indexNumber"]');
    if (idxInput) idxInput.value = savedId;
  }

  document.querySelector('input[name="date"]').valueAsDate = new Date();

  function optionLetter(i) { return String.fromCharCode(65 + i); }

  function renderMcq() {
    mcqList.innerHTML = exam.mcq.map((q, i) => `
      <fieldset class="question-card">
        <legend>${i+1}. ${q.text}</legend>
        ${q.options.map((opt, oi) => `
          <label class="option">
            <input type="radio" name="${q.id}" value="${optionLetter(oi)}" />
            <span>${optionLetter(oi)}. ${opt}</span>
          </label>`).join("")}
      </fieldset>`).join("");
  }

  function renderBlanks() {
    blankList.innerHTML = exam.blanks.map((q, i) => `
      <div class="question-card">
        <p class="question-title">${i+1}. ${q.text}</p>
        <div class="blank-inputs">
          ${Array.from({length: q.blanks}, (_, bi) => {
            const label = q.blanks === 1 ? "Answer" : `Blank ${bi+1}`;
            return `<label>${label}<input name="${q.id}_${bi+1}" /></label>`;
          }).join("")}
        </div>
      </div>`).join("");
  }

  function renderEssays() {
    essayList.innerHTML = exam.essays.map((q, i) => `
      <div class="question-card">
        <label class="essay-toggle">
          <input type="checkbox" class="essay-select" value="${q.id}" />
          <span>Answer Question ${i+1}: ${q.title}</span>
        </label>
        <p>${q.prompt.replace(/\n/g, "<br />")}</p>
        <textarea name="${q.id}" disabled placeholder="Select this essay question to enable the text area."></textarea>
      </div>`).join("");
  }

  function setActiveSection(id) {
    document.querySelectorAll(".section").forEach(s => s.classList.toggle("active", s.id === id));
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.target === id));
    if (id === "review") updateSummary();
    saveDraft();
  }

  function getSelectedEssays() {
    return [...document.querySelectorAll(".essay-select:checked")].map(cb => cb.value);
  }

  function updateEssayControls() {
    const selected = getSelectedEssays();
    document.querySelectorAll(".essay-select").forEach(cb => {
      const ta = document.querySelector(`textarea[name="${cb.value}"]`);
      ta.disabled = !cb.checked;
      if (!cb.checked) ta.value = "";
      cb.disabled = !cb.checked && selected.length >= 4;
    });
    updateSummary();
  }

  function collectPayload() {
    const data = new FormData(form);
    const answers = {};
    exam.mcq.forEach(q => answers[q.id] = data.get(q.id) || "");

    const fillBlanks = {};
    exam.blanks.forEach(q => {
      fillBlanks[q.id] = Array.from({length: q.blanks}, (_, i) => 
        String(data.get(`${q.id}_${i+1}`) || "").trim()
      );
    });

    const essays = getSelectedEssays().map(id => {
      const q = exam.essays.find(item => item.id === id);
      return { id, title: q.title, prompt: q.prompt, answer: String(data.get(id) || "").trim() };
    });

    return {
      student: {
        indexNumber: String(data.get("indexNumber") || "").trim(),
        date: String(data.get("date") || "").trim()
      },
      answers,
      fillBlanks,
      essays,
      elapsedSeconds: startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0
    };
  }

  function saveDraft() {
    if (isRestoringDraft) return;
    const payload = collectPayload();
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      ...payload,
      startedAt,
      activeSection: document.querySelector(".section.active")?.id || "sectionA"
    }));
  }

  function restoreDraft() {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return false;
    let draft;
    try { draft = JSON.parse(raw); } catch { localStorage.removeItem(DRAFT_KEY); return false; }

    isRestoringDraft = true;

    const indexInput = form.querySelector('input[name="indexNumber"]');
    if (indexInput) indexInput.value = draft.student?.indexNumber || "";

    Object.entries(draft.answers || {}).forEach(([qId, val]) => {
      const radio = form.querySelector(`input[name="${qId}"][value="${val}"]`);
      if (radio) radio.checked = true;
    });

    Object.entries(draft.fillBlanks || {}).forEach(([qId, vals]) => {
      vals.forEach((v, i) => {
        const input = form.elements[`${qId}_${i+1}`];
        if (input) input.value = v;
      });
    });

    (draft.essays || []).forEach(essay => {
      const cb = form.querySelector(`.essay-select[value="${essay.id}"]`);
      const ta = form.elements[essay.id];
      if (cb) cb.checked = true;
      if (ta) ta.value = essay.answer || "";
    });

    startedAt = Number(draft.startedAt) || Date.now();
    updateEssayControls();
    setActiveSection(draft.activeSection || "sectionA");
    isRestoringDraft = false;
    return true;
  }

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
  }

  function startTimer() {
    if (timerHandle) clearInterval(timerHandle);
    tickTimer();
    timerHandle = setInterval(tickTimer, 1000);
  }

  function tickTimer() {
    if (!startedAt) return;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const remaining = Math.max(0, exam.durationSeconds - elapsed);
    const timerEl = document.getElementById("timer");
    if (timerEl) timerEl.textContent = formatTime(remaining);
  }

  function updateSummary() {
    const p = collectPayload();
    const mcq = Object.values(p.answers).filter(Boolean).length;
    const blanks = Object.values(p.fillBlanks).flat().filter(Boolean).length;
    const essays = p.essays.length;
    const words = p.essays.reduce((sum, e) => sum + (e.answer.split(/\s+/).filter(Boolean).length), 0);

    const summary = document.getElementById("progressSummary");
    if (summary) {
      summary.innerHTML = `
        <div class="summary-item"><span>Section A</span><strong>${mcq}/20</strong></div>
        <div class="summary-item"><span>Section B</span><strong>${blanks}/20</strong></div>
        <div class="summary-item"><span>Section C</span><strong>${essays}/4</strong></div>
        <div class="summary-item"><span>Words</span><strong>${words}</strong></div>
      `;
    }
  }

  // Submit Handler - FIXED
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusMessage.textContent = "";
    statusMessage.classList.remove("error");

    const payload = collectPayload();

    if (payload.essays.length !== 4 || payload.essays.some(e => !e.answer.trim())) {
      statusMessage.textContent = "Please select and answer exactly 4 essays.";
      statusMessage.classList.add("error");
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Submitting…";

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Submission failed");

      // Success - redirect to submitted page
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem("currentStudentId");
      window.location.href = `/submitted.html?confirmationId=${result.id}`;

    } catch (error) {
      statusMessage.textContent = error.message || "Submission failed. Please try again.";
      statusMessage.classList.add("error");
      btn.disabled = false;
      btn.textContent = "Submit Exam";
    }
  });

  // Initialize
  renderMcq();
  renderBlanks();
  renderEssays();
  updateEssayControls();
  updateSummary();
  document.getElementById("timer").textContent = formatTime(exam.durationSeconds);

  if (!restoreDraft()) {
    startedAt = Date.now();
    startTimer();
  } else {
    startTimer();
  }
}

// ====================== SUBMITTED PAGE ======================
if (currentPath.includes("submitted.html")) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("confirmationId");
  const el = document.getElementById("submittedConfirmId");
  if (el && id) el.textContent = `Confirmation ID: ${id}`;
}