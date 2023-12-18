import { Component } from '@angular/core';
import ApiConnector from '../APIConnector/ApiConnector';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})

/**
 * The footer component.
 */
export class FooterComponent {
  isDatabaseConnected: boolean;
  isServerConnected: boolean;

  constructor(private apiConnector: ApiConnector) {
    this.isDatabaseConnected = false;
    this.isServerConnected = false;
    console.log("Footer Component initialized");
   }

   /**
    * Get the database and server connection status.
    */
   ngOnInit() {
    this.apiConnector.getDatabaseConnectionStatus()
    .then((res:any) => {
      if (res.ok){
        this.isDatabaseConnected = true;
      }
    })
    .catch((err:any) => {
      this.isDatabaseConnected = false;
      console.log(err);
    });
    this.apiConnector.getServerConnectionStatus()
    .then((res:any) => {
      this.isServerConnected = true;
    })
    .catch((err:any) => {
      this.isServerConnected = false;
      console.log(err);
    });
  }
}
