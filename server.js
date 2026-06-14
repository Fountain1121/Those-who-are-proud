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

// ====================== SUBMISSIONS ======================
app.post("/api/submissions", (req, res) => { /* same as before */ });

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
  txt += `Submitted: ${new Date(sub.submittedAt).toLocaleString()}\n`;
  txt += `Time Taken: ${sub.elapsedSeconds ? Math.floor(sub.elapsedSeconds/60) + " minutes" : "N/A"}\n\n`;

  txt += "=== SECTION A - MULTIPLE CHOICE ===\n";
  txt += Object.entries(sub.answers || {}).map(([q, a]) => `${q}: ${a || "Not answered"}`).join("\n") + "\n\n";

  txt += "=== SECTION B - FILL IN THE BLANKS ===\n";
  txt += Object.entries(sub.fillBlanks || {}).map(([q, vals]) => 
    `${q}: ${vals.map(v => v || "—").join(" | ")}`
  ).join("\n") + "\n\n";

  txt += "=== SECTION C - ESSAYS ===\n";
  (sub.essays || []).forEach((essay, i) => {
    txt += `\nEssay ${i+1}: ${essay.title}\n`;
    txt += essay.answer + "\n\n";
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
    txt += `ID: ${sub.id}\nStudent: ${sub.student.indexNumber}\nSubmitted: ${sub.submittedAt}\n\n`;

    txt += "=== SECTION A ===\n" + JSON.stringify(sub.answers, null, 2) + "\n\n";
    txt += "=== SECTION B ===\n" + JSON.stringify(sub.fillBlanks, null, 2) + "\n\n";
    txt += "=== SECTION C ===\n" + JSON.stringify(sub.essays, null, 2);

    zip.addFile(`submission-${sub.student.indexNumber}.txt`, Buffer.from(txt, "utf8"));
  });

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="all-exam-submissions.zip"');
  res.send(zip.toBuffer());
});

app.listen(PORT, () => {
  ensureStorage();
  console.log(`✅ Server running on port ${PORT}`);
});