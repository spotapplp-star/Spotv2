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
    """Activities endpoints"""

    def test_get_activities_returns_7(self, base_url, api_client):
        """Test GET /api/activities returns 7 seeded activities"""
        response = api_client.get(f"{base_url}/api/activities")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 7, f"Expected 7 activities, got {len(data)}"
        
        # Verify first activity structure
        first = data[0]
        assert "id" in first
        assert "name" in first
        assert "category" in first
        assert "price" in first
        assert "rating" in first
        assert "xp" in first
        assert "_id" not in first, "MongoDB _id should be excluded"

    def test_get_activity_by_id(self, base_url, api_client):
        """Test GET /api/activities/{id} returns single activity"""
        # First get all activities to get a valid ID
        response = api_client.get(f"{base_url}/api/activities")
        assert response.status_code == 200
        activities = response.json()
        assert len(activities) > 0
        
        activity_id = activities[0]["id"]
        
        # Get single activity
        response = api_client.get(f"{base_url}/api/activities/{activity_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == activity_id
        assert "name" in data
        assert "_id" not in data

    def test_get_nonexistent_activity(self, base_url, api_client):
        """Test GET /api/activities/{invalid_id} returns 404"""
        response = api_client.get(f"{base_url}/api/activities/000000000000000000000000")
        assert response.status_code == 404
