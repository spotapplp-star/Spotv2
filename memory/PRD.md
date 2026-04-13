# SPOT - Paris Activity Discovery App

## Product Overview
SPOT is a mobile activity discovery application targeting 18-30 year olds in Paris. It combines a TikTok-style swipe feed, an interactive map, and a personalized configurator.

## Tech Stack
- **Frontend**: React Native / Expo SDK 54 with Expo Router
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: JWT with bcrypt password hashing
- **Map**: WebView with Leaflet + OpenStreetMap (free)
- **Storage**: AsyncStorage for local activity caching

## Screens (13 total)
1. Onboarding (4 slides), 2. Home Choice, 3. Auth, 4. Map + Navbar + Configurator (bottom sheet),
5. Loading, 6. Feed (swipe), 7. Detail, 8. Reservation, 9. Activities,
10. Profile, 11. XP Dashboard, 12. Creator Space, 13. Admin Panel (CRUD)

## Key Corrections Applied (v2)
1. Search bar and profile button are now independent elements
2. Navbar moved up with safe area padding, XP bar inside
3. Configurator is an Animated bottom sheet overlay (not Modal)
4. Feed uses real-time finger tracking with 30% snap threshold
5. Reserve button is large (48px), absolute positioned, functional
6. No hardcoded activities - managed via Admin Panel CRUD

## Admin Panel Features
- Full CRUD for activities with 13+ fields
- Category selection, GPS coordinates, schedule management
- Activities stored in MongoDB + cached in AsyncStorage
- Accessible only for admin email: spot.app.lp@gmail.com

## Design System
- Navy: #0D1B3E | Yellow: #F5C542 | Gold: #C8A84B | Beige: #EDE8DF
- No emojis - only @expo/vector-icons
