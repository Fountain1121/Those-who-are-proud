const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PIN = process.env.ADMIN_PIN || "change-me";
const SUBMISSIONS_FILE =
  process.env.SUBMISSIONS_FILE || path.join(__dirname, "data", "submissions.jsonl");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function ensureStorage() {
  fs.mkdirSync(path.dirname(SUBMISSIONS_FILE), { recursive: true });
  if (!fs.existsSync(SUBMISSIONS_FILE)) fs.writeFileSync(SUBMISSIONS_FILE, "");
}

function readSubmissions() {
  ensureStorage();
  return fs
    .readFileSync(SUBMISSIONS_FILE, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function isAdmin(req) {
  const pin = req.headers["x-admin-pin"] || req.query.pin;
  return ADMIN_PIN !== "change-me" && pin === ADMIN_PIN;
}

app.post("/api/submissions", (req, res) => {
  const body = req.body || {};
  const requiredStudentFields = ["indexNumber", "fullName"];
  const missing = requiredStudentFields.filter((field) => !String(body.student?.[field] || "").trim());

  if (missing.length) {
    return res.status(400).json({ error: `Missing student field: ${missing.join(", ")}` });
  }

  if (!Array.isArray(body.essays) || body.essays.length !== 4) {
    return res.status(400).json({ error: "Exactly four essay answers must be submitted." });
  }

  const record = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    student: {
      fullName: String(body.student.fullName).trim(),
      indexNumber: String(body.student.indexNumber).trim(),
      date: String(body.student.date || "").trim()
    },
    answers: body.answers || {},
    fillBlanks: body.fillBlanks || {},
    essays: body.essays,
    elapsedSeconds: Number(body.elapsedSeconds || 0)
  };

  ensureStorage();
  fs.appendFileSync(SUBMISSIONS_FILE, `${JSON.stringify(record)}\n`);
  res.status(201).json({ id: record.id, submittedAt: record.submittedAt });
});

app.get("/api/submissions", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Invalid admin PIN." });
  res.json(readSubmissions());
});

app.get("/api/submissions.csv", (req, res) => {
  if (!isAdmin(req)) return res.status(401).send("Invalid admin PIN.");
  const rows = readSubmissions();
  const headers = ["id", "submittedAt", "fullName", "indexNumber", "date", "elapsedSeconds"];
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.submittedAt,
        row.student.fullName,
        row.student.indexNumber,
        row.student.date,
        row.elapsedSeconds
      ]
        .map(escape)
        .join(",")
    )
  ].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=\"pastoral-exam-submissions.csv\"");
  res.send(csv);
});

app.listen(PORT, () => {
  ensureStorage();
  console.log(`Pastoral exam site running on port ${PORT}`);
});
