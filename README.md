# IELTS Web App – MS CARA IELTS

A full-featured IELTS testing platform built with **Next.js**, allowing students to take Reading, Listening, and Writing tests with automatic scoring, timed submissions, and downloadable PDF results.

## ✨ Features

- Auto-timer & auto-submit after 60 minutes
- Student info (name, datetime) required for submission
- PDF export for each skill (Reading, Listening, Writing)
- Band score calculation (Reading & Listening)
- Supabase integration for test content and storage
- Mobile-friendly, responsive UI

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
2. Run locally
bash
npm run dev
Then open: http://localhost:3000

3. Environment Variables
Create a .env.local file with:

ini
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
📦 Deployment
Deployed using Vercel. Just connect your GitHub repo and set environment variables.

Feel free to improve and customize it!

yaml
---

### ✅ What to do next:
1. Replace your `README.md` content with the text above.
2. Run in terminal:
```bash
git add README.md
git commit -m "Clean and simple README"
git push -u origin main