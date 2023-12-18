import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import ApiConnector from '../APIConnector/ApiConnector';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition('void <=> *', animate(1000)),
    ]),
  ]
})

/**
 * The login component.
 */
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting;
  email: any;
  password: any;
  errorMessage: string | null;

  constructor(private fb: FormBuilder, private apiConnector: ApiConnector, private router: Router) { 
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.errorMessage = null;
    this.isSubmitting = false;
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   * Submit the login form. 
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.email = this.loginForm.value.usernameOrEmail;
      this.password = this.loginForm.value.password;
      // Perform login action here
      this.apiConnector.login(this.email, this.password)
      .then((res:any) => {
        console.log(res);
        this.isSubmitting = false;
        this.router.navigate(['/']);
      })
      .catch((err:any) => {
        this.isSubmitting = true;
        this.errorMessage = err;
        console.log(err);
      })
      .finally(() => {
        this.isSubmitting = false;
      });
    }
  }
}