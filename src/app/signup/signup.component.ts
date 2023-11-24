// signup.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import CoreConnector from '../InterfaceAPI/CoreConnector';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private coreConnector: CoreConnector
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      gender: ['']
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isSubmitting = true;
      this.coreConnector.signup(this.signupForm.value).
      then((res:any) => {
        console.log(res);
        if (res.ok){
          this.router.navigateByUrl('/login');
        }
      })
      .catch((err:any) => {
        this.error = err;
        console.log(err);
      });
    }
  }
}