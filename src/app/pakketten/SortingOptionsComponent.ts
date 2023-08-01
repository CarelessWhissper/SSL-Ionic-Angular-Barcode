import { Component, ViewChild, ElementRef } from "@angular/core";
import { PopoverController } from "@ionic/angular";


@Component({
  selector: "app-sorting-options",
  styleUrls:["./SortingsOptionsComponent.scss"],
  template: `
    <ion-list class="pop">
      <ion-list-header class="sorting-options-header"> Sorteer op</ion-list-header>
      <ion-item button (click)="selectOption('status_name')" class="sorting-option">
        <ion-label>Status</ion-label>
      </ion-item>
      <ion-item button (click)="selectOption('pakket_id')" class="sorting-option">
        <ion-label>Pakket nummer</ion-label>
      </ion-item>
      <ion-item button (click)="selectOption('bestemming')" class="sorting-option">
      <ion-label>Bestemming</ion-label>
    </ion-item>
    <ion-item button (click)="selectOption('verzendadres')" class="sorting-option">
    <ion-label>Verzend Adres</ion-label>
  </ion-item>
  <ion-item button (click)="selectOption('locatie')" class="sorting-option">
  <ion-label>Locatie</ion-label>
</ion-item>
  
    </ion-list>
  `,
})
export class SortingOptionsComponent {
  @ViewChild("sorting-button", { static: false, read: ElementRef }) icon: ElementRef;

  constructor(private popoverController: PopoverController) {}

  async presentSortingOptions(ev: any) {
    const popover = await this.popoverController.create({
      component: SortingOptionsComponent,
      translucent: true,
    });

    const iconEl = this.icon.nativeElement;
    const rect = iconEl.getBoundingClientRect();
    const popoverTop = rect.bottom + "px";
    const popoverLeft = rect.left + "px";

    popover.style.top = popoverTop;
    popover.style.left = popoverLeft;

    return await popover.present();
  }

  selectOption(option: string) {
    this.popoverController.dismiss(option);
  }
}
