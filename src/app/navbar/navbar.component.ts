import { Component } from '@angular/core';
import { User } from 'src/interface/constants';
import { getProfilePhotoUri } from 'src/utils/utilityfunctions';
import ApiConnector from '../APIConnector/ApiConnector';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  user: User;
  photoUri: string;
  constructor(private apiConnector: ApiConnector) {
    console.log("NavbarComponent initialised!");
    this.photoUri = "../../assets/avatar_placeholder.png"; // By default.
    this.user = {} as User;
  }

  // This function is called when the component is loaded.
  // It gets the logged in user from the backend.
  getLoggedInUser() {
    this.apiConnector.getLoggedInUser()
      .then((res: any) => {
        this.user = res;
        this.photoUri = getProfilePhotoUri(this.user);
      })
      .catch((err: any) => {
        console.log(err);
      });
  
  }

  /**
   * Logout the user.
   */
  onLogout() {
    this.apiConnector.logout()
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  /**
   * Get the user's reviews.
   */
  onMyReviewsBtnClick() {
    console.log("My Reviews button clicked!");

    this.apiConnector.getMyReviews("u101")
    .then((res: any) => {
      console.log(res);
    })
    .catch((err: any) => {
      console.log(err);
    });
  }

  /**
   * Fetch the user on compoenent mount.
   */
  ngOnInit() {
    this.getLoggedInUser();
  }
}