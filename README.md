# OnlineEarningHub AI — Premium Frontend

A responsive React + Vite frontend for the existing OnlineEarningHub AI FastAPI service.

## Features
- Four AI tools: Plan, Write, Research and Quality Check
- Calls the existing FastAPI endpoints with `{ "description": "..." }`
- Service health indicator using `GET /health`
- Loading, timeout, network and API error states
- Copy generated output
- Responsive desktop/mobile layout and light/dark theme
- API base URL configured with a Vite environment variable

## Requirements
- Node.js 20.19+ or 22.12+
- npm
- Existing backend deployed at `https://onlineearninghub-ai.onrender.com`

## Run locally
1. Copy `.env.example` to `.env`.
2. Confirm `VITE_API_BASE_URL` points to your backend.
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Open the local URL printed by Vite.

## Build
```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Deploy on Render (Static Site)
1. Push this project to a GitHub repository.
2. In Render, choose **New +** → **Static Site**.
3. Connect the frontend repository.
4. Set **Root Directory** to blank if this project is the repository root.
5. Build Command: `npm install && npm run build`
6. Publish Directory: `dist`
7. Add environment variable:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://onlineearninghub-ai.onrender.com`
8. Deploy.

If the project is inside a subfolder, set Render's Root Directory to that folder.

## Backend CORS requirement
The FastAPI backend must allow the deployed frontend origin. Add the exact Render Static Site URL to the backend's CORS allowlist (or use a controlled environment variable for allowed origins), then redeploy the backend. Do not use `allow_origins=["*"]` together with credentials.

Example FastAPI configuration (adapt to the existing app; do not add a second middleware if one already exists):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://YOUR-FRONTEND.onrender.com",
        "http://localhost:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)
```

## Security notes before public launch
- Never put `GEMINI_API_KEY` or any provider secret in `.env` variables prefixed with `VITE_`; Vite exposes those values to browser code.
- Keep provider credentials only in Render backend environment variables.
- This frontend is a guest-access preview. It does not yet provide user registration, authentication, per-user quotas, billing, durable history, or admin roles.
- Before a public commercial launch, implement and test authentication, authorization, rate limiting, abuse protection, privacy policy, terms, secure logging, monitoring, backups and payment compliance in the backend.
- The research endpoint currently reports AI knowledge without live web search unless the backend is upgraded to provide verified sources.
- Review generated content and verify factual claims before relying on them.

## API contract expected
- `GET /health`
- `POST /plan` with `{ "description": "..." }`
- `POST /write` with `{ "description": "..." }`
- `POST /research` with `{ "description": "..." }`
- `POST /check` with `{ "description": "..." }`

The frontend reads response fields such as `plan`, `content`, `findings`, `review`, `agent`, `model_used`, `fallback_used`, and `sources`.
