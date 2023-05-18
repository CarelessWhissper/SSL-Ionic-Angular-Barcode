import { Component, OnInit } from "@angular/core";
import {
  BarcodeScanner,
  BarcodeScannerOptions,
} from "@ionic-native/barcode-scanner/ngx";
import { AlertController } from "@ionic/angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { Platform } from "@ionic/angular";
import { Location } from "@angular/common";
import { Storage } from "@ionic/storage";

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
    private AlertController: AlertController,
    private router: Router,
    private platform: Platform,
    private location: Location,
    public http: HttpClient,
    private storage: Storage
  ) {
    this.platform.backButton.subscribeWithPriority(666666, () => {
      if (this.router.url == "/scanner") {
        this.exitalert();
      } else {
        this.location.back();
      }
    });
  }

  ngOnInit() {
    this.http.get("https://ssl.app.sr/api/get-status").subscribe(
      async (Response) => {
        console.log(Response);
        this.storage.set("status", Response);
      },
      async (error) => {}
    );

    this.status = localStorage.getItem("currentStatus");
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
  
      this.barcodeScanner.scan(options)
        .then((barcodeData) => {
          console.log(barcodeData);
          this.postBarcodeData(barcodeData.text);
        })
        .catch((err) => {
          console.log("Error", err);
        });
    }
  }
  async alert(Response) {
    const alert = await this.AlertController.create({
      header: "Scan succesvol",
      cssClass: "alertCss",
      message: Response.pakket_id + " status is gewijzigd " + Response.name,
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

  

  postBarcodeData(data: any) {
    let barcode = {
      barcode: data,
      // status: this.status && this.status.id ? this.status.id : null,
      status: this.status.id,
    };
    console.log("Posting barcode data: ", barcode);

    this.http
      .post("https://ssl.app.sr/api/barcode-update-status", barcode)
      .subscribe(
        async (response) => {
          console.log("response :", response);
          if (Array.isArray(response) && response.length > 0) {
            // check if the response is an array with at least one element
            console.log("weee");
            this.alert(response[0]); // call the alert function with the first element of the response array
          } else {
            console.log("Invalid response format: ", response); // print an error message to the console
          }
        },
        async (error) => {
          this.sameStatusAlert(error); // call the sameStatusAlert function with the error object
          console.log("Error: ", error);
        }
      );
  }

  pakketten() {
    this.router.navigateByUrl("/pakketten");
  }
  settings() {
    this.router.navigateByUrl("/settings");
  }
  async exitalert() {
    const alert = await this.AlertController.create({
      // header: 'Registratie Successvol',
      header: "Wilt u de applicatie verlaten?",
      cssClass: "alertCss",
      // message: 'U zal een verificatie ontvangen in uw mail',
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
    const alert = await this.AlertController.create({
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

 
  async sameStatusAlert(Response) {
    if (Response.error) {
      const alert = await this.AlertController.create({
        header: "Scan niet succesvol",
        message: Response.error.message,
        cssClass: "alertCss",
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
  }
}
