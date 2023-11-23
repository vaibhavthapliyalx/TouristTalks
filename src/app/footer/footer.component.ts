import { Component } from '@angular/core';
import CoreConnector from '../InterfaceAPI/CoreConnector';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  isDatabaseConnected: boolean;
  isServerConnected: boolean;
  constructor(private coreConnector: CoreConnector) {
    this.isDatabaseConnected = false;
    this.isServerConnected = false;
    console.log("Footer Component initialized");
   }

   ngOnInit() {
    this.coreConnector.getDatabaseConnectionStatus()
    .then((res:any) => {
      if (res.ok){
        this.isDatabaseConnected = true;
      }
    })
    .catch((err:any) => {
      this.isDatabaseConnected = false;
      console.log(err);
    });
    this.coreConnector.getServerConnectionStatus()
    .then((res:any) => {
      this.isServerConnected = true;
    })
    .catch((err:any) => {
      this.isServerConnected = false;
      console.log(err);
    });
  }

}
