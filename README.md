# GyanBuddy Combined Frontend

React + Vite frontend for Principal, Teacher, and Parent dashboards.

## Prerequisites

- Node.js `20.19+` (Vite 7 requirement)
- npm `10+`

## Environment

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Set backend URL in `.env.local`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Notes:
- `.env.local` is local-only and should not be committed.
- Use `.env.example` as the shared template.

## Install

```bash
npm install
```

## Run (Development)

```bash
npm run dev
```

Frontend runs at:
- `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## Parent Dashboard Routes

- `/` Parent Dashboard
- `/reports` Detailed Reports
- `/test-scores` Test Results Summary
- `/test-scores/:testId` Individual Test Report
- `/help` Help

## Project Notes

- Data is API-driven from backend endpoints (no mock data for parent pages).
- Parent login uses student account backend auth with parent portal mode on frontend.

## Git Hygiene

Ignored files include:
- `dist/`
- `node_modules/`
- `.env.local`
- local Vite cache

If these were ever tracked, untrack with:

```bash
git rm -r --cached dist node_modules/.vite .env.local
```
