# AI Roadmap Generator

AI Roadmap Generator is a full-stack career planning app that helps users create personalized learning roadmaps, estimate success likelihood, and save roadmap history in a secure workspace.

It combines:
- a React + Vite frontend
- a Flask API backend
- session-based authentication
- AI-generated roadmap and skill suggestions through an OpenAI-compatible endpoint such as Ollama

## Features

- Personalized roadmap generation based on:
  - primary goal
  - current skills
  - hours available per week
  - target date
- AI-generated skill suggestions from the primary goal
- Success score prediction based on skill/time inputs
- Login and signup flow with session auth
- Saved roadmap history per user
- Roadmap actions:
  - export
  - regenerate
  - share
  - print / save as PDF
- Responsive UI with animated transitions and a modern dashboard layout

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
│   ├── routes
│   └── services
├── frontend
│   ├── src
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

## Usage Flow

1. Sign up or log in.
2. Open the Roadmap page.
3. Enter a primary goal.
4. Optionally use `Generate from Goal` to auto-fill skills.
5. Add hours per week and a target date.
6. Generate the roadmap.
7. Review:
   - success score
   - timeline
   - roadmap summary
   - detailed markdown plan
8. Export, regenerate, share, print, or save as PDF.
9. Revisit saved roadmaps from the History page.

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

## Contributing

Contributions are welcome. Improvements to roadmap quality, UI polish, validation, and export behavior are all good candidates.
