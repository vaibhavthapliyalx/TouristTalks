import {Gender, ProfilePhoto } from "../interface/commonInterface";

export function getProfilePhotoUri(user: any): any {
    let image = "../../assets/avatar_placeholder.png";
    if (user?.gender) {
        switch (user.profilePhoto) {
          case ProfilePhoto.Female:
            image  = "../../assets/female.png";
            break;
          case ProfilePhoto.Male:
            image = "../../assets/male.png";
            break;
          default:
            image  = "../../assets/avatar_placeholder.png";
        }
    }
    return (image);
}

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

