import { Component } from '@angular/core';
import CoreConnector from '../InterfaceAPI/CoreConnector';

@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.css']
})
export class PlacesComponent {
  //ToDo: Remove this placeholder data once the Server is up and running.
  places_list = [
    {
      "place_id": 1,
      "site_name": "Burrington Combe",
      "summary": "Fine example of a typical Mendip gorge for walking, caving and climbing",
      "description": "Burrington Combe is a Carboniferous Limestone gorge near the village of Burrington on the north side of the Mendip Hills Area of Outstanding Natural Beauty in North Somerset England. Combe or Coombe is a word of Celtic origin found in several forms on all of the British Isles denoting a steep sided valley or hollow. Burrington Combe is a gorge though the limestone hills although there is now no river running through it. Various cave entrances are exposed which have been occupied by humans for over 1000 years with a hillfort being built beside the combe in the Iron Age. The geology has led to a diversity of plant life. According to legend Augustus Montague Toplady was inspired to write the hymn Rock of Ages while sheltering under a rock in the combe although recent scholars have disputed this claim.",
      "location_id": 2,
      "location": {
        "latitude": "51.3277563366584",
        "longitude": "-2.7523269771047"
      },
      "type": [
        "Active and outdoors",
        ""
      ],
      "tags": [
        ""
      ],
      "address": {
        "address_1": "Burrington Combe",
        "address_2": "",
        "address_3": "",
        "postcode": ""
      },
      "website": [
        "http://www.gps-routes.co.uk/routes/home.nsf/RoutesLinksWalks/burrington-combe-walking-route",
        "http://www.mendiphillsaonb.org.uk/walks/"
      ],
      "email": "",
      "phone": "",
      "categories": [
        "attraction",
        "open spaces",
        "family friendly",
        "nature - environment"
      ],
      "venue_description": "",
      "all_weather": "Outdoors",
      "opening_times": "",
      "accessibility": "",
      "pet_friendly": "",
      "parking": "",
      "visit_time": "",
      "uprn": 24142606,
      "google_map_link": "https://www.google.co.uk/maps/place/@51.32775633665836,-2.7523269771047008,17z",
      "walk_time_bus": "Less than 15 minutes",
      "nearest_bus_stop": "134",
      "walk_time_train": "Over 60 minutes",
      "nearest_train_station": "Yatton Railway Station",
      "directions": "",
      "nearest_bus_service": "",
      "image": "http://discovernorthsomerset.co.uk/wp-content/uploads/2017/04/118-Burrington-Combe-2.jpg",
      "cost_free": null,
      "cost_details": ""
    },
    {
      "place_id": 2,
      "site_name": "Theatre in the Hut",
      "summary": "An\ufffdamateur dramatics society in  Weston super Mare in Somerset, which has been running for over 60 years.",
      "description": "We are an amateur dramatics society with members from many different backgrounds. We put on several shows every year, mainly at the Theatre in the Hut which is owned by the Wayfarers. Members do not get paid for the shows we put on, as all proceeds from ticket sales (after payment of royalties and licenses etc) go towards the upkeep and improvement of the theatre. What we do get is a tremendous amount of satisfaction and a great social life.",
      "location_id": 4,
      "location": {
        "latitude": "51.3502572387019",
        "longitude": "-2.96309212131165"
      },
      "type": [
        "Theatre",
        ""
      ],
      "tags": [
        "Weston",
        "theatre",
        "plays"
      ],
      "address": {
        "address_1": "Theatre In The Hut",
        "address_2": "Milton Road",
        "address_3": "Weston-Super-Mare",
        "postcode": ""
      },
      "website": [
        "http://www.wayfarersdrama.org.uk/home/4584795664",
        ""
      ],
      "email": "wayfarersdrama@outlook.com",
      "phone": "",
      "categories": [
        "arts and culture",
        "family friendly",
        "venue for events"
      ],
      "venue_description": "",
      "all_weather": "Indoors",
      "opening_times": "",
      "accessibility": "",
      "pet_friendly": "",
      "parking": "On-street parking",
      "visit_time": "",
      "uprn": 24097988,
      "google_map_link": "https://www.google.co.uk/maps/place/@51.35025723870193,-2.963092121311648,17z",
      "walk_time_bus": "Less than 15 minutes",
      "nearest_bus_stop": "7",
      "walk_time_train": "15 - 30 minutes",
      "nearest_train_station": "Weston-super-Mare Railway Station",
      "directions": "",
      "nearest_bus_service": "",
      "image": "http://discovernorthsomerset.co.uk/wp-content/uploads/2015/06/shutterstock_96302903.jpg",
      "cost_free": null,
      "cost_details": ""
    },]
  
  database_status : any;

  constructor(private coreConnector: CoreConnector) {
    console.log("Places Component initalised!");
  }
  ngOnInit(): void {
    this.coreConnector.getDatabaseConnectionStatus()
    .then((res:any) => {
      this.database_status = res.data;
    });
  }
}
