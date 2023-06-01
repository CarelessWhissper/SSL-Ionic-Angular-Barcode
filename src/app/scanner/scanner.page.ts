import { Component, OnInit } from "@angular/core";
import {
  BarcodeScanner,
  BarcodeScannerOptions,
} from "@ionic-native/barcode-scanner/ngx";
import { AlertController } from "@ionic/angular";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { Platform } from "@ionic/angular";
import { Location } from "@angular/common";
import { Storage } from "@ionic/storage";
import { ToastController } from '@ionic/angular';


@Component({
  selector: "app-scanner",
  templateUrl: "./scanner.page.html",
  styleUrls: ["./scanner.page.scss"],
})
export class ScannerPage implements OnInit {
  scanData: {};
  status: any;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private alertController: AlertController,
    private router: Router,
    private platform: Platform,
    private location: Location,
    public http: HttpClient,
    private storage: Storage,
    private toastController: ToastController
  ) {
    this.platform.backButton.subscribeWithPriority(666666, () => {
      if (this.router.url == "/scanner") {
        this.exitAlert();
      } else {
        this.location.back();
      }
    });
  }

  ngOnInit() {
    this.getStatus();
  }

  async getStatus() {
    try {
      const response = await this.http.get("https://ssl.app.sr/api/get-status").toPromise();
      console.log(response);
      this.storage.set("status", response);
    } catch (error) {
      console.log(error);
    }
  }

  ionViewDidEnter() {
    this.status = localStorage.getItem("currentStatus");
    console.log(this.status);
  }

  scan() {
    console.log("scan called");
    const storedStatus = localStorage.getItem("selectedStatus");
    const currentStatus = storedStatus ? JSON.parse(storedStatus) : null;

    console.log("currentStatus from storage:", currentStatus);
    this.status = currentStatus;

    if (currentStatus == null) {
      console.log("currentStatus is null");
      this.setStatus();
    } else {
      const options: BarcodeScannerOptions = {
        preferFrontCamera: false,
        showFlipCameraButton: false,
        prompt: "Place a barcode inside the scan area",
        formats: "CODE_93",
        orientation: "portrait",
      };

      this.barcodeScanner
        .scan(options)
        .then((barcodeData) => {
          console.log(barcodeData);
          this.postBarcodeData(barcodeData.text);
        })
        .catch((err) => {
          console.log("Error", err);
        });
    }
  }

  async alert(response) {
    const alert = await this.alertController.create({
      header: "Scan succesvol",
      cssClass: "alertCss",
      message: response.pakket_id + " status is gewijzigd " + response.name,
      buttons: [
        {
          text: "Scan volgende",
          handler: () => {
            this.scan();
          },
        },
        {
          text: "ok",
          handler: () => {
            console.log("Yes clicked");
          },
        },
      ],
    });
    await alert.present();
  }

  async postBarcodeData(data: any) {
    const barcode = {
      barcode: data,
      status: this.status.id,
    };

    console.log("Posting barcode data: ", barcode);

    try {
      const response = await this.http.post("https://ssl.app.sr/api/barcode-update-status", barcode).toPromise();

      console.log("response :", response);

      if (response) {
        this.alert(response); // Assuming the response is a string or a specific value indicating success

        const toast = await this.toastController.create({
          message: "Barcode data posted successfully",
          duration: 2000,
          color: "success",
          position: "bottom",
        });
        toast.present();
      } else {
        console.log("Invalid response format: ", response);

        const toast = await this.toastController.create({
          message: "Invalid response format",
          duration: 2000,
          color: "danger",
          position: "bottom",
        });
        toast.present();
      }
    } catch (error) {
      this.sameStatusAlert(error);
      console.log("Error: ", error);

      if (error instanceof HttpErrorResponse) {
        console.log("Error status:", error.status);
        console.log("Error body:", error.error);

        if (error.status === 400 && error.error && error.error.message) {
          const errorMessage = error.error.message;
          // Display the specific error message to the user
          const toast = await this.toastController.create({
            message: errorMessage,
            duration: 2000,
            color: "danger",
            position: "bottom",
          });
          toast.present();
        } else {
          // Display a generic error message
          const toast = await this.toastController.create({
            message: "Error posting barcode data",
            duration: 2000,
            color: "danger",
            position: "bottom",
          });
          toast.present();
        }
      }
    }
  }

  pakketten() {
    this.router.navigateByUrl("/pakketten");
  }

  settings() {
    this.router.navigateByUrl("/settings");
  }

  async exitAlert() {
    const alert = await this.alertController.create({
      header: "Wilt u de applicatie verlaten?",
      cssClass: "alertCss",
      buttons: [
        {
          text: "Ja",
          handler: () => {
            navigator["app"].exitApp();
          },
        },
        {
          text: "Nee",
          handler: () => {
            console.log("Yes clicked");
          },
        },
      ],
    });
    await alert.present();
  }

  async setStatus() {
    const alert = await this.alertController.create({
      header: "Er is geen status geselecteerd",
      cssClass: "alertCss",
      buttons: [
        {
          text: "Selecteer status",
          handler: () => {
            this.router.navigateByUrl("/settings");
          },
        },
        {
          text: "annuleer",
          handler: () => {
            console.log("Yes clicked");
          },
        },
      ],
    });
    await alert.present();
  }

  async sameStatusAlert(response) {
    if (response.error) {
      const alert = await this.alertController.create({
        header: 'Scan niet succesvol',
        message: response.message,
        cssClass: 'alertCss',
        buttons: [
          {
            text: 'Scan volgende',
            handler: () => {
              this.scan();
            },
          },
          {
            text: 'OK',
            handler: () => {
              console.log('OK clicked');
            },
          },
        ],
      });
      await alert.present();
    }
  }
}
