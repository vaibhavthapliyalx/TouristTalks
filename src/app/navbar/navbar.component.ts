import { Component } from '@angular/core';
import { Gender } from 'src/interface/commonInterface';
import { getProfilePhotoUri } from 'src/utils/utilityfunctions';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  user: any; // replace with actual user data
  photoUri: string;
  navigation = [
    { name: 'Home', href: '/' },
    { name: 'Places', href: '/places' },
  ];
  constructor() {
    this.photoUri = "../../assets/avatar_placeholder.png"; // By deafult.
  }
  getProfilePhotoUri(user?: any) {
    if (!user) {
      return this.photoUri;
    }
    user.gender = Gender.Male;
    return getProfilePhotoUri(user);
  }

  onLogout() {
    // Replace with actual implementation
  }
  onNgInit() {
  }
}