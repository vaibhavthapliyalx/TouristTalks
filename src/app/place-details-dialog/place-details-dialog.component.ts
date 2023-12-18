import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Place, Review } from 'src/interface/constants';
import { getPlacesDialogueData } from 'src/utils/utilityfunctions';

@Component({
  selector: 'app-place-details-dialog',
  templateUrl: './place-details-dialog.component.html',
  styleUrls: ['./place-details-dialog.component.css']
})

/**
 * This component displays the details of a place on a dialog.
 */
export class PlaceDetailsDialog {
  displayedColumns: string[] = ['property', 'value'];
  details = getPlacesDialogueData(this.data);

  showReviews = false;
  reviews: Review[] = [];
  
  /**
   * The constructor of the component.
   * 
   * @param dialogRef  The dialog reference. 
   * @param data The data to be displayed on the dialog, received from parent component i.e. places component.
   */
  constructor(
    public dialogRef: MatDialogRef<PlaceDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Place,
  ) {}

  /**
   * This function is called when the dialog is closed.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }
}