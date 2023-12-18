import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { User } from 'src/interface/constants';
import ApiConnector from '../APIConnector/ApiConnector';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  isLoading = false;
  errorMessage: string | null;
  user: User | undefined;
  editProfile = false;
  changePassword = false;
  currentPassword = '';
  newPassword = '';
  isSubmitting = false;
  isVerifying = false;

  constructor(private http: HttpClient, private apiConnector: ApiConnector, private router: Router) {
    this.errorMessage = null;
   }

   /**
    * Fetch user data when the component is mounted.
    */
  ngOnInit(): void {
    this.getUserData();
  }

  /**
   * Fetch the logged in user's data.
   * 
   * If the user is not logged in, redirect to the login page.
   */
  getUserData(): void {
    this.isLoading = true;
    this.apiConnector.getLoggedInUser()
    .then((res: any) => {
      this.user = res;
    })
    .catch((err: any) => {
      this.router.navigate(['/login']);
      console.log(err);
    })
    .finally(() => {
      // Set isLoading to false to hide the loading progess bar.
      // This is being done with a timeout of 1500ms,
      // so that the spinner is shown for at least 1500ms.
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    });
  }

  /**
   * Update the user's profile.
   */
  saveProfile(): void {
    this.isSubmitting = true;
    console.log(this.user);
    if(this.user?.id && this.user?.fullName && this.user?.email && this.user?.username){
        this.apiConnector.updateProfile(this.user.id, this.user.fullName, this.user.email, this.user.username)
        .then((res: any) => {
          this.editProfile = false;
          this.isLoading = true;
          console.log(res);
        })
        .catch((err: any) => {
          this.errorMessage = err;
          console.log(err);
        })
        .finally(() => {
          // Set isLoading to false to hide the loading progess bar.
          // This is being done with a timeout of 1500ms,
          // so that the spinner is shown for at least 1500ms.
          setTimeout(() => {
            this.isLoading = false;
            this.isSubmitting = false;
          }, 500);
        });
      }
    }

  /**
   * Verify the current password and if valid change the password.
   */
  verifyAndChangePassword(): void {
    this.isVerifying = true;
    
    if(this.user?.id && this.currentPassword && this.newPassword) {
      this.apiConnector.changePassword(this.user.id, this.currentPassword, this.newPassword)
      .then((res: any) => {
        this.changePassword = false;
        this.isLoading = true;
        console.log(res);
      })
      .catch((err: any) => {
        this.errorMessage = err;
        console.log(err);
        
      })
      .finally(() => {
        // Set isLoading to false to hide the loading progess bar.
        // This is being done with a timeout of 1500ms,
        // so that the spinner is shown for at least 1500ms.
        setTimeout(() => {
          this.isVerifying = false;
          this.isLoading = false;
          
          
        }, 500);
      });
    }
  }

  /**
   * Delete the user's account.
   */
  deleteAccount(): void {
    const confirmation = confirm('Are you sure? Do you really want to delete your account?');

    if (confirmation && this.user?.id) {
      this.isLoading = true;
      this.apiConnector.deleteAccount(this.user.id)
      .then((res: any) => {
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
        
        console.log(res);
      })
      .catch((err: any) => {
        this.isLoading = false;
        console.log(err);
      })
    }
  }
}
