// This file contains all utility functions used in the application.

// Import.
import {Gender} from "../interface/constants";

/**
 *  This function returns the profile photo uri of the user.
 * 
 * @param user The user whose profile photo is to be returned. 
 * @returns The profile photo uri of the user.
 */
export function getProfilePhotoUri(user: any): any {
    let imageUri = "../../assets/avatar_placeholder.png";
    if (user) {
      imageUri = "../../assets/" + user.profilePhoto;
    }
    return (imageUri);
}

/**
 * This function returns the profile photo i.e. the image name for the gender provided.
 * 
 * @param gender The gender for which the name is to be returned.
 * @returns The image name.
 */
export function getProfilePhotoName(gender: Gender) {
    console.log(gender)
    let profilePhotoName = 'avatar_placeholder.png';
    switch(gender) {
      case Gender.Female:
        profilePhotoName = 'female.png';
        break;
      case Gender.Male:
        profilePhotoName = 'male.png';
        break;
      default:
        profilePhotoName = 'avatar_placeholder.png';
    }

    return profilePhotoName;
  }

/**
 * This function returns an array of stars based on the rating.
 * 
 * @param rating  Rating of the place
 * @returns  Array of stars
 */
export function getStars(rating: number) {
  let stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(1);
    } else if (i - rating < 1) {
      stars.push(0.5);
    } else {
      stars.push(0);
    }
  }
  return stars;
}

/**
 * This function returns the list of available categories for the places.
 * 
 * @returns The list of categories.
 */
export function getAllCategories() {
  const categories = [
    "All","attraction", "arts and culture", 
    "open spaces", "family friendly", "venue for events", 
    "food - drink producer", "nature - environment", "history - heritage", 
    "active lifestyles - sports", "shopping - retail"
  ]
  return categories;
}

/**
 * This function returns the data for the places dialogue.
 * 
 * @param data The data to be displayed in the dialogue.
 * 
 * @returns The data for the places dialogue.
 * 
 * This helps in managing the data to be displayed in the places dialogue.
 */
export function getPlacesDialogueData(data: any) {
  console.log(data);
  let details = [
    { property: 'Summary', value: data.summary },
    { property: 'Rating', value: data.rating },
    { property: 'Location', value: `Latitude: ${data.location.latitude}, Longitude: ${data.location.longitude}` },
    { property: 'Address', value: `${data.address.address_1}, ${data.address.address_2}, ${data.address.address_3}, ${data.address.postcode}` },
    { property: 'Categories', value: data.categories.join(', ') },
    { property: 'Type', value: data.type.join(', ') },
    { property: 'Tags', value: data.tags.join(', ') },
    { property: 'Website', value: data.website.join(', ') },
    { property: 'Email', value: data.email },
    { property: 'Phone', value: data.phone },
    { property: 'UPRN', value: data.uprn },
    { property: 'Venue Description', value: data.venue_description },
    { property: 'All Weather', value: data.all_weather },
    { property: 'Opening Times', value: data.opening_times },
    { property: 'Accessibility', value: data.accessibility },
    { property: 'Pet Friendly', value: data.pet_friendly },
    { property: 'Parking', value: data.parking },
    { property: 'Visit Time', value: data.visit_time },
    { property: 'Google Map Link', value: data.google_map_link },
    { property: 'Nearest Bus Stop', value: `${data.nearest_bus_stop} (${data.walk_time_bus} walk)` },
    { property: 'Nearest Train Station', value: `${data.nearest_train_station} (${data.walk_time_train} walk)` },
    { property: 'Directions', value: data.directions },
    { property: 'Nearest Bus Service', value: data.nearest_bus_service },
    { property: 'Cost Details', value: data.cost_details },
  ];
  return details;
}