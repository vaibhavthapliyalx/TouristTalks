import { Component } from '@angular/core';
import ApiConnector from './APIConnector/ApiConnector';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Tourist Talks';

  constructor(private router: Router, private route: ActivatedRoute, private apiConnector: ApiConnector) {
    console.log("AppComponent initialized");
  }

  displayNavbar(): boolean {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/signup');
  }



}

