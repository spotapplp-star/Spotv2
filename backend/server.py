from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from bson import ObjectId

# Config
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "spot.app.lp@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "SpotAdmin2026!")

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ── Models ──
class AuthInput(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str = "user"
    xp: int = 0
    level: int = 1
    city: str = "Paris"
    created_at: str = ""
    is_admin: bool = False

class ActivityCreate(BaseModel):
    name: str
    arrondissement: str = ""
    address: str = ""
    lat: float = 48.8534
    lng: float = 2.3488
    category: str = ""
    price: str = ""
    price_unit: int = 0
    duration: str = ""
    rating: float = 0.0
    xp: int = 0
    tags: List[str] = []
    description: str = ""
    image: str = ""
    schedule: list = []
    status: str = "active"

class ReservationCreate(BaseModel):
    activity_id: str
    participants: int = 1
    date: str = ""
    time_slot: str = ""
    total: float = 0.0

class ReviewCreate(BaseModel):
    activity_id: str
    reservation_id: Optional[str] = None
    rating: int = 5
    text: str = ""

class VideoCreate(BaseModel):
    activity_name: str
    address: str = ""
    price: str = ""
    category: str = ""
    description: str = ""

# ── Auth Helpers ──
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=24), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def user_to_out(user: dict) -> dict:
    return {
        "id": str(user.get("_id", user.get("id", ""))),
        "email": user.get("email", ""),
        "name": user.get("name", ""),
        "role": user.get("role", "user"),
        "xp": user.get("xp", 0),
        "level": user.get("level", 1),
        "city": user.get("city", "Paris"),
        "created_at": str(user.get("created_at", "")),
        "is_admin": user.get("email", "") == ADMIN_EMAIL or user.get("role") == "admin",
    }

def activity_to_out(act: dict) -> dict:
    return {
        "id": str(act.get("_id", act.get("id", ""))),
        "name": act.get("name", ""),
        "arrondissement": act.get("arrondissement", ""),
        "address": act.get("address", ""),
        "lat": act.get("lat", 0),
        "lng": act.get("lng", 0),
        "category": act.get("category", ""),
        "price": act.get("price", ""),
        "price_unit": act.get("price_unit", 0),
        "duration": act.get("duration", ""),
        "rating": act.get("rating", 0),
        "xp": act.get("xp", 0),
        "tags": act.get("tags", []),
        "description": act.get("description", ""),
        "image": act.get("image", ""),
        "schedule": act.get("schedule", []),
        "status": act.get("status", "active"),
    }

# ── Auth Endpoints ──
@api_router.post("/auth/register")
async def register(input: AuthInput, response: Response):
    email = input.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "email": email,
        "password_hash": hash_password(input.password),
        "name": input.name or email.split("@")[0],
        "role": "admin" if email == ADMIN_EMAIL else "user",
        "xp": 450,
        "level": 12,
        "city": "Paris",
        "created_at": datetime.now(timezone.utc),
        "favorites": [],
        "likes": [],
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    user_doc["_id"] = user_id
    out = user_to_out(user_doc)
    out["access_token"] = access_token
    return out

@api_router.post("/auth/login")
async def login(input: AuthInput, response: Response):
    email = input.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    out = user_to_out(user)
    out["access_token"] = access_token
    return out

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user_to_out(user)

# ── Activities Endpoints ──
@api_router.get("/activities")
async def get_activities(category: Optional[str] = None, search: Optional[str] = None):
    query = {"status": "active"}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
        ]
    activities = await db.activities.find(query).to_list(100)
    return [activity_to_out(a) for a in activities]

@api_router.get("/activities/{activity_id}")
async def get_activity(activity_id: str):
    try:
        act = await db.activities.find_one({"_id": ObjectId(activity_id)})
    except Exception:
        act = await db.activities.find_one({"id": activity_id})
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity_to_out(act)

# ── User Favorites & Likes ──
@api_router.post("/users/me/favorites/{activity_id}")
async def toggle_favorite(activity_id: str, request: Request):
    user = await get_current_user(request)
    uid = ObjectId(user["_id"])
    current = await db.users.find_one({"_id": uid}, {"favorites": 1})
    favs = current.get("favorites", [])
    if activity_id in favs:
        favs.remove(activity_id)
        action = "removed"
    else:
        favs.append(activity_id)
        action = "added"
    await db.users.update_one({"_id": uid}, {"$set": {"favorites": favs}})
    return {"action": action, "favorites": favs}

@api_router.get("/users/me/favorites")
async def get_favorites(request: Request):
    user = await get_current_user(request)
    uid = ObjectId(user["_id"])
    u = await db.users.find_one({"_id": uid}, {"favorites": 1})
    fav_ids = u.get("favorites", [])
    activities = []
    for fid in fav_ids:
        try:
            act = await db.activities.find_one({"_id": ObjectId(fid)})
            if act:
                activities.append(activity_to_out(act))
        except Exception:
            pass
    return activities

@api_router.post("/users/me/likes/{activity_id}")
async def toggle_like(activity_id: str, request: Request):
    user = await get_current_user(request)
    uid = ObjectId(user["_id"])
    current = await db.users.find_one({"_id": uid}, {"likes": 1})
    likes = current.get("likes", [])
    if activity_id in likes:
        likes.remove(activity_id)
        action = "removed"
    else:
        likes.append(activity_id)
        action = "added"
    await db.users.update_one({"_id": uid}, {"$set": {"likes": likes}})
    return {"action": action, "likes": likes}

@api_router.get("/users/me/likes")
async def get_likes(request: Request):
    user = await get_current_user(request)
    uid = ObjectId(user["_id"])
    u = await db.users.find_one({"_id": uid}, {"likes": 1})
    like_ids = u.get("likes", [])
    activities = []
    for lid in like_ids:
        try:
            act = await db.activities.find_one({"_id": ObjectId(lid)})
            if act:
                activities.append(activity_to_out(act))
        except Exception:
            pass
    return activities

@api_router.put("/users/me/profile")
async def update_profile(request: Request):
    user = await get_current_user(request)
    body = await request.json()
    allowed = {"name", "city", "bio"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if updates:
        await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": updates})
    updated = await db.users.find_one({"_id": ObjectId(user["_id"])})
    return user_to_out(updated)

# ── Reservations ──
@api_router.post("/reservations")
async def create_reservation(input: ReservationCreate, request: Request):
    user = await get_current_user(request)
    res_doc = {
        "user_id": user["_id"],
        "activity_id": input.activity_id,
        "participants": input.participants,
        "date": input.date,
        "time_slot": input.time_slot,
        "total": input.total,
        "status": "confirmed",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.reservations.insert_one(res_doc)
    # Add XP
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$inc": {"xp": 50}})
    return {"id": str(result.inserted_id), "status": "confirmed", "message": "Reservation confirmed!"}

@api_router.get("/reservations/me")
async def get_my_reservations(request: Request):
    user = await get_current_user(request)
    reservations = await db.reservations.find({"user_id": user["_id"]}).sort("created_at", -1).to_list(50)
    result = []
    for r in reservations:
        act = None
        try:
            act = await db.activities.find_one({"_id": ObjectId(r["activity_id"])})
        except Exception:
            pass
        result.append({
            "id": str(r["_id"]),
            "activity_id": r["activity_id"],
            "activity_name": act["name"] if act else "Unknown",
            "activity_image": act["image"] if act else "",
            "participants": r.get("participants", 1),
            "date": r.get("date", ""),
            "time_slot": r.get("time_slot", ""),
            "total": r.get("total", 0),
            "status": r.get("status", "confirmed"),
            "created_at": str(r.get("created_at", "")),
        })
    return result

@api_router.delete("/reservations/{reservation_id}")
async def cancel_reservation(reservation_id: str, request: Request):
    user = await get_current_user(request)
    result = await db.reservations.update_one(
        {"_id": ObjectId(reservation_id), "user_id": user["_id"]},
        {"$set": {"status": "cancelled"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"message": "Reservation cancelled"}

# ── Reviews ──
@api_router.post("/reviews")
async def create_review(input: ReviewCreate, request: Request):
    user = await get_current_user(request)
    review_doc = {
        "user_id": user["_id"],
        "user_name": user.get("name", ""),
        "activity_id": input.activity_id,
        "reservation_id": input.reservation_id,
        "rating": input.rating,
        "text": input.text,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.reviews.insert_one(review_doc)
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$inc": {"xp": 30}})
    return {"id": str(result.inserted_id), "message": "Review submitted!"}

@api_router.get("/reviews/me")
async def get_my_reviews(request: Request):
    user = await get_current_user(request)
    reviews = await db.reviews.find({"user_id": user["_id"]}).to_list(50)
    result = []
    for r in reviews:
        act = None
        try:
            act = await db.activities.find_one({"_id": ObjectId(r["activity_id"])})
        except Exception:
            pass
        result.append({
            "id": str(r["_id"]),
            "activity_id": r["activity_id"],
            "activity_name": act["name"] if act else "Unknown",
            "rating": r.get("rating", 5),
            "text": r.get("text", ""),
            "created_at": str(r.get("created_at", "")),
        })
    return result

# ── XP ──
@api_router.get("/xp/me")
async def get_xp(request: Request):
    user = await get_current_user(request)
    xp = user.get("xp", 0)
    level = max(1, xp // 200 + 1)
    next_level_xp = level * 200
    ranks = {1: "Novice", 5: "Curieux", 8: "Aventurier", 10: "Explorateur Urbain", 15: "Expert Parisien", 20: "Légende"}
    rank = "Novice"
    for lvl, name in sorted(ranks.items()):
        if level >= lvl:
            rank = name
    return {
        "xp": xp, "level": level, "rank": rank,
        "next_level_xp": next_level_xp,
        "progress": (xp % 200) / 200,
        "badges": [
            {"name": "Marcheur Bronze", "tier": "Bronze", "unlocked": True, "mult": 1.2},
            {"name": "Explorateur Argent", "tier": "Silver", "unlocked": xp >= 300, "mult": 1.5},
            {"name": "Aventurier Or", "tier": "Gold", "unlocked": xp >= 800, "mult": 2.0},
            {"name": "Légende Platine", "tier": "Platinum", "unlocked": xp >= 2000, "mult": 3.0},
        ],
        "rewards": [
            {"name": "-20% Atelier des Lumieres", "desc": "Reduction sur votre prochaine entree", "distance": "450m", "xp_cost": 550},
            {"name": "Partie offerte Escape Game", "desc": "Pour 2 joueurs, valable 30 jours", "distance": "200m", "xp_cost": 850},
            {"name": "-30% Kayak Canal", "desc": "Session de 1h pour 2 personnes", "distance": "1.2km", "xp_cost": 400},
        ],
    }

# ── Creator ──
@api_router.get("/creator/stats")
async def creator_stats(request: Request):
    user = await get_current_user(request)
    videos = await db.creator_videos.count_documents({"user_id": user["_id"]})
    return {"views": 1240, "reservations": 87, "earnings": 42, "videos_count": videos}

@api_router.get("/creator/videos")
async def get_creator_videos(request: Request):
    user = await get_current_user(request)
    videos = await db.creator_videos.find({"user_id": user["_id"]}).to_list(50)
    return [{"id": str(v["_id"]), "activity_name": v.get("activity_name", ""), "status": v.get("status", "pending"), "views": v.get("views", 0), "created_at": str(v.get("created_at", ""))} for v in videos]

@api_router.post("/creator/videos")
async def submit_video(input: VideoCreate, request: Request):
    user = await get_current_user(request)
    doc = {
        "user_id": user["_id"],
        "activity_name": input.activity_name,
        "address": input.address,
        "price": input.price,
        "category": input.category,
        "description": input.description,
        "status": "pending",
        "views": 0,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.creator_videos.insert_one(doc)
    return {"id": str(result.inserted_id), "status": "pending", "message": "Video submitted for review"}

# ── Admin ──
@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    user = await get_current_user(request)
    if user.get("email") != ADMIN_EMAIL and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    users_count = await db.users.count_documents({})
    activities_count = await db.activities.count_documents({})
    reservations_count = await db.reservations.count_documents({})
    return {"users": users_count, "activities": activities_count, "reservations": reservations_count, "revenue": 1250}

@api_router.get("/admin/activities")
async def admin_activities(request: Request):
    user = await get_current_user(request)
    if user.get("email") != ADMIN_EMAIL and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    activities = await db.activities.find().to_list(200)
    return [activity_to_out(a) for a in activities]

@api_router.post("/admin/activities")
async def admin_create_activity(input: ActivityCreate, request: Request):
    user = await get_current_user(request)
    if user.get("email") != ADMIN_EMAIL and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    doc = input.dict()
    doc["created_at"] = datetime.now(timezone.utc)
    result = await db.activities.insert_one(doc)
    doc["_id"] = result.inserted_id
    return activity_to_out(doc)

@api_router.put("/admin/activities/{activity_id}")
async def admin_update_activity(activity_id: str, request: Request):
    user = await get_current_user(request)
    if user.get("email") != ADMIN_EMAIL and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    body = await request.json()
    body.pop("_id", None)
    body.pop("id", None)
    await db.activities.update_one({"_id": ObjectId(activity_id)}, {"$set": body})
    act = await db.activities.find_one({"_id": ObjectId(activity_id)})
    return activity_to_out(act)

@api_router.get("/admin/users")
async def admin_users(request: Request):
    user = await get_current_user(request)
    if user.get("email") != ADMIN_EMAIL and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    users = await db.users.find({}, {"password_hash": 0}).to_list(200)
    return [user_to_out(u) for u in users]

@api_router.put("/admin/users/{user_id}")
async def admin_update_user(user_id: str, request: Request):
    user = await get_current_user(request)
    if user.get("email") != ADMIN_EMAIL and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    body = await request.json()
    allowed = {"role", "status", "xp", "level"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if updates:
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    return {"message": "User updated"}

@api_router.get("/admin/videos")
async def admin_videos(request: Request):
    user = await get_current_user(request)
    if user.get("email") != ADMIN_EMAIL and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    videos = await db.creator_videos.find().to_list(200)
    result = []
    for v in videos:
        creator = await db.users.find_one({"_id": ObjectId(v["user_id"])}) if isinstance(v.get("user_id"), str) else None
        result.append({
            "id": str(v["_id"]),
            "activity_name": v.get("activity_name", ""),
            "creator_name": creator.get("name", "Unknown") if creator else "Unknown",
            "status": v.get("status", "pending"),
            "created_at": str(v.get("created_at", "")),
        })
    return result

@api_router.put("/admin/videos/{video_id}")
async def admin_update_video(video_id: str, request: Request):
    user = await get_current_user(request)
    if user.get("email") != ADMIN_EMAIL and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    body = await request.json()
    status = body.get("status", "pending")
    await db.creator_videos.update_one({"_id": ObjectId(video_id)}, {"$set": {"status": status}})
    return {"message": f"Video {status}"}

# ── Health ──
@api_router.get("/")
async def root():
    return {"message": "SPOT API is running", "version": "1.0"}

# ── Seed Data ──
SEED_ACTIVITIES = [
    {"name": "The Game - Escape Room", "arrondissement": "11e", "address": "17 Rue de la Roquette, Paris", "lat": 48.8542, "lng": 2.3712, "category": "Aventure", "price": "28\u20ac/pers", "price_unit": 28, "duration": "1h30", "rating": 4.8, "xp": 150, "tags": ["Escape Game", "Groupe", "Immersif"], "description": "L'escape game le mieux note de Paris. Scenarios inedits dans une ambiance immersive totale. Ideal pour 2 a 8 joueurs.", "image": "https://images.unsplash.com/photo-1509909756405-be0199881695?w=600&q=80", "schedule": [{"day": "Lun-Ven", "hours": "14h-23h"}, {"day": "Sam-Dim", "hours": "10h-23h"}], "status": "active"},
    {"name": "Diner dans le Noir", "arrondissement": "9e", "address": "51 Rue Quincampoix, Paris", "lat": 48.8749, "lng": 2.3395, "category": "Immersif", "price": "55\u20ac/pers", "price_unit": 55, "duration": "2h30", "rating": 4.7, "xp": 180, "tags": ["Gastronomie", "Immersif", "Romantique"], "description": "Un repas gastronomique en pleine obscurite totale. Tous vos sens en eveil pour une soiree absolument inoubliable.", "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", "schedule": [{"day": "Mar-Dim", "hours": "19h-23h"}, {"day": "Lundi", "hours": "Ferme", "closed": True}], "status": "active"},
    {"name": "Atelier des Lumieres", "arrondissement": "11e", "address": "38 Rue Saint-Maur, Paris", "lat": 48.8608, "lng": 2.3794, "category": "Culturel", "price": "16\u20ac/pers", "price_unit": 16, "duration": "1h30", "rating": 4.6, "xp": 130, "tags": ["Art numerique", "Culturel", "Solo ok"], "description": "Musee d'art numerique immersif installe dans une ancienne fonderie du XIXe siecle. Expositions spectaculaires.", "image": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80", "schedule": [{"day": "Lun-Jeu", "hours": "10h-18h"}, {"day": "Ven-Dim", "hours": "10h-22h"}], "status": "active"},
    {"name": "Le Perchoir Menilmontant", "arrondissement": "11e", "address": "14 Rue Crespin du Gast, Paris", "lat": 48.8634, "lng": 2.3810, "category": "Festif", "price": "Entree libre", "price_unit": 0, "duration": "Soiree", "rating": 4.5, "xp": 120, "tags": ["Rooftop", "Cocktails", "Vue panoramique"], "description": "Le rooftop parisien par excellence. Vue 360 sur Paris, cocktails signatures et DJ set le week-end.", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80", "schedule": [{"day": "Mar-Dim", "hours": "18h-2h"}, {"day": "Lundi", "hours": "Ferme", "closed": True}], "status": "active"},
    {"name": "Kayak Canal Saint-Martin", "arrondissement": "10e", "address": "Canal Saint-Martin, Paris", "lat": 48.8760, "lng": 2.3640, "category": "Plein air", "price": "22\u20ac/pers", "price_unit": 22, "duration": "1h", "rating": 4.8, "xp": 160, "tags": ["Sport", "Plein air", "Ete"], "description": "Decouvrez Paris depuis l'eau en kayak sur le Canal Saint-Martin. Une experience depaysante en plein coeur de Paris.", "image": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80", "schedule": [{"day": "Avr-Oct", "hours": "9h-19h"}, {"day": "Nov-Mars", "hours": "Ferme", "closed": True}], "status": "active"},
    {"name": "Block Out Escalade", "arrondissement": "19e", "address": "9 Rue Neuve Tolbiac, Paris", "lat": 48.8826, "lng": 2.3802, "category": "Sport", "price": "19\u20ac/pers", "price_unit": 19, "duration": "2h", "rating": 4.7, "xp": 150, "tags": ["Escalade", "Sport", "Debutant ok"], "description": "La plus grande salle d'escalade de bloc de Paris. Debutants comme confirmes. Location de chaussons incluse.", "image": "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=80", "schedule": [{"day": "Lun-Ven", "hours": "10h-23h"}, {"day": "Sam-Dim", "hours": "9h-20h"}], "status": "active"},
    {"name": "Cours de Mixologie", "arrondissement": "8e", "address": "23 Rue du Colisee, Paris", "lat": 48.8740, "lng": 2.3060, "category": "Creatif", "price": "45\u20ac/pers", "price_unit": 45, "duration": "2h", "rating": 4.8, "xp": 190, "tags": ["Cocktails", "Cours", "Festif"], "description": "Apprenez a creer vos propres cocktails avec un bartender professionnel. Repartez avec vos recettes.", "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80", "schedule": [{"day": "Mer-Sam", "hours": "18h-22h"}, {"day": "Dim-Mar", "hours": "Sur resa"}], "status": "active"},
]

async def seed_data():
    # Seed admin
    admin_email = ADMIN_EMAIL
    admin_password = ADMIN_PASSWORD
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin SPOT",
            "role": "admin",
            "xp": 450,
            "level": 12,
            "city": "Paris 11e",
            "created_at": datetime.now(timezone.utc),
            "favorites": [],
            "likes": [],
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")

    # Activities are managed via Admin Panel - no seeding

    # Create indexes
    await db.users.create_index("email", unique=True)
    logger.info("Database seeded and indexed")

    # Write test credentials
    cred_path = Path("/app/memory/test_credentials.md")
    cred_path.parent.mkdir(parents=True, exist_ok=True)
    cred_path.write_text(f"""# Test Credentials

## Admin Account
- Email: {admin_email}
- Password: {admin_password}
- Role: admin

## Test User
- Email: paul@test.com
- Password: Test1234!
- Role: user

## Auth Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
""")

@app.on_event("startup")
async def startup():
    await seed_data()

@app.on_event("shutdown")
async def shutdown():
    client.close()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
