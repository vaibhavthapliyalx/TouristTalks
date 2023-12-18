// Main API connector class.
import {HttpClient, HttpParams} from "@angular/common/http";
import { Injectable } from '@angular/core';
import { FeedbackType, Place, Review, User } from "src/interface/constants";


/**
 * @class ApiConnector
 * This class handles all the API calls to the server.
 * 
 * This class is an interface between the frontend and the backend.
 * It wraps all the functions that are used to connect to the backend.
 */

@Injectable()
export default class ApiConnector {
  constructor(private http: HttpClient) {
    console.log("ApiConnector initalised!");
  }

   /**
   *  This function get's the x-access-token from the local storage and returns it as a header.
   * 
   * @returns x-access-token as a header. 
   */
   getXAccessHeader() {
    const token = localStorage.getItem('token'); // Get the token from local storage
    let header = {
      'x-access-token': token || '' // Send the token in the headers
    }
    return header;
  }

  /**
   * Gets Database connection status.
   * 
   * @returns Promise<void>
   */
  getDatabaseConnectionStatus(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.get('api/db_connectivity').subscribe({
        next: res => resolve(res),
        error: err => reject(err.error)
      });
    });
  }

  /**
   * Gets Server connection status.
   * 
   * @returns Promise<void>
   */
  async getServerConnectionStatus() {
   return new Promise<any>((resolve, reject) => {
     this.http.get('api/server_connectivity').subscribe({
       next: res => resolve(res),
       error: err => reject(err.error)
     });
   });
  }

  /**
   * This function gets all the places from the backend.
   * It queries the backend with the sort, search, and categories parameters.
   * If sort is provided, it sorts the places by the sort order.
   * If search is provided, it filters the places by the search term.
   * If categories is provided, it filters the places by the categories.
   * If no parameters are provided, it returns all the places.
   * 
   * @param sort The sort order.
   * @param search The search term.
   * @param categories The categories to filter by.
   * @returns Promise<void>
   */
  async getAllPlaces(sort?: string, searchQuery?: string, categories?: string[]) {
    return new Promise<Place[]>((resolve, reject) => {
      // Create the params object
      let params = new HttpParams();
      if (sort && sort?.length > 0) {
        params = params.append('sort', sort);
      }
      if (searchQuery && searchQuery?.length > 0) {
        params = params.append('search', searchQuery);
      }
      if (categories && categories?.length > 0) {
        categories.forEach(category => {
          params = params.append('categories', category);
        });
      }

      this.http.get('api/places', { params, headers: this.getXAccessHeader() }).subscribe({
        next: (res: any) => {
          let places_list: Place[] = res;
          resolve(places_list);
        },
        error: err => reject(err)
      });
    });
  }

  /**
   * This functon sends a GET request to the backend to retrieve all reviews.
   * 
   * @returns Promise<Review[]>
   */
  async getLatestReviews() {
    return new Promise<Review[]>((resolve, reject) => {
      this.http.get('api/reviews', {headers: this.getXAccessHeader()}).subscribe({
        next: (res: any) => {
          let reviews_list: any[] = [];
          res.map((review: any) => {
            let rev: any = {
              _id: review._id,
              review_id: review.review_id,
              place_id: review.place_id,
              user_id: review.user_id,
              text: review.text,
              timestamp: review.timestamp,
              likes: review.likes,
              rating: review.rating,
              place_name: review.place_name,
              user: {
                id: review.user_id,
                fullName: review.user_name,
                email: '',
                username: '',
                profilePhoto: review.user_profile_photo,
              },
              edited: review.edited
            }
            reviews_list.push(rev);
          });
          resolve(reviews_list);
        },
        error: err => reject(err)
      });
    });
  }

  /**
   * This function gets all revews made by that user.
   * 
   * @param userId  User ID of the user
   * @returns  Promise<void>
   */
  async getMyReviews(userId: string) {
    return new Promise<Review[]>((resolve, reject) => {
      this.http.get('api/myreviews/' + userId, {headers: this.getXAccessHeader()}).subscribe({
        next: (res: any) => {
          let reviews_list: Review[] = res;
          resolve(reviews_list);
        },
        error: (error) => {
          console.log(error);
          reject(error);
        }
      });
    });
  }

  /**
   * This function gets all the reviews made for that place, by using the place ID.
   * 
   * @param placeId Place ID
   * @returns  Promise<void>
   */
  async getReviewsForPlace(placeId: number) {
    return new Promise<Review[]>((resolve, reject) => {
      this.http.get(`api/places/${placeId}/reviews`, {headers: this.getXAccessHeader()}).subscribe({
        next: (res: any) => {
          let reviews_list: Review[] = res;
          resolve(reviews_list);
        },
        error: (error) => {
          console.log(error);
          reject(error);
        }
      });
    });
  }

  /**
   * This functions adds a new review to the review collection in the database.
   * 
   * @param review Review object
   * @returns  Promise<void>
   */
  async addReview(review: Review) {
    return new Promise<any>((resolve, reject) => {
      this.http.post('api/add-review',{
        place_id: review.place_id,
        text: review.text,
        timestamp: review.timestamp,
        likes: review.likes,
        rating: review.rating,
        user_id: review.user_id
      }, {
        headers: this.getXAccessHeader()
      } ).subscribe({
        next: (res: any) => {
          console.log(res);
          resolve(review);
        },
        error: (error) => {
          console.log(error);
          reject(error);
        }
      });
    });
  }

  /**
   * This function deletes the review from the database.
   * 
   * @param reviewId Review ID
   * @returns  Promise<void>
   */
  async deleteReview(reviewId: string) {
    return new Promise<any>((resolve, reject) => {
      this.http.delete(`api/delete-review/${reviewId}`, {
        headers: this.getXAccessHeader()
        }).subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * This function gets all the reviews made for that place, along with the user details.
   * This has been done to reduce the number of requests made to the backend.
   * Which eventually reduces the time taken to load the reviews.
   * 
   * @param placeId Place ID
   * @returns  Promise<void>
   */
  async getReviewsWithUserDetails(placeId: number) {
    return new Promise<Review[]>((resolve, reject) => {
      this.http.get(`api/places/${placeId}/reviews-with-user-details`, {
        headers: this.getXAccessHeader()
        }).subscribe({
        next: (response: any) => {
          let reviews_list: Review[] = [];
          response.map((res: any) => {
            let user: User = {
              id: res.user.user_id,
              fullName: res.user.fullname,
              email: res.user.email,
              username: res.user.username,
              profilePhoto: res.user.profile_photo,
              likedReviews: res.user.liked_reviews
            };
            let review: Review = {
              _id: res._id,
              review_id: res.review_id,
              place_id: res.place_id,
              user_id: res.user_id,
              text: res.text,
              timestamp: res.timestamp,
              likes: res.likes,
              rating: res.rating,
              liked: res.liked,
              user: user,
              edited: res.edited
            };
            reviews_list.push(review);
          });
          resolve(reviews_list);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * This function handles the like operation.
   * This sends a PUT request to the backend and based on the feedback type,
   * the backend either adds or removes the like.
   * 
   * @param reviewId  Review ID
   * @param feedback  Feedback Type
   * @returns Promise<any>
   */
  async pushUserReviewFeedback(reviewId: string, userId: string, feedback: FeedbackType) {
    return new Promise<any>((resolve, reject) => {
      if (!reviewId || !userId || !feedback) {
        reject({
          message: 'Invalid parameters',
          reviewId: reviewId,
          userId: userId,
          feedback: feedback
        });
      }
      this.http.put(`api/user-review-feedback`,{
        review_id: reviewId,
        feedback: feedback,
        user_id: userId,
      }, {
        headers: this.getXAccessHeader()
      }).subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * This function updates the review in the server.
   * It sends a PUT request to the backend.
   * When the review is updated, a new field is added to the review object,
   * which is called 'edited'. This field is used to keep track and
   * display the 'edited' tag in the frontend.
   *  
   * @param review Review object
   * @returns  Promise<void>
   */
  async updateReview(review: Review) {
    console.log('Sending this review to the backend');
    console.log(review);
    return new Promise<any>((resolve, reject) => {
      this.http.put(`api/update-review`,{
        review_id: review.review_id,
        place_id: review.place_id,
        text: review.text,
        timestamp: review.timestamp,
        likes: review.likes,
        rating: review.rating,
        user_id: review.user_id
      }, {headers: this.getXAccessHeader()}).subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * This function sends a PUT request to the backend to update the user's password.
   * 
   * @param userId  User ID
   * @param currentPassword  Current Password
   * @param newPassword  New Password
   * @returns  Promise<void>
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    return new Promise<any>((resolve, reject) => {
      this.http.put(`api/change-password`,{
        user_id: userId,
        current_password: currentPassword,
        new_password: newPassword
      }, {headers: this.getXAccessHeader()}).subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: (error) => {
          reject(error.error.message);
        }
      });
    });
  }

  /**
   *  This function sends a DELETE request to the backend to delete the user's account.
   * 
   * @param userId  User ID
   * @returns  Promise<void>
   */
  async deleteAccount(userId: string) {
    return new Promise<any>((resolve, reject) => {
      this.http.delete(`api/delete-user-account/${userId}`, {headers: this.getXAccessHeader()})
        .subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: (error) => {
          reject(error.error.message);
        }
      });
    });
  }

  /**
   * This function sends a PUT request to the backend to update the user's profile.
   * 
   * @param userId  User ID of the user
   * @param fullName  Full Name of the user
   * @param email  Email of the user
   * @param username  Username of the user
   * @returns  Promise<void>
   */
  async updateProfile(userId: string, fullName: string, email: string, username: string) {
    return new Promise<any>((resolve, reject) => {
      this.http.put(`api/update-user-profile`,{
        user_id: userId,
        fullname: fullName,
        email: email,
        username: username
      }, {headers: this.getXAccessHeader()}).subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: (error) => {
          reject(error.error.message);
        }
      });
    });
  }

  /**
   * This function sends a GET request to the backend to get the user's details by the user ID.
   * 
   * @param userId User ID
   * @returns  Promise<void>
   */
  async getUserByUserId(userId: string) {
    return new Promise<User>((resolve, reject) => {
      this.http.get(`api/users/${userId}`, {headers: this.getXAccessHeader()})
        .subscribe({
        next: (response: any) => {
          const user: User = {
            id: response.user_id,
            places: response.places,
            role: response.role,
            fullName: response.fullname,
            email: response.email,
            username: response.username,
            profilePhoto: response.profile_photo,
            likedReviews: response.liked_reviews
          };
          resolve(user);
        },
        error: (error) => {
          reject(error.error.message);
        }
      });
    });
  }

  /**
   * This function sends a GET request to the backend to get the review by the review ID.
   * 
   * @param reviewId Review ID
   * @returns  Promise<Review>
   */
  async getReviewById(reviewId: string) {
    return new Promise<Review>((resolve, reject) => {
      this.http.get(`api/profile/reviews/${reviewId}`, {headers: this.getXAccessHeader()}).subscribe({
        next: (response: any) => {
          const review: Review = {
            review_id: response.review_id,
            place_id: response.place_id,
            user_id: response.user_id,
            text: response.text,
            timestamp: response.timestamp,
            likes: response.likes,
            rating: response.rating,
            liked: response.liked,
            edited: response.edited
          };
          resolve(review);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * This function sends a GET request to the backend to get the reviews liked by the user,
   * along with the user details.
   * 
   * @param userId User ID
   * @returns  Promise<Review[]>
   */
  async getReviewsLikedByUser(userId: string) {
    return new Promise<Review[]>((resolve, reject) => {
      this.http.get(`api/liked-reviews/${userId}`, {headers: this.getXAccessHeader()})
        .subscribe({
        next: (res: any) => {
          let reviews_list: any[] = [];
          res.map((review: any) => {
            let rev: any = {
              _id: review._id,
              review_id: review.review_id,
              place_id: review.place_id,
              user_id: review.user_id,
              text: review.text,
              timestamp: review.timestamp,
              likes: review.likes,
              rating: review.rating,
              place_name: review.place_name,
              user: {
                id: review.user_id,
                fullName: review.user_name,
                email: '',
                username: '',
                profilePhoto: review.user_profile_photo,
              },
              edited: review.edited
            }
            reviews_list.push(rev);
          });
          resolve(reviews_list);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  async addPlace(place: Place) {
    return new Promise<any>((resolve, reject) => {
      this.http.post('api/add-place', {
        place_id: place.place_id,
        site_name: place.site_name,
        summary: place.summary,
        description: place.description,
        location_id: place.location_id,
        location: place.location,
        type: place.type,
        tags: place.tags,
        address: place.address,
        website: place.website,
        email: place.email,
        phone: place.phone,
        categories: place.categories,
        venue_description: place.venue_description,
        all_weather: place.all_weather,
        opening_times: place.opening_times,
        accessibility: place.accessibility,
        pet_friendly: place.pet_friendly,
        parking: place.parking,
        visit_time: place.visit_time,
        uprn: place.uprn,
        google_map_link: place.google_map_link,
        walk_time_bus: place.walk_time_bus,
        nearest_bus_stop: place.nearest_bus_stop,
        walk_time_train: place.walk_time_train,
        nearest_train_station: place.nearest_train_station,
        directions: place.directions,
        nearest_bus_service: place.nearest_bus_service,
        image: place.image,
        cost_free: place.cost_free,
        cost_details: place.cost_details,
        rating: place.rating,
      }, {
        headers: this.getXAccessHeader()
      }).subscribe({
        next: (res: any) => {
          console.log(res);
          resolve(place);
        },
        error: (error) => {
          console.log(error);
          reject(error);
        }
      });
    });
  }

  async deletePlace(placeId: number) {
    return new Promise<any>((resolve, reject) => {
      this.http.delete(`api/delete-place/${placeId}`, {
        headers: this.getXAccessHeader()
        }).subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  
  /********* Authentication Handlers ************/
  /**
   * Signup User, Sends a POST request to the backend.
   * 
   * @param user  User
   * @returns Promise<void>
   */
  async signup(user: User) {
    return new Promise((resolve, reject) => {
      this.http.post('api/signup', {
        fullname: user.fullName,
        role: user.role,
        username : user.username,
        password : user.password,
        email: user.email,
        profile_photo : user.profilePhoto,
      })
      .subscribe({
        next: response => resolve(response),
        error: err => reject(err.error.message)
      });
    });
  }
  
  /**
   *  Login User, Sends a POST request to the backend.
   * 
   * @param username  Username
   * @param password Password
   * @returns  Promise<void>
   */
  async login(username: string,  password: string) {
    return new Promise((resolve, reject) => {
      this.http.post('api/login', {
        username : username,
        password : password,
      })
      .subscribe({
        next: (response: any) => {
          console.log(response);

          // Store the token in local storage
          localStorage.setItem('token', response.token);
          console.log("User Logged in ");
          resolve(response);
        },
        error: (err: any) => {
          reject(err.error.message)
        }
      });
    });
  }

  /**
   * Logout User, Sends a GET request to the backend.
   * 
   * @returns Promise<void>
   */
  async logout() {
    return new Promise((resolve, reject) => {
      this.http.get('api/logout', {
        headers: this.getXAccessHeader() 
      })
      .subscribe({
        next: (response) => {
          localStorage.removeItem('token'); // Remove the token from local storage
          resolve(response);
        },
        error: err => reject(err.error.message)
      });
    });
  }
  
 

  /**
   * Get User, Sends a GET request to the backend.
   * 
   * @returns Promise<void>
   */
  async getLoggedInUser() {
    return new Promise((resolve, reject) => {
      this.http.get('api/logged-in-user', {
        headers: this.getXAccessHeader(),
      })
      .subscribe({
        next: (response: any) => {
          const user: User = {
            id: response.user_id,
            places: response.places,
            role: response.role,
            fullName: response.fullname,
            email: response.email,
            username: response.username,
            profilePhoto: response.profile_photo,
            likedReviews: response.liked_reviews
          };
          console.log(user);
          resolve(user);
        },
        error: err => reject(err.error.message)
      });
    });
  }
}

