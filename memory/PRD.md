# SPOT - Paris Activity Discovery App

## Product Overview
SPOT is a mobile activity discovery application targeting 18-30 year olds in Paris. It combines a TikTok-style swipe feed, an interactive map, and a personalized configurator.

## Tech Stack
- **Frontend**: React Native / Expo SDK 54 with Expo Router
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: JWT with bcrypt password hashing
- **Map**: WebView with Leaflet + OpenStreetMap (free, no API key needed)

## Screens (13 total)
1. **Onboarding** - 4 slides with animations, navy background
2. **Home Choice** - "Je me lance" / "Je personnalise" entry points
3. **Auth** - Login/Register with email + password
4. **Map** - Interactive map with custom pins, search bar, popup, navbar
5. **Configurator** - Bottom sheet with 3 tabs (Membres, Mood, Pratique)
6. **Loading** - Animated loading with criteria recap
7. **Feed** - Swipe cards (left/right/up/down) with activity images
8. **Detail** - Activity detail with hero image, stats, schedule
9. **Reservation** - Booking flow with participant count, time slots
10. **Activities** - Liked, favorites, history, journey sections
11. **Profile** - Full profile with stats, menu sections, admin access
12. **XP Dashboard** - Level progress, rewards, badges
13. **Creator Space** - Video list, stats, upload form
14. **Admin Panel** - Stats, activity/user/video management (email-gated)

## Design System
- Navy: #0D1B3E | Yellow: #F5C542 | Gold: #C8A84B | Beige: #EDE8DF
- Font: System fonts (-apple-system, Helvetica Neue)
- No emojis - only vector icons (@expo/vector-icons)

## API Endpoints
- Auth: register, login, logout, me
- Activities: list, get by id, search
- User: favorites, likes, profile update
- Reservations: create, list, cancel
- Reviews: create, list
- XP: get user XP/badges/rewards
- Creator: stats, videos, submit
- Admin: stats, CRUD activities, users, videos

## Auth
- Admin: spot.app.lp@gmail.com / SpotAdmin2026!
- JWT tokens stored in AsyncStorage
- Admin panel visible only for admin email
