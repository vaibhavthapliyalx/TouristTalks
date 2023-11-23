from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from werkzeug.utils import secure_filename
import os
from flask_login import UserMixin, current_user, login_required, login_user, logout_user
from flask_login import LoginManager
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

app = Flask(__name__)
CORS(app)

# Connect to MongoDB
uri = "mongodb+srv://vaibhavthapliyal31:vaibhavthapliyal1@cluster0.evivb9m.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri)
db = client['TouristTalks']
places_collection = db['Places']
reviews_collection = db['Reviews']
users_collection = db['Users']

# Configure file upload settings
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Configure login settings
app.secret_key = 'supersecretkey'
login_manager = LoginManager()
login_manager.init_app(app)

# User model
class User(UserMixin):
    def __init__(self, user):
        self.id = user['_id']
        self.username = user['username']
        self.password_hash = user['password_hash']
        self.profile_photo = user['profile_photo']

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Helper functions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@login_manager.user_loader
def load_user(user_id):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user:
        return User(user)
    else:
        return None

# API Endpoints

@app.route('/api/db_connectivity', methods=['GET'])
def databaseStats():
    return client.admin.command('ping')

@app.route('/api/server_connectivity', methods=['GET'])
def serverStats():
    return jsonify({'message': 'Flask API is working!'})


# Get all places
@app.route('/api/places', methods=['GET'])
def get_all_places():
    places = list(places_collection.find())
    # Convert ObjectId to string
    for place in places:
        place['_id'] = str(place['_id'])
    return make_response(jsonify(places))

# Get place details
@app.route('/api/place/<place_id>', methods=['GET'])
def get_place_details(place_id):
    place = places_collection.find_one({"_id": ObjectId(place_id)})
    if place:
        # Convert ObjectId to string
        place['_id'] = str(place['_id'])
        return jsonify(place)
    else:
        return jsonify({'error': 'Place not found'}), 404

# Add a new review
@app.route('/api/reviews', methods=['POST'])
def add_review():
    data = request.json
    review_id = reviews_collection.insert_one(data).inserted_id
    return jsonify({'message': 'Review added successfully', 'review_id': str(review_id)})

# Edit a review
@app.route('/api/reviews/<review_id>', methods=['PUT'])
def edit_review(review_id):
    data = request.json
    reviews_collection.update_one({"_id": ObjectId(review_id)}, {"$set": data})
    return jsonify({'message': 'Review edited successfully'})

# Delete a review
@app.route('/api/reviews/<review_id>', methods=['DELETE'])
def delete_review(review_id):
    reviews_collection.delete_one({"_id": ObjectId(review_id)})
    return jsonify({'message': 'Review deleted successfully'})

# Upload profile photo
@app.route('/api/upload_profile_photo', methods=['POST'])
@login_required
def upload_profile_photo():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        users_collection.update_one({"_id": ObjectId(current_user.id)}, {"$set": {"profile_photo": filename}})
        return jsonify({'message': 'Profile photo uploaded successfully'})
    else:
        return jsonify({'error': 'Invalid file type'}), 400

# Add a new place
@app.route('/api/places', methods=['POST'])
@login_required
def add_place():
    data = request.json
    place_id = places_collection.insert_one(data).inserted_id
    return jsonify({'message': 'Place added successfully', 'place_id': str(place_id)})

# Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    user = users_collection.find_one({"username": username})

    if user and User(user).check_password(password):
        login_user(User(user))
        return jsonify({'message': 'Login successful'})
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

# Logout
@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'})

# Signup
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data['username']
    password = data['password']

    if users_collection.find_one({"username": username}):
        return jsonify({'error': 'Username already exists'}), 400

    password_hash = generate_password_hash(password)
    user_id = users_collection.insert_one({"username": username, "password_hash": password_hash}).inserted_id

    login_user(User(users_collection.find_one({"_id": user_id})))

    return jsonify({'message': 'Signup successful'})

if __name__ == '__main__':
    app.run(debug=True)