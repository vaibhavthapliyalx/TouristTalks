// This class is an interface to connect to the backend.
import {HttpClient} from "@angular/common/http";
import { Injectable } from '@angular/core';
import { User } from "src/interface/commonInterface";

/**
 * Provides functions to connect to the backend.
 */
@Injectable()
export default class CoreConnector {
  constructor(private http: HttpClient) {
    console.log("CoreConnector initalised!");
  }

  /**
   * Gets Database connection status.
   * @returns Promise<void>
   */
  getDatabaseConnectionStatus(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get('api/db_connectivity').subscribe({
        next: res => resolve(res),
        error: err => reject(err.response.data)
      });
    });
  }

  /**
   *  Gets Server connection status.
   * @returns Promise<void>
   */
  async getServerConnectionStatus() {
   return new Promise((resolve, reject) => {
     this.http.get('api/server_connectivity').subscribe({
       next: res => resolve(res),
       error: err => reject(err.response.data)
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
  async signup({fullName, username, password, profilePhoto, email}: User) {
    return new Promise((resolve, reject) => {
      this.http.post('api/signup', {
        fullname: fullName,
        username : username,
        password : password,
        email: email,
        profile_photo : profilePhoto,
      })
      .subscribe({
        next: response => resolve(response),
        error: err => reject(err.response.data) 
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
          const user: User = {
            id: response.data.admin_id,
            fullName: response.data.full_name,
            email: response.data.email,
            username: response.data.username,
            password: response.data.password,
            profilePhoto: response.data.profile_photo,
          };
          // Store the token in local storage
          localStorage.setItem('token', response.data.token);
          resolve(user);
        },
        error: err => reject(err.response.data)
      });
    });
  }

  /**
   *  Logout User, Sends a GET request to the backend.
   * 
   * @returns Promise<void>
   */
  async logout() {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token'); // Get the token from local storage
      this.http.get('api/logout', {
        headers: {
          'x-access-token': token || '' // Send the token in the headers
        },
      })
      .subscribe({
        next: (response) => {
          localStorage.removeItem('token'); // Remove the token from local storage
          resolve(response);
        },
        error: err => reject(err.response.data)
      });
    });
  }

  /**
   *  Get User, Sends a GET request to the backend.
   * 
   * @returns Promise<void>
   */
  async getLoggedInUser() {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token'); // Get the token from local storage
      this.http.get('api/logged-in-user', {
        headers: {
          'x-access-token': token || '' // Send the token in the headers
        },
      })
      .subscribe({
        next: (response: any) => {
          const user: User = {
            id: response.data.admin_id,
            fullName: response.data.full_name,
            email: response.data.email,
            username: response.data.username,
            password: response.data.password,
            profilePhoto: response.data.profile_photo,
          };
          resolve(user);
        },
        error: err => reject(err.response.data)
      });
    });

  }
}

