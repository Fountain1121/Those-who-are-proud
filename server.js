const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const SUBMISSIONS_FILE =
  process.env.SUBMISSIONS_FILE ||
  path.join(__dirname, "data", "submissions.jsonl");

// ---------- Middleware ----------
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

// ---------- Storage ----------
function ensureStorage() {
  fs.mkdirSync(path.dirname(SUBMISSIONS_FILE), { recursive: true });
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, "");
  }
}

function readSubmissions() {
  ensureStorage();
  return fs
    .readFileSync(SUBMISSIONS_FILE, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

// ---------- AUTH ----------
function isAuthenticated(req) {
  return req.session && req.session.isAdmin;
}

// ---------- LOGIN ----------
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// ---------- PROTECTED API ----------
app.get("/api/submissions", (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(readSubmissions());
});

// ---------- SUBMIT ----------
app.post("/api/submissions", (req, res) => {
  const body = req.body || {};

  if (!body.student?.fullName || !body.student?.indexNumber) {
    return res.status(400).json({ error: "Missing student info" });
  }

  const record = {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    student: body.student,
    answers: body.answers || {},
    essays: body.essays || [],
    elapsedSeconds: Number(body.elapsedSeconds || 0)
  };

  ensureStorage();
  fs.appendFileSync(SUBMISSIONS_FILE, JSON.stringify(record) + "\n");

  res.json({ success: true });
});

// ---------- START ----------
ensureStorage();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});