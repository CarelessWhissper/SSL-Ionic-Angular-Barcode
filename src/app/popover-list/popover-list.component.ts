import { Component, OnInit } from '@angular/core';
import { PopoverController, } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-popover-list',
  templateUrl: './popover-list.component.html',
//   template: `<ion-list radio-group>
//   <ion-item (click)="sortListByNone()">
//   <ion-radio value="1"></ion-radio>&nbsp;
//       <ion-label>None</ion-label>
//   </ion-item>
//   <ion-item (click)="sortListByAdres()">
//   <ion-radio value="7"></ion-radio>&nbsp;
//   <ion-label>Adres</ion-label>
//   </ion-item>
//   <ion-item (click)="sortListByMeterNummer()">
//   <ion-radio value="10"></ion-radio>&nbsp;
//   <ion-label>Meter Nummer</ion-label>
//   </ion-item>
//   <ion-item (click)="sortListByAansluitNummer()">
//   <ion-radio value="5"></ion-radio>&nbsp;
//   <ion-label>Aansluit Nummer</ion-label>
//   </ion-item>
//   <ion-item (click)="sortListByVerbruiker()">
//   <ion-radio value="6"></ion-radio>&nbsp;
//   <ion-label>Verbruiker</ion-label>
//   </ion-item>
//   <ion-item (click)="sortListByCallnumber()">
//   <ion-radio value="88"></ion-radio>&nbsp;
//   <ion-label>Call Number</ion-label>
//   </ion-item>
// </ion-list>
// `,
  styleUrls: ['./popover-list.component.scss'],
})
export class PopoverListComponent implements OnInit {
  status: any;

  constructor(
    private popoverController: PopoverController,
    private Storage:Storage,
  ) { }

  ngOnInit() {
    console.log('asdsa')
    this.Storage.get("status").then((val)=>{
      this.status = val;
      this.status.unshift({id: 0, name: 'all'})
    })
  }
  onChangeStatus(id){
    console.log(id)
    this.popoverController.dismiss(id);
  }
}
