import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import ApiConnector from './APIConnector/ApiConnector';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private apiConnector: ApiConnector, private router: Router) {
    console.log("AuthGuard initialized");
   }

  /**
   *  Function to check if the user is logged in or not
   *  If the user is logged in, then return true, otherwise redirect to login page
   *  and return false
   * @returns  Promise<boolean>
   */
  canActivate: CanActivateFn =  () => {
    try {
      return this.apiConnector.getLoggedInUser()
        .then(() => {
          return true;
        })
        .catch(() => {
          this.router.navigate(['/login']);
          return false;
        });
    } catch (error) {
      this.router.navigate(['/login']);
      return false;
    }
  }
}