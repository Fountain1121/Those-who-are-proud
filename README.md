# Pastoral School Exam Site

Render-ready web app for the **Pastoral School Examination: Those Who Are Proud**.

## What It Includes

- Student details form
- 2 hour, 30 minute countdown timer
- Section A: 20 multiple-choice questions
- Section B: 12 fill-in questions with 20 total blanks
- Section C: 6 essay questions, with exactly 4 required
- Submission backend
- Admin page for viewing submissions
- CSV download for submission records

## Local Setup

```bash
npm install
npm start
```

Open `http://localhost:3000`.

The admin page is at `http://localhost:3000/admin.html`.

## Render Deployment

This folder includes `render.yaml`, so the easiest deployment path is:

1. Push this folder to a GitHub repository.
2. In Render, choose **New +** then **Blueprint**.
3. Select the repository.
4. Render will create the web service, generate `ADMIN_PIN`, and mount a persistent disk at `/var/data`.

If creating the service manually, use:

- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `ADMIN_PIN` set to a private PIN
- Environment variable: `SUBMISSIONS_FILE` set to `/var/data/submissions.jsonl`
- Add a persistent disk mounted at `/var/data`

## Admin Access

Visit `/admin.html` and enter the `ADMIN_PIN` from Render. Use **Load** to view submissions or **Download CSV** to export the submission list.

Full answers are stored in JSON lines format at the configured `SUBMISSIONS_FILE`.
