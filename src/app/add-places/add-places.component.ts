import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import { Place, User } from 'src/interface/constants';
import { getAllCategories } from 'src/utils/utilityfunctions';
import ApiConnector from '../APIConnector/ApiConnector';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-places',
  templateUrl: './add-places.component.html',
  styleUrls: ['./add-places.component.css']
})

/**
 * This component is used to add a new place to the database.
 */
export class AddPlacesComponent {

  // The placeForm is used to store the form data.
  placeForm: FormGroup;
  placeAdded = false;
  countdown = 3;
  placeError = '';
  showPlaceForm = false;
  availableCategories = getAllCategories();
  matAutocomplete: any;
  isLoading = false;
  user = {} as User;


  // The FormBuilder is used to create a form group.
  constructor(private fb: FormBuilder, private apiConnector: ApiConnector, private router: Router) {
    this.placeForm = this.fb.group({
      site_name: ['', Validators.required],
      summary: [''],
      description: [''],
      location: this.fb.group({
        latitude: [''],
        longitude: [''],
      }),
      type: [''],
      tags: [''],
      address: this.fb.group({
        address_1: [''],
        address_2: [''],
        address_3: [''],
        postcode: [''],
      }),
      website: this.fb.array([this.fb.control('')]),
      email: [''],
      phone: [''],
      categories: this.fb.array([]),
      venue_description: [''],
      all_weather: [''],
      opening_times: [''],
      accessibility: [''],
      pet_friendly: [''],
      parking: [''],
      visit_time: [''],
      uprn: [0],
      google_map_link: [''],
      walk_time_bus: [''],
      nearest_bus_stop: [''],
      walk_time_train: [''],
      nearest_train_station: [''],
      directions: [''],
      nearest_bus_service: [''],
      image: [''],
      cost_free: [''],
      cost_details: [''],
      rating: [0],
    });
  }

  /**
   * This method is called when the component is initialized.
   */
  ngOnInit(): void {
    this.apiConnector.getLoggedInUser()
    .then((res: any) => {
      if (res.role === 'admin') {
        this.user = res;
      }
    })
    .catch((err: any) => {
      console.log(err);
    });
  }

  /**
   * This method is used to toggle the place form.
   */
  showForm() {
    this.showPlaceForm = !this.showPlaceForm;
  }

  /**
   *  This method is used to add a new website input field.
   * 
   * @param websiteInput  The website input field.
   */
  addWebsite(websiteInput: HTMLInputElement): void {
    (this.placeForm.get('website') as FormArray).push(this.fb.control(websiteInput.value));
    websiteInput.value = '';
  }

  /**
   * This method is used to remove a website input field.
   * 
   * @param index The index of the website input field to be removed.
   */
  removeWebsite(index: number): void {
    (this.placeForm.get('website') as FormArray).removeAt(index);
  }

  /**
   * This method is used to get the website form controls.
   * 
   * @returns The website form controls.
   */
  getCategoriesFormControls(): AbstractControl[] {
    return (this.placeForm.get('categories') as FormArray).controls;
  }
  
  /**
   * This method is used to add a new category input field.
   * 
   * @param index The index of the category input field to be removed.
   */
  removeCategory(index: number): void {
    (this.placeForm.get('categories') as FormArray).removeAt(index);
  }

  /**
   * This method is used to add a new category input field.
   * 
   * @param event The event object.
   */
  addCategory(event: any): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
  
      if ((value || '').trim()) {
        (this.placeForm.get('categories') as FormArray).push(this.fb.control(value.trim()));
      }
  
      if (input) {
        input.value = '';
      }
    }
  }
  
  /**
   * This method is used to select a category.
   * 
   * @param event The event object.
   */
  selectedCategory(event: any): void {
    (this.placeForm.get('categories') as FormArray).push(this.fb.control(event.option.viewValue));
  }

  /**
   * This method is used to submit the place form.
   */
  onSubmit() {
    this.isLoading = true;
    if (this.placeForm.valid) {
      let formValue = this.placeForm.value;
      formValue.type = formValue.type.split(',').map((item: string) => item.trim());
      formValue.tags = formValue.tags.split(',').map((item: string) => item.trim());
      this.addPlace(this.placeForm.value);
      this.placeForm.reset();
    }
  }

  /**
   * This method is used to add a new place by calling the APIConnector and passing the place object.
   * 
   * @param place The place object.
   */
  addPlace(place: Place) {
    console.log(place);
    if (this.user && this.user.id) {
      this.apiConnector.addPlace(place)
      .then((res: any) => {
        this.showPlaceForm = false;
        this.placeAdded = true;
        this.placeError = '';

        // Start the countdown.
        let countdownInterval = setInterval(() => {
          if (this.countdown > 0) {
            this.countdown--;
          } else {
            clearInterval(countdownInterval);
             // Redirect to the places page after 3 seconds.
            this.router.navigateByUrl('/places');
          }
        }, 1000);
      })
      .catch((err: any) => {
        console.log(err);
        this.placeError = err;
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
    
  }
}
