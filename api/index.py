# Import the necessary modules
import datetime
from functools import wraps
import random
import bcrypt
from dotenv import load_dotenv
from flask import Flask, make_response, request, jsonify
from flask_cors import CORS
import jwt
from pymongo import MongoClient
from bson import Decimal128, ObjectId
import os

# Load environment variables file.
# Here, for security reasons, we are storing the database credentials in a .env file.
# This file is ignored by Git thus ensuring security of our application.
load_dotenv()

# Create the Flask app.
app = Flask(__name__)
CORS(app)

# Connect to MongoDB
uri = os.getenv('MONGO_URI')
client = MongoClient(uri)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Connecting to the database and its collections.
db = client['TouristTalks']
places_collection = db['Places']
reviews_collection = db['Reviews']
users_collection = db['Users']
blacklist = db['blacklist']

'''
Creates unique index for username and email in users collection.
This ensures that no two admins can have the same username or email.
Create unique index for review_id in reviews collection.
This ensures that no two reviews can have the same review_id.
Create unique index for place_id in places collection.
This ensures that no two places can have the same place_id.
'''
users_collection.create_index([('username', 1)], unique=True)
users_collection.create_index([('email', 1)], unique=True)
users_collection.create_index([('user_id', 1)], unique=True)
reviews_collection.create_index([('review_id', 1)], unique=True)
places_collection.create_index([('place_id', 1)], unique=True)


# JWT Authentication, A decorator to check for a valid token.
# Here, we are using JWT authentication to ensure that only logged in admins can access the endpoints.
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

# Admin Authentication, A decorator to check for a valid admin token.
# Here, we are usiong JWT authentication to ensure only admins can access certain endpoints.
def admin_required(func):
    @wraps(func)
    def admin_required_wrapper(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = data['id']
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            if user['role'] != 'admin':
                return jsonify({'message': 'You are not authorized to access this endpoint'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 401
        return func(*args, **kwargs)
    return admin_required_wrapper

# API Endpoints

# Checking for database connectivity.
@app.route('/api/db_connectivity', methods=['GET'])
def databaseStats():
    return client.user.command('ping')

# Checking for server connectivity.
@app.route('/api/server_connectivity', methods=['GET'])
def serverStats():
    return make_response(jsonify({'message': 'Flask API is working!'}))


'''
This endpoint gets all places based on the query parameters.

Implementation:
If categories are provided, filter by categories
If a search term is provided, filter by name
If a sort order is provided, sort the results
If all three are provided, filter by all of them.

If no filter is provided, return all places.
'''
@app.route('/api/places', methods=['GET'])
@jwt_required
def get_places():
    try:
        sort = request.args.get('sort')
        search = request.args.get('search')
        categories = request.args.getlist('categories')

        # Build the query
        query = {}
        if categories:
            query["categories"] = {"$all": categories}
        if search:
            # case insensitive search
            query["site_name"] = {"$regex": search, "$options": "i"}

        # Execute the query and sort the results
        places = list(places_collection.find(query))

         # Sort the results
        if sort == 'site_name':
            places.sort(key=lambda x: x.get(sort), reverse=False)  # Ascending order for names
        elif sort == 'rating':
            places.sort(key=lambda x: x.get(sort), reverse=True)  # Descending order for ratings
       
        # Convert ObjectId to string
        for place in places:
            place['_id'] = str(place['_id'])

        return make_response(jsonify(places), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

'''
This function returns all reviews with user and place details.

Implementation:
It performs left outer join on reviews and users collection
And deconstructs the user array to get the user details
And in the end combines the user details with the reviews.

This function contains a parameter called user_id,
Now that is used here to get the reviews for a particular user.
but this is for internal use only, so it is not exposed to the frontend.
This function is called in the get_my_reviews function and get_all_reviews function.

Note: This function is overloaded, if the user_id is not provided, it returns all the reviews(to the caller).
'''
def get_reviews_with_details(user_id = None):
    try:
        pipeline = [
            {
                "$lookup": {
                    "from": "Users",
                    "localField": "user_id",
                    "foreignField": "user_id",
                    "as": "user"
                }
            },
            {
                "$lookup": {
                    "from": "Places",
                    "localField": "place_id",
                    "foreignField": "place_id",
                    "as": "place"
                }
            },
            {"$unwind": "$user"},
            {"$unwind": "$place"},
            {
                "$project": {
                    "_id": 1,
                    "review_id": 1,
                    "rating": 1,
                    "timestamp": 1,
                    "user_id": 1,
                    "place_id": 1,
                    "text": 1,
                    "user_name": "$user.fullname",
                    "user_profile_photo": "$user.profile_photo",
                    "place_name": "$place.site_name",
                    "likes": 1,
                    "edited": 1
                }
            },
            {
                "$sort": {"timestamp": -1}
            }
        ]

        # If user_id is provided, filter by user_id
        if user_id is not None:
            pipeline.insert(0, {"$match": {"user_id": user_id}})

        reviews = list(reviews_collection.aggregate(pipeline))

        # Convert ObjectId to string and Decimal to float
        for review in reviews:
           review['_id'] = str(review['_id'])
           review['rating'] = float(Decimal128.to_decimal(review['rating']))

        return reviews
    except Exception as e:
        print(e)
        return (str(e))


@app.route('/api/reviews', methods=['GET'])
@jwt_required
def get_all_reviews():
    try:
        reviews = get_reviews_with_details()
        return make_response(jsonify(reviews), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

#Get reviews for a user
@app.route('/api/myreviews/<user_id>', methods=['GET'])
@jwt_required
def get_my_reviews(user_id):
    try:
        reviews = get_reviews_with_details(user_id)
        return make_response(jsonify(reviews), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

'''
This endpoint gets the reviews liked by a user.
This endpoint performs iterative queries to get the reviews liked by a user.

Implementation:
At first, it gets the user details from the users collection.
Then it gets the review ids of liked reviews from the user details.
Then it gets the reviews from the reviews collection using the review ids.
'''
@app.route('/api/liked-reviews/<user_id>', methods=['GET'])
@jwt_required
def get_liked_reviews(user_id):
    try:
        user = users_collection.find_one({"user_id": user_id})
        liked_reviews_ids = user.get('liked_reviews', [])
        all_reviews = get_reviews_with_details()

        # Filtering the reviews to get the reviews liked by the user
        liked_reviews = [review for review in all_reviews if review['review_id'] in liked_reviews_ids]

        return make_response(jsonify(liked_reviews), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

# Get reviews for a place by place_id.
@app.route('/api/places/<place_id>/reviews', methods=['GET'])
def get_reviews_for_place(place_id):
    try:
        reviews = list(reviews_collection.find({"place_id": int(place_id)}))

        # Convert ObjectId to string and Decimal to float (This fixes the JSON serializable error)
        for review in reviews:
           review['_id'] = str(review['_id'])
           review['rating'] = float(Decimal128.to_decimal(review['rating']))

        return make_response(jsonify(reviews), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

# Get user by user_id
@app.route('/api/users/<user_id>', methods=['GET'])
@jwt_required
def get_user_by_id(user_id):
    try:
        user = users_collection.find_one({"user_id": user_id})
        if user:
            # Convert ObjectId to string
            user['_id'] = str(user['_id'])
            return make_response(jsonify(user))
        else:
            return make_response(jsonify({'error': 'User not found'}), 404)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

# Get review by review_id
@app.route('/api/reviews/<review_id>', methods=['GET'])
@jwt_required
def get_review_by_id(review_id):    
    try:
        data = reviews_collection.find_one({"review_id": review_id})
        if data:
            # Convert ObjectId to string
            data['_id'] = str(data['_id'])
            data['rating'] = float(Decimal128.to_decimal(data['rating']))
            return make_response(jsonify(data))
        else:
            return make_response(jsonify({'error': 'Review not found'}), 404)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

'''
This endpoint gets all reviews for a place and adds the user details to each review.

Implementation:
This perform left outer join on reviews and users collection
And deconstructs the user array to get the user details
And in the end combines the user details with the reviews.
'''
@app.route('/api/places/<place_id>/reviews-with-user-details', methods=['GET'])
@jwt_required
def get_reviews_with_user_details(place_id):
    try:
        pipeline = [
            {"$match": {"place_id": int(place_id)}},
            {"$lookup": {
                "from": "Users",
                "localField": "user_id",
                "foreignField": "user_id",
                "as": "user"
            }},
            {"$unwind": "$user"},
            {"$addFields": {
                "user._id": {"$toString": "$user._id"},
                "rating": {"$toDouble": "$rating"}
            }}
        ]

        reviews = list(reviews_collection.aggregate(pipeline))

        # Convert ObjectId to string and Decimal to float
        for review in reviews:
            review['_id'] = str(review['_id'])
            review['rating'] = float(review['rating'])

        return make_response(jsonify(reviews), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

# Get place by place_id
@app.route('/api/place/<place_id>', methods=['GET'])
@jwt_required
def get_place_by_place_id(place_id):
    try:
        place = places_collection.find_one({"place_id": int(place_id)})
        if place:
            # Convert ObjectId to string
            place['_id'] = str(place['_id'])
            return make_response(jsonify(place))
        else:
            return make_response(jsonify({'error': 'Place not found'}), 404)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)
'''
This endpoint adds a new review to the reviews collection.

Implementation:
It gets the review details from the front end.
Then it creates a new review in the reviews collection.
'''
@app.route('/api/add-review', methods=['POST'])
@jwt_required
def add_review():
    try: 
        data = request.get_json()
        place_id = data.get('place_id')
        text = data.get('text')
        rating = data.get('rating')
        user_id = data.get('user_id')
        likes = data.get('likes')
        timestamp = data.get('timestamp')

        # Create a new review in reviews collection
        review_id = 'r'+ str(reviews_collection.count_documents({}) + random.randint(1, 1000000))
        new_review = {
            'place_id': place_id,
            'review_id' : review_id,
            'text': text,
            'rating': Decimal128(str(rating)),
            'user_id': user_id,
            'likes': likes,
            'timestamp': str(timestamp)
        }
        reviews_collection.insert_one(new_review)
        return make_response(jsonify({'message': 'Review added successfully', 
                                      'review_id': review_id}), 201)
    except Exception as e:
        return make_response(jsonify({'error': e}), 500)

'''
This endpoint deletes a review from the reviews collection.

Implementation:
It gets the review_id from the front end.
Then it deletes the review from the reviews collection by using the review_id.
'''
@app.route('/api/delete-review/<review_id>', methods=['DELETE'])
@jwt_required
def delete_review(review_id):
    try:
        reviews_collection.delete_one({"review_id": review_id})
        return make_response(jsonify({'message': 'Review deleted successfully'}), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

'''
This endpoint updates a review in the reviews collection.

Implementation:
It gets the review details from the front end.
Then it updates the review in the reviews collection by using the review_id.
'''
@app.route('/api/update-review', methods=['PUT'])
@jwt_required
def update_review():
    try:
        data = request.get_json()
        review_id = data.get('review_id')
        text = data.get('text')
        rating = data.get('rating')
        timestamp = data.get('timestamp')

        # Update the review in reviews collection
        # Here I have added a new field called edited to keep track of the reviews that have been edited.
        result = reviews_collection.update_one({
            "review_id": review_id}, 
            {"$set": {
                "text": text,
                "rating": Decimal128(str(rating)), 
                "timestamp": str(timestamp),
                "edited": True
                }
            })
        if result.matched_count > 0:
            return make_response(jsonify({'message': 'Review updated successfully'}), 201)
        else:
            return make_response(jsonify({'message': 'No matching review found'}), 404)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)



'''
This endpoint sets the likes for a review.

Implementation:
It gets the user details from the users collection.
Then it checks if the user has already liked the review.
If the user has already liked the review, it returns an error.
If the user has not liked the review, it increments the likes by 1.

In case of dislike, it decrements the likes by 1.
In case of like, it increments the likes by 1.
'''
@app.route('/api/user-review-feedback', methods=['PUT'])
@jwt_required
def user_review_feedback():
    try:
        # Factor to increment or decrement the likes by.
        factor = 1
        data = request.get_json()
        user_id = data.get('user_id')
        review_id = data.get('review_id')
        feedback = data.get('feedback')

        # Set the factor based on the feedback
        if (feedback == 'Like') and (review_id not in users_collection.find_one({"user_id": user_id})['liked_reviews']):
            factor = 1
            users_collection.update_one({"user_id": user_id}, {"$push": {"liked_reviews": review_id}})
        elif (feedback == 'Dislike') and (review_id in users_collection.find_one({"user_id": user_id})['liked_reviews']):
            factor = -1
            users_collection.update_one({"user_id": user_id}, {"$pull": {"liked_reviews": review_id}})
        else:
            return make_response(jsonify({'message': 'Review '+ feedback +' failed'}), 400)

        reviews_collection.update_one({"review_id": review_id}, {"$inc": {"likes": factor}})
        return make_response(jsonify({'message': 'Review '+ feedback +' success'}), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)


#################### Admin Endpoints ####################
'''
This endpoint adds a new place to the places collection.

Implementation:
It gets the place details from the front end.
Then it creates a new place in the places collection.
'''
@app.route('/api/add-place', methods=['POST'])
@admin_required
def add_place():
    # Generate a unique place_id
    while True:
        place_id = places_collection.count_documents({}) + random.randint(1, 1000000)
        if not places_collection.find_one({'place_id': place_id}):  # If the place_id is not already used
            break
    try:
        data = request.get_json()
        site_name = data.get('site_name')
        summary = data.get('summary')
        description = data.get('description')
        location = data.get('location')
        latitude = location.get('latitude')
        longitude = location.get('longitude')
        type = data.get('type', [])
        tags = data.get('tags', [])
        address = data.get('address')
        address_1 = address.get('address_1')
        address_2 = address.get('address_2')
        address_3 = address.get('address_3')
        postcode = address.get('postcode')
        website = data.get('website', [])
        email = data.get('email')
        phone = data.get('phone')
        categories = data.get('categories', [])
        venue_description = data.get('venue_description')
        all_weather = data.get('all_weather')
        opening_times = data.get('opening_times')
        accessibility = data.get('accessibility')
        pet_friendly = data.get('pet_friendly')
        parking = data.get('parking')
        visit_time = data.get('visit_time')
        uprn = data.get('uprn')
        google_map_link = data.get('google_map_link')
        walk_time_bus = data.get('walk_time_bus')
        nearest_bus_stop = data.get('nearest_bus_stop')
        walk_time_train = data.get('walk_time_train')
        nearest_train_station = data.get('nearest_train_station')
        directions = data.get('directions')
        nearest_bus_service = data.get('nearest_bus_service')
        image = data.get('image')
        cost_free = data.get('cost_free')
        cost_details = data.get('cost_details')
        rating = float(data.get('rating'))
        
        # Create a new place in places collection
        new_place = {
            'site_name': site_name,
            'place_id': place_id,
            'location_id': place_id,
            'summary': summary,
            'description': description,
            'location': {
                'latitude': latitude,
                'longitude': longitude,
            },
            'type': type,
            'tags': tags,
            'address': {
                'address_1': address_1,
                'address_2': address_2,
                'address_3': address_3,
                'postcode': postcode,
            },
            'website': website,
            'email': email,
            'phone': phone,
            'categories': categories,
            'venue_description': venue_description,
            'all_weather': all_weather,
            'opening_times': opening_times,
            'accessibility': accessibility,
            'pet_friendly': pet_friendly,
            'parking': parking,
            'visit_time': visit_time,
            'uprn': uprn,
            'google_map_link': google_map_link,
            'walk_time_bus': walk_time_bus,
            'nearest_bus_stop': nearest_bus_stop,
            'walk_time_train': walk_time_train,
            'nearest_train_station': nearest_train_station,
            'directions': directions,
            'nearest_bus_service': nearest_bus_service,
            'image': image,
            'cost_free': cost_free,
            'cost_details': cost_details,
            'rating': rating,
        }
        places_collection.insert_one(new_place)

        return make_response(jsonify({'message': 'Place added successfully', 'place_id': place_id}), 201)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

'''
This endpoint deletes a place from the places collection.

Implementation:
It gets the place_id from the front end.
Then it deletes the place from the places collection by using the place_id.
'''
@app.route('/api/delete-place/<place_id>', methods=['DELETE'])
@admin_required
def delete_place(place_id):
    try:
        # Delete the place from places collection
        places_collection.delete_one({"place_id": int(place_id)})

        return make_response(jsonify({'message': 'Place deleted successfully'}), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)


############################ Authentication Endpoints ############################

'''
This endpoint updates the user profile.

Implementation:
It gets the user details from the users collection.
Then it checks if the username is already taken.
If the username is already taken, it returns an error.
If the username is not taken, it updates the user details in the users collection.
'''
@app.route('/api/update-user-profile', methods=['PUT'])
@jwt_required
def update_user_profile():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        fullname = data.get('fullname')
        username = data.get('username')
        email = data.get('email')

         # Check if the username is already taken
        existing_user = users_collection.find_one({"username": username})
        if existing_user and existing_user.get('user_id') != user_id:
            return make_response(jsonify({'message': 'This username is already taken.'}), 400)

        # Update the user in users collection
        result = users_collection.update_one({
            "user_id": user_id}, 
            {"$set": {
                "fullname": fullname,
                "username": username,
                "email": email
                }
            })
        if result.matched_count > 0:
            return make_response(jsonify({'message': 'User updated successfully'}), 200)
        else:
            return make_response(jsonify({'message': 'No matching user found'}), 404)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

'''
This endpoint updates the user password.

Implementation:
It gets the user details from the users collection.
Then it checks if the old password is correct.
If the old password is correct, it updates the password in the users collection.
If the old password is incorrect, it returns an error.
'''
@app.route('/api/change-password', methods=['PUT'])
@jwt_required
def change_password():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        # Check if the old password is correct
        user = users_collection.find_one({'user_id': user_id})
        if user is not None:
            if bcrypt.checkpw(current_password.encode('utf-8'), user['password'].encode('utf-8')):
                hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
                result = users_collection.update_one({
                    "user_id": user_id}, 
                    {"$set": {
                        "password": hashed_password.decode('utf-8')
                        }
                    })
                if result.matched_count > 0:
                    return make_response(jsonify({'message': 'Password changed successfully'}), 200)
                else:
                    return make_response(jsonify({'message': 'No matching user found'}), 404)
            else:
                return make_response(jsonify({'message': 'Password is incorrect'}), 401)
        else:
            return make_response(jsonify({'message': 'User not found'}), 404)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

'''
This endpoint deletes the user account.

Implementation:
It deletes the user from the users collection.
It also deletes all the reviews of the user from the reviews collection.
This prevents the reviews from being unassigned to any user.
We could also update the reviews collection to assign the reviews to a placeholder user (like 'deleted_user').
'''
@app.route('/api/delete-user-account/<user_id>', methods=['DELETE'])
@jwt_required
def delete_user_account(user_id):
    try:
        users_collection.delete_one({"user_id": user_id})
        reviews_collection.delete_many({"user_id": user_id})
        return make_response(jsonify({'message': 'User deleted successfully'}), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

'''
This endpoint signs up a new user.

Implementation:
It checks if the username is already taken, and create a new user in the users collection.
If the username is already taken, it returns an error.
'''
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    fullname = data.get('fullname')
    password = data.get('password')
    email = data.get('email')
    role = data.get('role')
    profile_photo = data.get('profile_photo')

    # Check if the username is already taken
    if users_collection.find_one({'email': email}):
        return jsonify({'message': 'An account is already registered with this email. Please log in instead.'}), 400

    if not password:
        return jsonify({'message': 'Password is required.'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Create a new user in users collection
    new_user = {
        'fullname': fullname,
        'user_id' : 'u'+ str(users_collection.count_documents({}) + random.randint(1, 1000000)),
        'username': username,
        'role': role,
        'password': hashed_password.decode('utf-8'),
        'email': email,
        'profile_photo': profile_photo,
        'liked_reviews': []
    }
    result = users_collection.insert_one(new_user)
    return make_response(jsonify({'message': 'user created successfully!', 'user_id': str(result.inserted_id)}), 201)


'''
This endpoint logs in an existing user.

Implementation:
It checks if the username or email exists in the users collection.
If the username or email exists, it checks if the password is correct. 
'''
@app.route('/api/login', methods=['POST'])
def login():
    try:
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
                    'role': user['role'],
                    'iat': datetime.datetime.utcnow(),
                    'exp': datetime.datetime.utcnow() + datetime. timedelta(hours=24)
                }, app.config['SECRET_KEY'])
                return make_response(jsonify({'token': token, 'user_id': user['user_id']}), 200)
            else:
                return make_response(jsonify({'message': 'Password is incorrect'}), 401)
        else:
            return make_response(jsonify({'message': 'Username or email not found. Please check your credentials or sign up to create a new account.'}), 401)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

'''
This endpoint logs out a user.

Implementation:
It logs out a user by invalidating the token and adding to the blacklist collection.
This way we can keep track of the invalidated tokens.
'''
@app.route('/api/logout', methods=['GET'])
@jwt_required
def logout():
    token = request.headers['x-access-token']
    blacklist.insert_one({"token": token})
    return make_response(jsonify({'message': 'Logout successful'}),200)

'''
This endpoint retrieves and returns the logged in user details.

Implementation:
It gets the token from the headers and then decode and validates it.
If valid, decode the token and get the user_id.
Then fetch the user data from the users collection by using that user_id.
'''
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
                'user_id': user['user_id'], 
                'username': user['username'],
                'places': user['places'] if 'places' in user else [],
                'role': user['role'],
                'email': user['email'],
                'profile_photo': user['profile_photo'],
                'liked_reviews': user['liked_reviews'] if 'liked_reviews' in user else []
            }), 200
        else:
            # If the user does not exist, return an     error
            return make_response(jsonify({'message': 'user not found'}), 404)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)
    

if __name__ == '__main__':
    app.run(debug=True)