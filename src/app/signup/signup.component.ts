// signup.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import ApiConnector from '../APIConnector/ApiConnector';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Gender, User } from 'src/interface/constants';
import { getProfilePhotoName } from 'src/utils/utilityfunctions';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  animations: [
    trigger('buttonClicked', [
      state('default', style({ transform: 'scale(1)' })),
      state('clicked', style({ transform: 'scale(1.1)' })),
      transition('default <=> clicked', animate('200ms'))
    ])]
})

/**
 * The signup component.
 */
export class SignupComponent {
  signupForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null;
  buttonState = 'default';
  genderEnum = Gender;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiConnector: ApiConnector
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      gender: ['']
    });
    this.errorMessage = null;
  }

  /**
   * Package the user object to be shipped to the backend using APIConnector class.
   * 
   * @param formData 
   */
  packageUserObject(formData: any): User | null {
    if (!formData) {
      return null;
    }

    let user : User = {
      fullName: formData.fullName,
      role: formData.role,
      username: formData.email.split('@')[0],
      password: formData.password,
      email: formData.email,
      profilePhoto : getProfilePhotoName(formData.gender)
    }
    return user;
  }

  /**
   * Submit the signup form.
   */
  onSubmit() {
    this.buttonState = 'clicked';
    if (this.signupForm.valid) {
      this.isSubmitting = true;
      
      // Package user object
      let user = this.packageUserObject(this.signupForm.value);
      if (!user) {
        return;
      }
      this.apiConnector.signup(user).
      then((res:any) => {
        console.log(res);
        this.router.navigateByUrl('/login');
      })
      .catch((err:any) => {
        this.errorMessage = err;
        console.log(err);
      })
      .finally(() => {
        this.isSubmitting = false;
      });
    }
  }
}