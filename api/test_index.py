# This file contains all the unit tests for the backend of our application.
import pytest
import json
from index import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    # Creating a test client
    with app.test_client() as client:
        yield client

def test_database_connectivity(client):
    response = client.get('/api/db_connectivity')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert data['ok'] == 1

def test_server_connectivity(client):
    response = client.get('/api/server_connectivity')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert data['message'] == 'Flask API is working!'

def test_get_all_places(client):
    response = client.get('/api/places')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert len(data) > 0

def test_get_all_reviews(client):
    response = client.get('/api/reviews')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert len(data) > 0

def test_get_user_reviews(client):
    response = client.get('/api/myreviews/u101')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert len(data) >= 0

def test_get_reviews_liked_by_user(client):
    response = client.get('/api/liked-reviews/u101')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert len(data) >= 0

def test_get_reviews_for_a_place(client):
    response = client.get('/api/places/1/reviews')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert len(data) >= 0

def test_get_user_by_user_id(client):
    response = client.get('/api/users/u101')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert data['user_id'] == 'u101'

def test_get_review_by_review_id(client):
    response = client.get('/api/reviews/r202')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert data['review_id'] == 'r202'

def test_get_reviews_with_user_details(client):
    response = client.get('/api/places/1/reviews-with-user-details')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert len(data) >= 0

def test_get_place_by_place_id(client):
    response = client.get('/api/place/1')
    data = json.loads(response.data.decode('utf-8'))
    assert response.status_code == 200
    assert data['place_id'] == 1
