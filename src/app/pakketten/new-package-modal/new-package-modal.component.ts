// new-package-modal.component.ts

import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-new-package-modal',
  templateUrl: 'new-package-modal.component.html',
  styleUrls: ['new-package-modal.component.scss'],
})
export class NewPackageModalComponent {
  @Input() existingPackages: any[]; // Pass the existing packages to check for duplicates

  newPackage = {
    pakket_id: '',
    lood_locatie_nummer: '',
    status: 11, // Default status
  };

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }

  saveNewPackage() {
    // Implement your logic to save the new package
    // You can perform validation and handle duplicates here
    // For example, check if pakket_id already exists in existingPackages

    // If validation passes, close the modal and proceed with saving
    this.modalController.dismiss({
      newPackage: this.newPackage,
    });
  }
}
