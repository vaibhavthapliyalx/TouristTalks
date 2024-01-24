import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserModule } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule } from '@angular/common/http';
import { PlacesComponent } from './places/places.component';
import ApiConnector from './APIConnector/ApiConnector';
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { PlaceDetailsDialog } from './place-details-dialog/place-details-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ReviewsComponent } from './reviews/reviews.component';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { UserReviewsComponent } from './user-reviews/user-reviews.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { AddPlacesComponent } from './add-places/add-places.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
/**
 * Proxy has been implemented to forward the requests from the frontend to the backend.
 * The proxy is configured in the file proxy.conf.json.
 * It forwards from port 3000 to port 5000.
 * 
 * ToDo: Check with Adrian if it's okay to use the proxy.
 */
export const routes = [
  { path: 'places', component: PlacesComponent, canActivate: [AuthGuard] },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'places/reviews/:place_id/:site_name', component: ReviewsComponent, canActivate: [AuthGuard] },
  { path: 'profile/:user_id', component: ProfileComponent, canActivate: [AuthGuard] },
  {path: 'reviews/latest', component: ReviewsComponent, canActivate: [AuthGuard] },
  {path: 'reviews/myreviews', component: UserReviewsComponent, canActivate: [AuthGuard] },
  {path: 'addPlaces', component: AddPlacesComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'places' }
];
@NgModule({
  declarations: [
    AppComponent,
    PlacesComponent,
    FooterComponent,
    NavbarComponent,
    SignupComponent,
    LoginComponent,
    PlaceDetailsDialog,
    ReviewsComponent,
    ProfileComponent,
    UserReviewsComponent,
    AddPlacesComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { useHash: true }),
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
    MatTableModule,
    FormsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatGridListModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  providers: [ApiConnector, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
