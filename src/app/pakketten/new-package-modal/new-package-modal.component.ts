// new-package-modal.component.ts

import { Component, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { ToastController } from "@ionic/angular";

@Component({
  selector: "app-new-package-modal",
  templateUrl: "new-package-modal.component.html",
  styleUrls: ["new-package-modal.component.scss"],
})
export class NewPackageModalComponent {
  @Input() existingPackages: any[]; // Pass the existing packages to check for duplicates

  newPackage = {
    pakket_id: "",
    lood_locatie_nummer: "",
    status: 11, // Default status
  };

  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private toastController: ToastController
  ) {}

  closeModal() {
    this.modalController.dismiss();
  }

  saveNewPackage() {
    this.http
      .post("https://ssl.app.sr/api/add-new-package", this.newPackage)
      .subscribe(
        (response: any) => {
          console.log(response);
          this.presentToast("Pakket is succesvol aangemaakt");

          this.modalController.dismiss({
            newPackage: this.newPackage,
          });
        },
        (error) => {
          console.error(error);
          // Handle the error, e.g.,
          // Display error toast
          this.presentToast(
            "Er is een fout opgetreden bij het aanmaken van het pakket",
            "danger"
          );
        }
      );
  }

  async presentToast(message: string, color: string = "success") {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000, // Duration in milliseconds
      color: color,
    });
    toast.present();
  }
}
