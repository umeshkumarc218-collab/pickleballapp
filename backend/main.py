from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import sessions, bookings, community, reviews, admin

app = FastAPI(
    title="PickleBall Canada API",
    description="Backend API for PickleBall Canada session finder",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://pickleballcanada.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router)
app.include_router(bookings.router)
app.include_router(community.router)
app.include_router(reviews.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "pickleballcanada-api"}
