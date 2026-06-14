const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = "admin-token-123"; // Simple static token for demo
const SUBMISSIONS_FILE = process.env.SUBMISSIONS_FILE || path.join(__dirname, "data", "submissions.jsonl");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function ensureStorage() {
  fs.mkdirSync(path.dirname(SUBMISSIONS_FILE), { recursive: true });
  if (!fs.existsSync(SUBMISSIONS_FILE)) fs.writeFileSync(SUBMISSIONS_FILE, "");
}

function readSubmissions() {
  ensureStorage();
  const lines = fs.readFileSync(SUBMISSIONS_FILE, "utf8").split(/\r?\n/).filter(Boolean);
  return lines.map(line => JSON.parse(line));
}

function isAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  return token === ADMIN_TOKEN;
}

// Admin Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    return res.json({ success: true, token: ADMIN_TOKEN });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

// Verify token
app.get("/api/admin/verify", (req, res) => {
  if (isAdmin(req)) return res.json({ valid: true });
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
    return res.status(400).json({ error: "Exactly four essay answers required." });
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

// Get all submissions (admin)
app.get("/api/submissions", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  res.json(readSubmissions());
});

// Download single submission (admin)
app.get("/api/submissions/:id/download", (req, res) => {
  if (!isAdmin(req)) return res.status(401).send("Unauthorized");
  const { id } = req.params;
  const submissions = readSubmissions();
  const sub = submissions.find(s => s.id === id);
  if (!sub) return res.status(404).send("Not found");

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="submission-${sub.student.indexNumber}.json"`);
  res.send(JSON.stringify(sub, null, 2));
});

// CSV export
app.get("/api/submissions.csv", (req, res) => {
  if (!isAdmin(req)) return res.status(401).send("Unauthorized");
  const rows = readSubmissions();
  const headers = ["id", "submittedAt", "indexNumber", "date", "elapsedSeconds", "mcqAnswered", "blanksAnswered", "essaysAnswered"];

 