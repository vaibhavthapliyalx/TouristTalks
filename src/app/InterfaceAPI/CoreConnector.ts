// This class is an interface to connect to the backend.
import {HttpClient} from "@angular/common/http";
import { Injectable } from '@angular/core';

/**
 * Provides functions to connect to the backend.
 */
@Injectable()
export default class CoreConnector {
  server_uri = "http://127.0.0.1:5000";
  constructor(private http: HttpClient) {
    console.log("CoreConnector initalised!");
  }

  /**
   * Gets Database connection status.
   * @returns Promise<void>
   */
  getDatabaseConnectionStatus(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.server_uri}/api/db_connectivity`).subscribe({
        next: res => resolve(res),
        error: err => reject(err)
      });
    });
  }

   /**
    *  Gets Server connection status.
    * @returns Promise<void>
    */
   async getServerConnectionStatus() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.server_uri}/api/server_connectivity`).subscribe({
        next: res => resolve(res),
        error: err => reject(err)
      });
    });
   }  

  //  async signup({fullName, username, password, profilePhoto, email}: Admin): Promise<string> {
  //   return new Promise<string>((resolve, reject) => {
  //       console.log('Signup Data:', {fullName,username,email, password, profilePhoto});
  //       axios.post('/api/signup', {
  //         fullname: fullName,
  //         username : username,
  //         password : password,
  //         email: email,
  //         profile_photo : profilePhoto,
  //       })
  //       .then((result:any) => {
  //         resolve(result);
  //       })
  //       .catch((error:any) => {
  //         reject(error.response.data);
  //       })
  //   });
  // }
  

  // // Function to handle user login
  // async login(username: string, password: string): Promise<Admin> {
  //   return new Promise<Admin>((resolve, reject) => {
  //     axios.post('/api/login', {
  //       username: username,
  //       password: password,
  //     })
  //     .then((response:any) => {
  //       const admin: Admin = {
  //         id: response.data.admin_id,
  //         fullName: response.data.full_name,
  //         email: response.data.email,
  //         username: response.data.username,
  //         password: response.data.password,
  //         profilePhoto: response.data.profile_photo,
  //       };
  //       // Store the token in local storage
  //       localStorage.setItem('token', response.data.token);
  //       resolve(admin);
  //     })
  //     .catch((error:any) => {
  //       reject(error.response.data);
  //     });
  //   });
  // }   

  // // Function to handle user logout
  // async logout(): Promise<void> {
  //   return new Promise<void>(async (resolve, reject) => {
  //     const token = localStorage.getItem('token'); // Get the token from local storage
  //     axios.get('/api/logout', {
  //       headers: {
  //         'x-access-token': token // Send the token in the headers
  //       }
  //     })
  //     .then((response:any) => {
  //       localStorage.removeItem('token'); // Remove the token from local storage
  //       resolve(response);
  //     })
  //     .catch((error:any) => {
  //       reject(error.response.data);
  //     });
  //   });
  // }

  // /**
  //  *  Gets the logged in admin object.
  //  * @returns Promise<Admin>
  //  */
  // async getLoggedInAdmin(): Promise<Admin> {
  //   return new Promise<Admin>((resolve, reject) => {
  //     const token = localStorage.getItem('token'); // Get the token from local storage
  //     console.log("Token:", token);
  //     axios.get('/api/logged-in-admin', {
  //       headers: {
  //         'x-access-token': token // Send the token in the headers
  //       }
  //     })
  //     .then((response:any) => {
  //       const admin: Admin = {
  //         id: response.data.id,
  //         fullName: response.data.fullname,
  //         email: response.data.email,
  //         username: response.data.username,
  //         profilePhoto: response.data.profile_photo,
  //       };
  //       resolve(admin);
  //     })
  //     .catch((error:any) => {
  //       reject(error.response.data);
  //     });
  //   });
  // }
}
