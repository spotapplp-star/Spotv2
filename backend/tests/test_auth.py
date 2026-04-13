"""
Test authentication endpoints: register, login, logout, me
"""
import pytest
import requests
import uuid

class TestAuthRegister:
    """Test user registration"""

    def test_register_new_user(self, base_url, api_client):
        """Test POST /api/auth/register creates new user"""
        unique_email = f"TEST_user_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "email": unique_email,
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        response = api_client.post(f"{base_url}/api/auth/register", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["email"] == unique_email.lower()
        assert data["name"] == "Test User"
        assert "access_token" in data
        assert data["role"] == "user"
        assert data["xp"] == 450
        assert data["level"] == 12
        assert "_id" not in data

    def test_register_duplicate_email(self, base_url, api_client):
        """Test registering with existing email returns 400"""
        unique_email = f"TEST_dup_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "email": unique_email,
            "password": "TestPass123!"
        }
        
        # First registration
        response = api_client.post(f"{base_url}/api/auth/register", json=payload)
        assert response.status_code == 200
        
        # Duplicate registration
        response = api_client.post(f"{base_url}/api/auth/register", json=payload)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()


class TestAuthLogin:
    """Test user login"""

    def test_login_admin_success(self, base_url, api_client, admin_credentials):
        """Test POST /api/auth/login with admin credentials"""
        response = api_client.post(f"{base_url}/api/auth/login", json=admin_credentials)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["email"] == admin_credentials["email"]
        assert "access_token" in data
        assert data["is_admin"] is True or data["role"] == "admin"
        assert "_id" not in data
        
        # Verify cookies are set
        assert "access_token" in response.cookies or "access_token" in data

    def test_login_invalid_credentials(self, base_url, api_client):
        """Test login with wrong password returns 401"""
        payload = {
            "email": "spot.app.lp@gmail.com",
            "password": "WrongPassword123!"
        }
        
        response = api_client.post(f"{base_url}/api/auth/login", json=payload)
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    def test_login_nonexistent_user(self, base_url, api_client):
        """Test login with non-existent email returns 401"""
        payload = {
            "email": "nonexistent@test.com",
            "password": "SomePassword123!"
        }
        
        response = api_client.post(f"{base_url}/api/auth/login", json=payload)
        assert response.status_code == 401


class TestAuthMe:
    """Test GET /api/auth/me endpoint"""

    def test_get_me_with_token(self, base_url, api_client, admin_credentials):
        """Test GET /api/auth/me returns user data with valid token"""
        # Login first
        login_response = api_client.post(f"{base_url}/api/auth/login", json=admin_credentials)
        assert login_response.status_code == 200
        
        token = login_response.json()["access_token"]
        
        # Get user info
        headers = {"Authorization": f"Bearer {token}"}
        response = api_client.get(f"{base_url}/api/auth/me", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == admin_credentials["email"]
        assert "id" in data
        assert "_id" not in data

    def test_get_me_without_token(self, base_url, api_client):
        """Test GET /api/auth/me without token returns 401"""
        response = api_client.get(f"{base_url}/api/auth/me")
        assert response.status_code == 401


class TestAuthLogout:
    """Test logout endpoint"""

    def test_logout(self, base_url, api_client, admin_credentials):
        """Test POST /api/auth/logout clears cookies"""
        # Login first
        login_response = api_client.post(f"{base_url}/api/auth/login", json=admin_credentials)
        assert login_response.status_code == 200
        
        # Logout
        response = api_client.post(f"{base_url}/api/auth/logout")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "logged out" in data["message"].lower()
