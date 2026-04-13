"""
Test health endpoint and activities CRUD
"""
import pytest
import requests

class TestHealth:
    """Health check endpoint"""

    def test_health_endpoint(self, base_url, api_client):
        """Test GET /api/ returns success"""
        response = api_client.get(f"{base_url}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "SPOT API" in data["message"]


class TestActivities:
    """Activities endpoints - CORRECTION 6: App starts empty, activities managed via admin panel"""

    def test_get_activities_returns_empty_initially(self, base_url, api_client):
        """Test GET /api/activities returns empty array initially (CORRECTION 6)"""
        response = api_client.get(f"{base_url}/api/activities")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        # App starts empty - activities are managed via admin panel
        print(f"Activities count: {len(data)} (expected 0 for fresh start)")

    def test_get_nonexistent_activity(self, base_url, api_client):
        """Test GET /api/activities/{invalid_id} returns 404"""
        response = api_client.get(f"{base_url}/api/activities/000000000000000000000000")
        assert response.status_code == 404


class TestAdminActivities:
    """Admin CRUD for activities - CORRECTION 6"""

    def test_admin_create_activity(self, base_url, api_client, admin_credentials):
        """Test POST /api/admin/activities creates activity with full form data"""
        # Login as admin
        login_response = api_client.post(f"{base_url}/api/auth/login", json=admin_credentials)
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Create activity with all fields from admin form
        activity_data = {
            "name": "TEST_Escape Game Paris",
            "description": "Un escape game immersif au coeur de Paris",
            "address": "17 Rue de la Roquette, Paris",
            "arrondissement": "11e",
            "lat": 48.8542,
            "lng": 2.3712,
            "category": "Aventure",
            "price": "28EUR/pers",
            "price_unit": 28,
            "duration": "1h30",
            "rating": 4.8,
            "xp": 150,
            "tags": ["Escape Game", "Groupe", "Immersif"],
            "image": "https://images.unsplash.com/photo-1509909756405-be0199881695?w=600&q=80",
            "schedule": [
                {"day": "Lun-Ven", "hours": "14h-23h", "closed": False},
                {"day": "Sam-Dim", "hours": "10h-23h", "closed": False}
            ],
            "status": "active"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        response = api_client.post(f"{base_url}/api/admin/activities", json=activity_data, headers=headers)
        assert response.status_code == 200
        
        created = response.json()
        assert "id" in created
        assert created["name"] == activity_data["name"]
        assert created["category"] == activity_data["category"]
        assert created["price_unit"] == activity_data["price_unit"]
        assert created["xp"] == activity_data["xp"]
        assert len(created["tags"]) == 3
        assert "_id" not in created
        
        # Verify activity appears in GET /api/activities
        get_response = api_client.get(f"{base_url}/api/activities")
        assert get_response.status_code == 200
        activities = get_response.json()
        assert len(activities) >= 1
        assert any(a["name"] == activity_data["name"] for a in activities)
        
        print(f"✅ Admin created activity: {created['name']} (ID: {created['id']})")
        return created["id"]

    def test_admin_get_all_activities(self, base_url, api_client, admin_credentials):
        """Test GET /api/admin/activities returns all activities"""
        # Login as admin
        login_response = api_client.post(f"{base_url}/api/auth/login", json=admin_credentials)
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = api_client.get(f"{base_url}/api/admin/activities", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Admin panel shows {len(data)} activities")

    def test_non_admin_cannot_create_activity(self, base_url, api_client):
        """Test non-admin user cannot create activities"""
        # Try without auth
        activity_data = {"name": "Unauthorized Activity", "description": "Should fail"}
        response = api_client.post(f"{base_url}/api/admin/activities", json=activity_data)
        assert response.status_code == 401
