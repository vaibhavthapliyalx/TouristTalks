import { Component } from '@angular/core';
import ApiConnector from '../APIConnector/ApiConnector';
import { Place, User } from 'src/interface/constants';
import { MatDialog } from '@angular/material/dialog';
import { PlaceDetailsDialog } from '../place-details-dialog/place-details-dialog.component';
import { getAllCategories, getStars } from 'src/utils/utilityfunctions';
@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.css']
})
export class PlacesComponent {
 /**
  * Here we are importing the getStars function from the utilityfunctions.ts file.
  * And then pass its reference to the getStars property.
  * This can be used in the HTML file to fetch the stars array
  */
  getStars = getStars;
  isLoading = false;
  user = {} as User;
  places_list: Place[]= [];
  pageSize = 20;
  pageIndex = 0;
  panelOpenState = false;
  searchTerm = '';
  selectedCategory = 'All';
  sortEvent: Event = new Event('');
  categories = getAllCategories();
  activeCategories = ['All'];
  sortOrder = 'name';
  searchQuery = '';
  selectedCategories:string[] =[];

  constructor(private apiConnector: ApiConnector, public dialog: MatDialog) {
    console.log("Places Component initalised!");
  }

  openDialog(place: any): void {
    const dialogRef = this.dialog.open(PlaceDetailsDialog, {
      width: 'auto',
      data: place
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  ngOnInit(): void {
    this.fetchPlaces();
    this.fetchLoggedInUser();
  }

  /**
   * This function fetches the logged in user from the backend.
   * 
   * @returns  The logged in user
   */
  fetchLoggedInUser() {
    this.apiConnector.getLoggedInUser()
      .then((res: any) => {
        this.user = res;
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  /**
   * This function fetches the places from the backend.
   * It queries the backend with the sort, search, and categories parameters.
   * If sort is provided, it sorts the places by the sort order.
   * If search is provided, it filters the places by the search term.
   * If categories is provided, it filters the places by the categories.
   * If no parameters are provided, it returns all the places.
   * 
   * @param sort The sort order.
   * @param search The search term.
   * @param categories The categories to filter by.
   */
  fetchPlaces() {
    // Set isLoading to true to show the loading spinner
    this.isLoading = true;
  
    this.apiConnector.getAllPlaces(this.sortOrder, this.searchQuery, this.selectedCategories)
      .then((res: any) => {
        const places: Place[] = res;
        // Setting showDetails to false for all places initially.
        this.places_list = places.map(place => ({ ...place, showDetails: false }));
        console.log(this.places_list);
      })
      .catch((err: any) => {
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

  search() {
    this.searchQuery = this.searchTerm;

    // Fetch the places with the search term.
    this.fetchPlaces();
  }

  /**
   * This function filters the places by the category.
   * If 'All' is selected and it's the only one selected, it does nothing.
   * If 'All' is selected and there are other categories selected, it deselects all other categories.
   * If another category is selected and 'All' is currently selected, it deselects 'All'.
   * If the category is already selected, it deselects the category.
   * If the category is not selected, it selects the category.
   * 
   * @param category  The category to filter by
   */
  filterByCategory(category: string) {
    console.log("target category"+ category);
    
    // If 'All' is selected and it's the only one selected
    if (category === 'All' && this.activeCategories.length === 1 ) {
      // Do nothing
    }
    // If 'All' is selected and there are other categories selected
    if (category === 'All' && this.activeCategories.length > 1) {
      this.activeCategories = ['All']; // Deselect all other categories
    }
    // If another category is selected and 'All' is currently selected
    else if (this.activeCategories.includes('All')) {
      this.activeCategories = [category]; // Deselect 'All'
    }
    // If the category is already selected
    else if (this.activeCategories.includes(category)) {
      this.activeCategories.splice(this.activeCategories.indexOf(category), 1); // Deselect the category
    }
    // If the category is not selected
    else {
      this.activeCategories.push(category); // Select the category
    }
    this.selectedCategory = category;
    if (this.activeCategories.length === 0) {
      this.activeCategories = ['All'];
    }
    this.selectedCategories = this.activeCategories;
    console.log("active categories"+ this.activeCategories);
    // After filtering fetch the filtered places
    if (this.activeCategories.includes('All')){
    this.selectedCategories = this.categories.filter(category => category !== 'All');
    }
    
    // Fetch the filtered places.
    this.fetchPlaces();
  }

  sortBy(event: Event) {
    const criterion = (event.target as HTMLSelectElement).value;
    this.sortOrder = criterion;

    // Fetch the sorted places.
    this.fetchPlaces();
  }

  deletePlace(placeId: number) {
    console.log("Delete place with id: " + placeId);
    this.apiConnector.deletePlace(placeId)
      .then((res: any) => {
        console.log(res);
        this.fetchPlaces();
      })
      .catch((err: any) => {
        console.log(err);
      });
  }


  /********************** Pagination Handlers **********************/
  get lastPageIndex() {
    return Math.ceil(this.places_list.length / this.pageSize) - 1;
  }

  get pagesArray() {
    return Array.from({length: this.lastPageIndex + 1}, (_, i) => i + 1);
  }

  goToPreviousPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  goToNextPage() {
    if (this.pageIndex < this.lastPageIndex) {
      this.pageIndex++;
    }
  }

  goToPage(pageIndex: number) {
    this.pageIndex = pageIndex;
  }
}
