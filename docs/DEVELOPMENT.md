# Development Guide

This guide covers setting up the development environment, workflows, and common development tasks for banana-slides.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Database Management](#database-management)
- [Testing](#testing)
- [Code Style](#code-style)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Python | 3.10+ | Backend runtime |
| Node.js | 16+ | Frontend build |
| uv | latest | Python package manager |
| Docker | optional | Containerized deployment |

### Installation

**macOS:**
```bash
# Python (via pyenv)
brew install pyenv
pyenv install 3.10

# Node.js (via nvm)
brew install nvm
nvm install 18

# uv
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Linux:**
```bash
# Python
sudo apt install python3.10 python3.10-venv

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# uv
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Quick Start

### Clone Repository

```bash
git clone https://github.com/Anionex/banana-slides
cd banana-slides
```

### Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# nano .env
```

### Backend Setup

```bash
# Install dependencies
uv sync

# Run database migrations
cd backend
uv run alembic upgrade head

# Start backend server
uv run python app.py
```

Backend runs at `http://localhost:5000`

### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AI_PROVIDER_FORMAT` | AI provider type | `gemini`, `openai`, `vertex` |
| `GOOGLE_API_KEY` | Gemini API key | `AIza...` |
| `PORT` | Backend port | `5000` |

### Gemini Provider (default)

```bash
AI_PROVIDER_FORMAT=gemini
GOOGLE_API_KEY=your-gemini-api-key
GOOGLE_API_BASE=https://generativelanguage.googleapis.com
```

### OpenAI Provider

```bash
AI_PROVIDER_FORMAT=openai
OPENAI_API_KEY=sk-...
OPENAI_API_BASE=https://api.openai.com/v1
```

### Vertex AI Provider

```bash
AI_PROVIDER_FORMAT=vertex
VERTEX_PROJECT_ID=your-gcp-project
VERTEX_LOCATION=global
GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account.json
```

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TEXT_MODEL` | `gemini-3-flash-preview` | Text generation model |
| `IMAGE_MODEL` | `gemini-3-pro-image-preview` | Image generation model |
| `MAX_DESCRIPTION_WORKERS` | `5` | Parallel description workers |
| `MAX_IMAGE_WORKERS` | `8` | Parallel image workers |
| `OUTPUT_LANGUAGE` | `en` | Default output language |
| `LOG_LEVEL` | `INFO` | Logging level |
| `MINERU_TOKEN` | - | MinerU file parsing service token |

---

## Development Workflow

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
uv run python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Using Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Hot Reload

- **Frontend:** Vite provides instant HMR
- **Backend:** Flask runs in debug mode with auto-reload (development)

---

## Database Management

### Location

SQLite database is stored at:
```
backend/instance/database.db
```

### Viewing Database

```bash
# Using sqlite3 CLI
sqlite3 backend/instance/database.db

# List tables
.tables

# View schema
.schema projects

# Query data
SELECT id, status FROM projects LIMIT 5;
```

### Migrations

Migrations use Alembic and are stored in `backend/migrations/`.

**Run migrations:**
```bash
cd backend
uv run alembic upgrade head
```

**Create new migration:**
```bash
cd backend
uv run alembic revision --autogenerate -m "Add new column to projects"
```

**Undo last migration:**
```bash
cd backend
uv run alembic downgrade -1
```

**View migration history:**
```bash
cd backend
uv run alembic history
```

### Backup Database

```bash
cp backend/instance/database.db backend/instance/database.db.bak
```

---

## Testing

### Backend Tests

```bash
cd backend
uv run pytest tests/
```

### Frontend Tests

```bash
cd frontend
npm run test
```

### Manual Testing

1. **Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **API Testing with curl:**
   ```bash
   # Create project
   curl -X POST http://localhost:5000/api/projects \
     -H "Content-Type: application/json" \
     -d '{"creation_type": "idea", "idea_prompt": "Test"}'
   ```

3. **Browser DevTools:**
   - Network tab for API calls
   - React DevTools for component state
   - Console for errors

---

## Code Style

### Python (Backend)

- **Formatter:** Black (implicit via uv)
- **Linter:** Ruff

```bash
# Format code
uv run black backend/

# Lint code
uv run ruff check backend/
```

**Conventions:**
- Snake_case for functions and variables
- PascalCase for classes
- Docstrings for public functions
- Type hints recommended

### TypeScript (Frontend)

- **Formatter:** Prettier (via npm scripts)
- **Linter:** ESLint

```bash
cd frontend
npm run lint
npm run format
```

**Conventions:**
- camelCase for functions and variables
- PascalCase for components and types
- Interfaces over types where possible
- Explicit return types for functions

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
lsof -i :5000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### 2. Database Locked

SQLite can lock when multiple processes access it simultaneously.

**Solutions:**
- Restart the backend server
- Increase timeout: `SQLALCHEMY_ENGINE_OPTIONS['connect_args']['timeout'] = 60`
- Use WAL mode (already enabled by default)

#### 3. CORS Errors

Ensure backend CORS is configured for frontend origin:

```python
# backend/app.py
CORS(app, origins=['http://localhost:3000'])
```

#### 4. Missing Dependencies

```bash
# Backend
cd backend
uv sync

# Frontend
cd frontend
npm install
```

#### 5. Migration Errors

```bash
# Reset database (development only!)
rm backend/instance/database.db
cd backend
uv run alembic upgrade head
```

#### 6. API Key Not Working

1. Check `.env` file is in project root
2. Restart backend after editing `.env`
3. If set in Settings page, it overrides `.env`
4. Use "Reset to Defaults" in Settings to restore `.env` values

### Viewing Logs

**Backend logs:**
```bash
# Terminal output or
tail -f backend/server.log
```

**Docker logs:**
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### Debug Mode

**Backend:**
```python
# app.py already has debug mode for development
app.run(debug=True)
```

**Frontend:**
```bash
# Vite provides detailed error overlays
npm run dev
```

---

## Useful Commands Reference

| Task | Command |
|------|---------|
| Start backend | `cd backend && uv run python app.py` |
| Start frontend | `cd frontend && npm run dev` |
| Run migrations | `cd backend && uv run alembic upgrade head` |
| Create migration | `cd backend && uv run alembic revision --autogenerate -m "msg"` |
| Install backend deps | `uv sync` |
| Install frontend deps | `cd frontend && npm install` |
| Build frontend | `cd frontend && npm run build` |
| Run tests | `uv run pytest` or `npm run test` |
| Docker start | `docker compose up -d` |
| Docker stop | `docker compose down` |
| Docker logs | `docker compose logs -f` |
| Docker rebuild | `docker compose build --no-cache` |
