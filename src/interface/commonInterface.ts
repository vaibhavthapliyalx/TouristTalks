export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other"
}

export enum ProfilePhoto {
  Male = "male.png",
  Female = "female.png",
  Default = "avatar_placeholder.png"
}

export interface User {
    id?: string;
    fullName: string;
    gender?: Gender;
    username: string;
    password?: string;
    email: string;
    profilePhoto?: string; // Profile photo is optional
  }
    
  