# AI Career Mentor Platform

A full-stack AI-powered career planning platform that helps users create personalized learning roadmaps, chat with an AI mentor, match job roles, build resumes, plan daily tasks, and analyze skill gaps.

It combines:
- a React + Vite frontend
- a Flask API backend
- session-based authentication
- AI-generated insights through an OpenAI-compatible endpoint such as Ollama

## Features

### Core
- Personalized roadmap generation based on:
  - primary goal
  - current skills
  - hours available per week
  - target date
- AI-generated skill suggestions from the primary goal
- AI-powered success score prediction with reasoning, risk factors, and improvement suggestions
- Login and signup flow with session auth
- Saved roadmap history per user

### AI Mentor Chat
- Context-aware career advisor chat interface
- Quick actions: "What should I do today?", "Am I on track?"
- Collapsible context panel for goal, skills, hours, deadline, progress
- Typing indicator and chat bubble UI

### Job Role Matcher
- Suggests 3-5 realistic job roles based on goal and skills
- Shows readiness percentage with visual gauge ring per role
- Lists missing skills and improvement suggestions

### ATS Resume Builder
- Generates professional, ATS-friendly resume in markdown
- Live preview with rendered markdown
- Copy to clipboard, download as markdown, print/PDF

### Daily Planner
- Generates a 7-day actionable study plan
- Each day includes learning topic, practice task, and expected outcome
- Regenerate button for fresh plans

### Skill Gap Analyzer
- Compares user skills with industry requirements
- Categorizes gaps into critical (must-have) and optional (nice-to-have)
- Priority-ordered ranking with visual progress bars

### Roadmap Actions
- Export, regenerate, share, print, and save as PDF

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Framer Motion
- React Router
- React Markdown
- Lucide React
- Tailwind CSS tooling

### Backend
- Flask
- Flask-CORS
- SQLAlchemy
- PostgreSQL via `psycopg2-binary`

### AI
- OpenAI Python SDK
- Ollama or any OpenAI-compatible chat endpoint

## Project Structure

```text
.
├── backend
│   ├── app.py
│   ├── config.py
│   ├── migrate.py
│   ├── models
│   │   └── db.py
│   ├── routes
│   │   ├── auth.py
│   │   ├── mentor.py
│   │   └── roadmap.py
│   └── services
│       ├── predictor.py
│       └── roadmap_generator.py
├── frontend
│   ├── src
│   │   ├── App.tsx
│   │   ├── components
│   │   │   ├── auth/
│   │   │   ├── layout/
│   │   │   ├── roadmap/
│   │   │   └── ui/
│   │   ├── context/
│   │   ├── pages
│   │   │   ├── RoadmapPage.tsx
│   │   │   ├── MentorPage.tsx
│   │   │   ├── JobMatchPage.tsx
│   │   │   ├── ResumePage.tsx
│   │   │   ├── DailyPlanPage.tsx
│   │   │   ├── SkillGapPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   └── services/
│   └── package.json
└── README.md
```

## Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL
- Ollama running locally, or another compatible model endpoint

## Backend Setup

1. Move into the backend folder:

```bash
cd backend
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
.\venv\Scripts\activate
```

On macOS/Linux:

```bash
python -m venv venv
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `backend/.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/ai_roadmap
SECRET_KEY=your_secure_secret_key
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_API_KEY=ollama
OLLAMA_MODEL=llama3
```

5. Run the migration/setup script:

```bash
python migrate.py
```

6. Start the backend server:

```bash
python app.py
```

The API runs on:

```text
http://localhost:5000
```

## Frontend Setup

1. Move into the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm run dev
```

The frontend usually runs on:

```text
http://localhost:5173
```

## Environment Notes

- The frontend reads the backend base URL from `VITE_API_BASE_URL`.
- CORS is configured for common local Vite origins:
  - `http://localhost:5173`
  - `http://localhost:5174`
  - `http://127.0.0.1:5173`
  - `http://127.0.0.1:5174`
- Authentication uses Flask sessions with credentials included in frontend requests.

## Vercel Deployment

Deploy `frontend/` and `backend/` as two separate Vercel projects.

### Backend project

Set the Vercel root directory to `backend` and add these environment variables:

```env
DATABASE_URL=your-production-postgres-url
SECRET_KEY=your-long-random-secret
CORS_ORIGINS=https://your-frontend-domain.vercel.app
OLLAMA_BASE_URL=your-openai-compatible-base-url
OLLAMA_API_KEY=your-api-key
OLLAMA_MODEL=your-model-name
```

Notes:
- `backend/vercel.json` routes all requests to the Flask app.
- Sessions use signed cookies, which works in Vercel's serverless runtime.
- If you later add a custom frontend domain, include it in `CORS_ORIGINS`.

### Frontend project

Set the Vercel root directory to `frontend` and add:

```env
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
```

Notes:
- `frontend/vercel.json` rewrites SPA routes to `index.html` for React Router.
- After deploying the backend, copy its production URL into `VITE_API_BASE_URL` and redeploy the frontend.

## Main API Routes

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Roadmaps
- `POST /api/roadmap/generate`
- `POST /api/roadmap/suggest-skills`
- `GET /api/roadmap/history`

### Mentor / Career Tools
- `POST /api/mentor/chat` — AI mentor conversation
- `POST /api/mentor/job-match` — Job role matching
- `POST /api/mentor/resume` — ATS resume generation
- `POST /api/mentor/daily-plan` — 7-day study plan
- `POST /api/mentor/skill-gap` — Skill gap analysis

## Usage Flow

1. Sign up or log in.
2. Open the Roadmap page.
3. Enter a primary goal.
4. Optionally use `Generate from Goal` to auto-fill skills.
5. Add hours per week and a target date.
6. Generate the roadmap.
7. Review:
   - success score with AI reasoning
   - risk factors and improvement suggestions
   - timeline and roadmap summary
   - detailed markdown plan
8. Export, regenerate, share, print, or save as PDF.
9. Use the AI Mentor to ask career questions and get daily tasks.
10. Match your skills to real job roles.
11. Build an ATS-friendly resume.
12. Generate a 7-day study plan.
13. Analyze your skill gaps against industry requirements.
14. Revisit saved roadmaps from the History page.

## Build Commands

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

### Backend

```bash
python app.py
```

## Known Notes

- `Download PDF` currently uses the browser print dialog, which lets users save the roadmap as a PDF.
- AI responses depend on the configured local or remote model endpoint.
- If you add new backend routes, restart the Flask server so preflight/API changes are picked up.
- The AI Mentor chat is ephemeral (messages reset on page refresh).
- Run `python migrate.py` after pulling changes to apply any new database columns.

## Contributing

Contributions are welcome. Improvements to roadmap quality, UI polish, validation, and export behavior are all good candidates.
