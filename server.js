const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const AdmZip = require("adm-zip");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = "admin-token-123";

const SUBMISSIONS_FILE = path.join(__dirname, "data", "submissions.jsonl");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function ensureStorage() {
  fs.mkdirSync(path.dirname(SUBMISSIONS_FILE), { recursive: true });
  if (!fs.existsSync(SUBMISSIONS_FILE)) fs.writeFileSync(SUBMISSIONS_FILE, "");
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

// ====================== ADMIN AUTH ======================
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

// ====================== CHECK SUBMITTED ======================
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

// ====================== STUDENT SUBMISSION ======================
app.post("/api/submissions", (req, res) => {
  const body = req.body || {};
  const indexNumber = String(body.student?.indexNumber || "").trim();

  if (!indexNumber) return res.status(400).json({ error: "Missing student indexNumber" });

  if (!Array.isArray(body.essays) || body.essays.length !== 4) {
    return res.status(400).json({ error: "Exactly four essay answers required." });
  }

  const submissions = readSubmissions();
  if (submissions.some(s => s.student.indexNumber.toLowerCase() === indexNumber.toLowerCase())) {
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

  fs.appendFileSync(SUBMISSIONS_FILE, JSON.stringify(record) + "\n");
  res.status(201).json({ id: record.id });
});

app.get("/api/submissions", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  res.json(readSubmissions());
});

// ====================== DOWNLOADS ======================
app.get("/api/submissions/:id/txt", (req, res) => {
  if (!isAdmin(req)) return res.status(401).send("Unauthorized");

  const { id } = req.params;
  const submissions = readSubmissions();
  const sub = submissions.find(s => s.id === id);
  if (!sub) return res.status(404).send("Not found");

  let txt = `PASTORAL SCHOOL EXAM SUBMISSION\n`;
  txt += `ID: ${sub.id}\n`;
  txt += `Student ID: ${sub.student.indexNumber}\n`;
  txt += `Submitted: ${new Date(sub.submittedAt).toLocaleString()}\n\n`;

  txt += "=== SECTION A - MULTIPLE CHOICE ===\n";
  txt += Object.entries(sub.answers || {}).map(([q, a]) => `${q}: ${a || "Not answered"}`).join("\n") + "\n\n";

  txt += "=== SECTION B - FILL IN THE BLANKS ===\n";
  txt += Object.entries(sub.fillBlanks || {}).map(([q, vals]) => 
    `${q}: ${vals.map(v => v || "—").join(" | ")}`
  ).join("\n") + "\n\n";

  txt += "=== SECTION C - ESSAYS ===\n";
  (sub.essays || []).forEach((essay, i) => {
    txt += `\nEssay ${i+1}: ${essay.title}\n`;
    txt += (essay.answer || "") + "\n\n";
  });

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", `attachment; filename="submission-${sub.student.indexNumber}.txt"`);
  res.send(txt);
});

app.get("/api/submissions/all.zip", (req, res) => {
  if (!isAdmin(req)) return res.status(401).send("Unauthorized");

  const submissions = readSubmissions();
  const zip = new AdmZip();

  submissions.forEach(sub => {
    let txt = `PASTORAL SCHOOL EXAM SUBMISSION\n`;
    txt += `Student ID: ${sub.student.indexNumber}\n`;
    txt += `Submitted: ${sub.submittedAt}\n\n`;
    txt += "=== SECTION A ===\n" + JSON.stringify(sub.answers, null, 2) + "\n\n";
    txt += "=== SECTION B ===\n" + JSON.stringify(sub.fillBlanks, null, 2) + "\n\n";
    txt += "=== SECTION C ===\n" + JSON.stringify(sub.essays, null, 2);

    zip.addFile(`submission-${sub.student.indexNumber}.txt`, Buffer.from(txt, "utf8"));
  });

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="all-submissions.zip"');
  res.send(zip.toBuffer());
});

app.listen(PORT, () => {
  ensureStorage();
  console.log(`✅ Pastoral Exam Server running on port ${PORT}`);
});