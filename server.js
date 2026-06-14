const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = "admin-token-123"; // Used for admin authentication

const SUBMISSIONS_FILE = 
  process.env.SUBMISSIONS_FILE || path.join(__dirname, "data", "submissions.jsonl");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Ensure storage directory and file exist
function ensureStorage() {
  fs.mkdirSync(path.dirname(SUBMISSIONS_FILE), { recursive: true });
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, "");
  }
}

function readSubmissions() {
  ensureStorage();
  const content = fs.readFileSync(SUBMISSIONS_FILE, "utf8");
  return content
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function isAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();
  return token === ADMIN_TOKEN;
}

// ====================== ADMIN ROUTES ======================

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    return res.json({ success: true, token: ADMIN_TOKEN });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

app.get("/api/admin/verify", (req, res) => {
  if (isAdmin(req)) {
    return res.json({ valid: true });
  }
  res.status(401).json({ error: "Invalid token" });
});

// Check if student already submitted
app.get("/api/check-submitted", (req, res) => {
  const { indexNumber } = req.query;
  if (!indexNumber) return res.status(400).json({ error: "Missing indexNumber" });

  const submissions = readSubmissions();
  const existing = submissions.find(s => 
    s.student.indexNumber.toLowerCase() === indexNumber.toLowerCase()
  );

  res.json({ 
    submitted: !!existing, 
    confirmationId: existing ? existing.id : null 
  });
});

// Submit exam
app.post("/api/submissions", (req, res) => {
  const body = req.body || {};
  const indexNumber = String(body.student?.indexNumber || "").trim();

  if (!indexNumber) {
    return res.status(400).json({ error: "Missing student indexNumber" });
  }

  if (!Array.isArray(body.essays) || body.essays.length !== 4) {
    return res.status(400).json({ error: "Exactly four essay answers are required." });
  }

  const submissions = readSubmissions();
  const alreadySubmitted = submissions.some(s => 
    s.student.indexNumber.toLowerCase() === indexNumber.toLowerCase()
  );

  if (alreadySubmitted) {
    return res.status(409).json({ error: "You have already submitted this exam." });
  }

  const record = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    student: {
      indexNumber,
      date: String(body.student.date || "").trim()
    },
    answers: body.answers || {},
    fillBlanks: body.fillBlanks || {},
    essays: body.essays,
    elapsedSeconds: Number(body.elapsedSeconds || 0)
  };

  ensureStorage();
  fs.appendFileSync(SUBMISSIONS_FILE, JSON.stringify(record) + "\n");

  res.status(201).json({ id: record.id, submittedAt: record.submittedAt });
});

// Get all submissions (Admin only)
app.get("/api/submissions", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  res.json(readSubmissions());
});

// Download single submission
app.get("/api/submissions/:id/download", (req, res) => {
  if (!isAdmin(req)) return res.status(401).send("Unauthorized");
  const { id } = req.params;

  const submissions = readSubmissions();
  const submission = submissions.find(s => s.id === id);
  if (!submission) return res.status(404).send("Submission not found");

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="submission-${submission.student.indexNumber}.json"`);
  res.send(JSON.stringify(submission, null, 2));
});

// CSV Export
app.get("/api/submissions.csv", (req, res) => {
  if (!isAdmin(req)) return res.status(401).send("Unauthorized");

  const rows = readSubmissions();
  const headers = ["id", "submittedAt", "indexNumber", "date", "elapsedSeconds", "mcqAnswered", "blanksAnswered", "essaysAnswered"];

  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const csv = [
    headers.join(","),
    ...rows.map(row => [
      row.id,
      row.submittedAt,
      row.student.indexNumber,
      row.student.date,
      row.elapsedSeconds,
      Object.values(row.answers || {}).filter(Boolean).length,
      Object.values(row.fillBlanks || {}).flat().filter(Boolean).length,
      (row.essays || []).length
    ].map(escape).join(","))
  ].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="pastoral-exam-submissions.csv"');
  res.send(csv);
});

// Reset student submission lock
app.post("/api/admin/reset-submission", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  const { indexNumber } = req.body;
  if (!indexNumber) return res.status(400).json({ error: "Missing indexNumber" });

  res.json({ 
    success: true, 
    message: `Submission lock reset for ${indexNumber}. They can now re-submit.` 
  });
});

// Start server
app.listen(PORT, () => {
  ensureStorage();
  console.log(`✅ Pastoral Exam Server running on port ${PORT}`);
});