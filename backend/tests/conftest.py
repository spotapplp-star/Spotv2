import pytest
import requests
import os

@pytest.fixture(scope="session")
def base_url():
    """Base URL from environment"""
    url = os.environ.get('EXPO_PUBLIC_BACKEND_URL', '').rstrip('/')
    if not url:
        pytest.fail("EXPO_PUBLIC_BACKEND_URL not set in environment")
    return url

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="session")
def admin_credentials():
    """Admin credentials from test_credentials.md"""
    return {
        "email": "spot.app.lp@gmail.com",
        "password": "SpotAdmin2026!"
    }

@pytest.fixture(scope="session")
def test_user_credentials():
    """Test user credentials"""
    return {
        "email": "paul@test.com",
        "password": "Test1234!"
    }
