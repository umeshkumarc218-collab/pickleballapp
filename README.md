# PickleBall Canada

Find pickleball drop-in sessions, book spots, and discover community meetups across Canada.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS — deployed on Vercel
- **Backend**: FastAPI (Python 3.12) — deployed on Railway
- **Database**: Supabase (Postgres + Auth)
- **Scraper**: Python + Playwright + BeautifulSoup — scheduled via APScheduler

## Project Structure

```
pickleballcanada/
├── frontend/          React + Vite app
│   └── src/
│       ├── components/  Shared UI components
│       ├── pages/       Route pages
│       ├── hooks/       useAuth, useSessions
│       └── lib/         supabase.js, api.js, geo.js
├── backend/           FastAPI app
│   ├── main.py
│   ├── auth.py
│   ├── config.py
│   ├── routers/       sessions, bookings, community, reviews, admin
│   └── models/        Pydantic schemas
├── scraper/           Python scrapers
│   ├── scrapers/      toronto, vancouver, calgary, montreal, ottawa
│   ├── scheduler.py   APScheduler (daily 3am EST)
│   └── db.py          Supabase upsert helpers
└── database/
    └── schema.sql     Full Supabase schema with RLS policies
```

## Quick Start

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `database/schema.sql` in the SQL editor
3. Copy your Project URL, anon key, and service role key

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium

# Create .env from template
cp ../.env.example .env
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY

uvicorn main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install

# Create .env.local
cp ../.env.example .env.local
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL

npm run dev
```

### 4. Scraper

```bash
cd scraper
# Uses same .env as backend
python scheduler.py   # runs immediately then schedules daily at 3am EST
```

## Deployment

### Vercel (frontend)

1. Import the `frontend/` directory into Vercel
2. Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
3. Update `vercel.json` rewrites with your Railway URL

### Railway (backend)

1. Create a new Railway project, connect to the `backend/` directory
2. Set env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, `JWT_SECRET`
3. Railway auto-detects `railway.toml` and runs uvicorn

### Scraper on Railway

Add a second Railway service pointing to `scraper/` with start command:
```
python scheduler.py
```

## Making a User an Admin

After creating an account, run this in Supabase SQL:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<user-uuid-from-auth.users>', 'admin');
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Session finder with filters, stats, sortable table |
| `/community` | Community meetups & events |
| `/bookings` | My bookings (auth required) |
| `/admin` | Scrape dashboard (admin only) |
| `/login` | Email/password auth |
| `/signup` | Registration with skill level & city |
