import datetime
from functools import wraps
import bcrypt
from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
import jwt
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
blacklist = db['blacklist']
app.config['SECRET_KEY'] = 'secret_key'

# Configure file upload settings
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

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

# JWT Authentication, A decorator to check for a valid token
def jwt_required(func):
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 401
        return func(*args, **kwargs)
    return jwt_required_wrapper


# API Endpoints

@app.route('/api/db_connectivity', methods=['GET'])
def databaseStats():
    return client.user.command('ping')

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
@app.route('/api/add-place', methods=['POST'])
@login_required
def add_place():
    data = request.json
    place_id = places_collection.insert_one(data).inserted_id
    return jsonify({'message': 'Place added successfully', 'place_id': str(place_id)})

#User signup (POST) operation

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    fullname = data.get('fullname')
    password = data.get('password')
    email = data.get('email')
    profile_photo = data.get('profile_photo')
    print("username: ", username)
    print("password: ", password)

    # Check if the username is already taken
    if users_collection.find_one({'email': email}):
        return jsonify({'message': 'An account is already registered with this email. Please log in instead.'}), 400

    if not password:
        return jsonify({'message': 'Password is required.'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Create a new user in users collection
    new_user = {
        'fullname': fullname,
        'username': username,
        'password': hashed_password.decode('utf-8'),
        'email': email,
        'profile_photo': profile_photo
    }
    result = users_collection.insert_one(new_user)
    return jsonify({'message': 'user created successfully!', 'user_id': str(result.inserted_id)}, 201)


# User login (POST) operation
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = users_collection.find_one({'username': username})
    if user is None:
        user = users_collection.find_one({'email': username})

    if user is not None:
        if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):

            token = jwt.encode({
                'id': str(user['_id']),  # Convert ObjectId to string
                'user': user['username'],
                'iat': datetime.datetime.utcnow(),
                'exp': datetime.datetime.utcnow() + datetime. timedelta(hours=24)
            }, app.config['SECRET_KEY'])
            return make_response(jsonify({'token': token}), 200)
        else:
            return make_response(jsonify({'message': 'Password is incorrect'}), 401)
    else:
        return make_response(jsonify({'message': 'Username or email not found. Please check your credentials or sign up to create a new account.'}), 401)
    

# User logout operation
@app.route('/api/logout', methods=['GET'])
@jwt_required
def logout():
    token = request.headers['x-access-token']
    blacklist.insert_one({"token": token})
    return jsonify({'message': 'Logout successful'})

# @app.route('/api/validate-token', methods=['GET'])
# @jwt_required
# def validate_token():
#     token = request.headers['x-access-token']
#     if blacklist.find_one({"token": token}):
#         return make_response(jsonify({'message': 'Invalid token'}), 401)
#     else:
#         return make_response(jsonify({'message': 'Valid token'}), 200)

@app.route('/api/logged-in-user', methods=['GET'])
@jwt_required
def get_logged_in_user():
    try:
        token = request.headers.get('x-access-token')  #    Get the token from the headers

        # Decode the token and get the user_id
        data = jwt.decode(token, app.config ['SECRET_KEY'], algorithms=["HS256"])
        user_id = data['id']

        # Fetch the user data from your database
        user = users_collection.find_one({'_id':  ObjectId(user_id)})

        if user:
            # If the user exists, return their data
            return jsonify({
                'id': str(user['_id']),  # Convert ObjectId to string
                'fullname': user['fullname'],
                'username': user['username'],
                'password': user['password'],
                'email': user['email'],
                'profile_photo': user['profile_photo'],
            }), 200
        else:
            # If the user does not exist, return an     error
            return jsonify({'message': 'user not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)