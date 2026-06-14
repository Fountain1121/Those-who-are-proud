const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const AdmZip = require("adm-zip");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = "admin-token-123";

const SUBMISSIONS_FILE = path.join(__dirname, "data", "submissions.jsonl");
const ALLOWED_IDS_FILE = path.join(__dirname, "data", "allowed-students.txt");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function ensureStorage() {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
  if (!fs.existsSync(SUBMISSIONS_FILE)) fs.writeFileSync(SUBMISSIONS_FILE, "");
  if (!fs.existsSync(ALLOWED_IDS_FILE)) {
    fs.writeFileSync(ALLOWED_IDS_FILE, "PS-2025-001\nPS-2025-002\n");
  }
}

function getAllowedStudentIds() {
  try {
    return fs.readFileSync(ALLOWED_IDS_FILE, "utf8")
      .split(/\r?\n/)
      .map(line => line.trim().toUpperCase())
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

function readSubmissions() {
  ensureStorage();
  const content = fs.readFileSync(SUBMISSIONS_FILE, "utf8");
  return content.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
}

function isAdmin(req) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "").trim();
  return token === ADMIN_TOKEN;
}

// ====================== AUTH ======================
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    return res.json({ success: true, token: ADMIN_TOKEN });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

app.get("/api/admin/verify", (req, res) => {
  if (isAdmin(req)) return res.json({ valid: true });
  res.status(401).json({ error: "Invalid token" });
});

// ====================== CHECK + SUBMIT ======================
app.get("/api/check-submitted", (req, res) => {
  const { indexNumber } = req.query;
  if (!indexNumber) return res.status(400).json({ error: "Missing indexNumber" });

  const allowed = getAllowedStudentIds();
  if (!allowed.includes(indexNumber.toUpperCase())) {
    return res.status(403).json({ error: "Invalid or unauthorized Student ID" });
  }

  const submissions = readSubmissions();
  const existing = submissions.find(s => 
    s.student.indexNumber.toUpperCase() === indexNumber.toUpperCase()
  );

  res.json({ 
    submitted: !!existing, 
    confirmationId: existing ? existing.id : null 
  });
});

app.post("/api/submissions", (req, res) => {
  const body = req.body || {};
  let indexNumber = String(body.student?.indexNumber || "").trim().toUpperCase();

  if (!indexNumber) return res.status(400).json({ error: "Missing student indexNumber" });

  const allowed = getAllowedStudentIds();
  if (!allowed.includes(indexNumber)) {
    return res.status(403).json({ error: "This Student ID is not authorized to take the exam." });
  }

  if (!Array.isArray(body.essays) || body.essays.length !== 4) {
    return res.status(400).json({ error: "Exactly four essay answers required." });
  }

  const submissions = readSubmissions();
  if (submissions.some(s => s.student.indexNumber.toUpperCase() === indexNumber)) {
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

  res.status(201).json({ id: record.id });
});

// Keep your existing admin download routes (TXT + ZIP) from previous version

app.listen(PORT, () => {
  ensureStorage();
  console.log(`✅ Server running on port ${PORT}`);
});