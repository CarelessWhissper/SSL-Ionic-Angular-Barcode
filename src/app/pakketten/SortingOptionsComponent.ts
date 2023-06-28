import { Component } from "@angular/core";
import { PopoverController } from "@ionic/angular";

@Component({
  selector: "app-sorting-options",
  template: `
    <ion-list>
      <ion-list-header> Sorteer op</ion-list-header>
      <ion-item button (click)="selectOption('status_name')">
        <ion-label>Status pakket</ion-label>
      </ion-item>
      <ion-item button (click)="selectOption('pakket_id')">
        <ion-label>Naam pakket</ion-label>
      </ion-item>
    </ion-list>
  `,
})
export class SortingOptionsComponent {
  constructor(private popoverController: PopoverController) {}

  selectOption(option: string) {
    this.popoverController.dismiss(option);
  }
}
