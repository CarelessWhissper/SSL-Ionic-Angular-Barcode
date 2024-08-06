import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-delayed-reason-modal',
  templateUrl: './delayed-reason-modal.component.html',
  styleUrls: ['./delayed-reason-modal.component.scss'],
})
export class DelayedReasonModalComponent  {

  @Input() pakket: any; // Accept the pakket object

  delayReasons: string[] = [
    'Vanwege douane issues',
    'Vanwege airline issues',
    'Vanwege company issues',
    'Andere redene: contact ons voor meer info'
  ];
  selectedReason: string = '';

  constructor(private modalCtrl:ModalController) { }
  
  dismiss(){
    this.modalCtrl.dismiss();
  }

  confirm(){
    this.modalCtrl.dismiss(this.selectedReason);
  }
  
}
