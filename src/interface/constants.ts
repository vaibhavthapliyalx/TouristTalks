//  This file contains the interfaces and enums used in this application.

/**
 * Defines gender for user.
 * 
 * @member Male 
 * @member Female
 * @member Other
 */
export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other"
}

/**
 * Defines feedback type.
 * 
 * @member Like 
 * @member Dislike
 */
export enum FeedbackType {
  Like = "Like",
  Dislike = "Dislike"
}

/**
 * Defines the type of the review.
 *
 * @member id The id of the review.
 * @member role The role of the user.
 * @member places The places the user has access to.
 * @member fullName The full name of the user.
 * @member gender The gender of the user.
 * @member username The username of the user.
 * @member password The password of the user.
 * @member email The email of the user.
 * @member profilePhoto The profile photo of the user.
 * @member likedReviews The reviews liked by the user.
 */
export interface User {
  id?: string;
  role?: string;
  places?: string[];
  fullName: string;
  gender?: Gender;
  username: string;
  password?: string;
  email: string;
  profilePhoto?: string;
  likedReviews?: string[];
}

/**
 * Defines the places in the database.
 * 
 * @member _id The id of the place.
 * @member place_id The place id of the place.
 * @member site_name The site name of the place.
 * @member summary The summary of the place.
 * @member description The description of the place.
 * @member location_id The location id of the place.
 * @member location The location of the place.
 * @member type The type of the place.
 * @member tags The tags of the place.
 * @member address The address of the place.
 * @member website The website of the place.
 * @member email The email of the place.
 * @member phone The phone of the place.
 * @member categories The categories of the place.
 * @member venue_description The venue description of the place.
 * @member all_weather The all weather of the place.
 * @member opening_times The opening times of the place.
 * @member accessibility The accessibility of the place.
 * @member pet_friendly The pet friendly of the place.
 * @member parking The parking of the place.
 * @member visit_time The visit time of the place.
 * @member uprn The uprn of the place.
 * @member google_map_link The google map link of the place.
 * @member walk_time_bus The walk time bus of the place.
 * @member nearest_bus_stop The nearest bus stop of the place.
 * @member walk_time_train The walk time train of the place.
 * @member nearest_train_station The nearest train station to place.
 * @member directions The directions of the place.
 * @member nearest_bus_service The nearest bus service of the place.
 * @member image The image of the place.
 * @member cost_free The cost free of the place.
 * @member cost_details The cost details of the place.
 * @member rating The rating of the place.
 * @member showDetails The show details flag that determines to display the details or not.
 *
 */
export interface Place {
  _id: string;
  place_id: number;
  site_name: string;
  summary: string;
  description: string;
  location_id: number;
  location: {
    latitude: string;
    longitude: string;
  };
  type: string[];
  tags: string[];
  address: {
    address_1: string;
    address_2: string;
    address_3: string;
    postcode: string;
  };
  website: string[];
  email: string;
  phone: string;
  categories: string[];
  venue_description: string;
  all_weather: string;
  opening_times: string;
  accessibility: string;
  pet_friendly: string;
  parking: string;
  visit_time: string;
  uprn: number;
  google_map_link: string;
  walk_time_bus: string;
  nearest_bus_stop: string;
  walk_time_train: string;
  nearest_train_station: string;
  directions: string;
  nearest_bus_service: string;
  image: string;
  cost_free: null;
  cost_details: string;
  rating: number;
  showDetails?: boolean;
}

export interface Review {
  _id?: string;
  place_id: number;
  place_name?: string;
  review_id?: string;
  user_id: string;
  text: string;
  timestamp: string;
  likes: number;
  rating: number;
  liked?: boolean;
  user?: User;
  edited?: boolean;
}


