import { Component, OnInit, Renderer2 } from "@angular/core";
import {
  BarcodeScanner,
  BarcodeScannerOptions,
} from "@ionic-native/barcode-scanner/ngx";
import { AlertController, Platform, ToastController } from "@ionic/angular";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { Storage } from "@ionic/storage";
import { LocationService } from "../location-service.service";


@Component({
  selector: "app-scanner",
  templateUrl: "./scanner.page.html",
  styleUrls: ["./scanner.page.scss"],
})
export class ScannerPage implements OnInit {
  scanData: {};
  status: any;
  isDarkMode: boolean;
  private colorSchemeListener: () => void;
  loodLocatieNumber: any;
  userData: any;
  showMenu: boolean = false;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private alertController: AlertController,
    private router: Router,
    private platform: Platform,
    private location: Location,
    private http: HttpClient,
    private storage: Storage,
    private toastController: ToastController,
    private renderer: Renderer2,
    private locationService:LocationService
  ) {
    this.platform.backButton.subscribeWithPriority(666666, () => {
      if (this.router.url === "/scanner") {
        this.exitAlert();
      } else {
        this.location.back();
      }
    });
  }

  ngOnInit() {
    this.getStatus();

    //subscribe to change in user location
    this.locationService.getUserLocation().subscribe(location =>{
      //display menu's based on user's location
      this.showMenu = (location === 'usa');
    })
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: "top",
    });
    toast.present();
  }

  async getStatus() {
    try {
      const response = await this.http
        .get("https://ssl.app.sr/api/get-status")
        .toPromise();
    //  console.log(response);
      const sth = response;
    //  console.log(sth, "this is the response with sth");
      // console.log(response.pallet_data.pakket_id,)
    } catch (error) {
      console.log(error);
    }
  }

  async ionViewDidEnter() {
    this.status = localStorage.getItem("currentStatus");
    console.log("the current status for scanning is: ", this.status);
  }

  async scan() {
  //  console.log("scan called");
    const storedStatus = localStorage.getItem("selectedStatus");
    const currentStatus = storedStatus ? JSON.parse(storedStatus) : null;

   // console.log("currentStatus from storage:", currentStatus);
    this.status = currentStatus;

    if (!currentStatus) {
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

      try {
        const barcodeData = await this.barcodeScanner.scan(options);
    //    console.log("This barcode data:", barcodeData);
        this.postBarcodeData(barcodeData.text);
      } catch (err) {
   //     console.log("Error", err);
      }
    }
  }

  async onsaveLoodlocatienumber(loodLocatieNumber: string) {
    const apiURL = "https://ssl.app.sr/api/save-aankomst";

    const sth: string | null = await this.storage.get("scan_resp");
    const sthElse: string | null = await this.storage.get("scan_resp2");

  //  console.log("the data in storage is: ", sth);
  //  console.log("the data in storage is: ", sthElse);

    this.storage.get("status").then(async (response) => {
    //  console.log(sth, "check this response");
    //  console.log(sthElse, "check this response too");

      // Create a payload with the pakket_id and lood_locatie_number
      const payload = {
        id: sthElse,
        pakket_id: sth,
        lood_locatie_number: loodLocatieNumber,
      };

    //  console.log("what's in the payload: ", payload);

      try {
        const updateResponse: any = await this.http
          .post(apiURL, payload)
          .toPromise();

        console.log("Update request successful:", updateResponse);

        // Update the storage with the modified response object
        this.storage.set("status", response);

    //    console.log("Lood locatie number updated successfully");

        // Show a success toast message
        this.showToast("Lood locatie number updated successfully", "success");
      } catch (error) {
        console.error("Update request failed:", error);

        // Show an error toast message for HTTP request failure
        this.showToast("Failed to update lood locatie number", "danger");
      }
    });
  }

  async alert(response) {
    const pakketId = response.pakket_id || "het pakket";
    const status = response.status || "Unknown";

    const buttons = [
      {
        text: "Voer Lood Locatie Number in",
        handler: () => {
          this.enterLoodLocatieNumber(); // Handle the action to enter the number
        },
      },
      {
        text: "Scan volgende",
        handler: () => {
          this.scan();
        },
      },
      {
        text: "Ok",
        handler: () => {
          console.log("Ok clicked");
        },
      },
    ];

    // Conditionally move "Voer Lood Locatie Number in" option
    if (status !== "Aankomst in SR") {
      const voerLoodLocatieButton = buttons.find(
        (button) => button.text === "Voer Lood Locatie Number in"
      );
      if (voerLoodLocatieButton) {
        const index = buttons.indexOf(voerLoodLocatieButton);
        buttons.splice(index, 1);
      }
    }

    const alert = await this.alertController.create({
      header: "Scan succesvol",
      cssClass: "alertCss",
      message: `${pakketId} is succesvol bijgewerkt naar ${status}`,
      buttons: buttons, // Use the updated buttons array
    });

    await alert.present();
  }

  async enterLoodLocatieNumber() {
    const alert = await this.alertController.create({
      header: "Enter Lood Locatie Number",
      inputs: [
        {
          name: "loodLocatieNumber",
          type: "text",
          placeholder: "Enter the desired number",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            console.log("Enter Lood Locatie Number canceled");
          },
        },
        {
          text: "Save",
          handler: (data) => {
            const loodLocatieNumber = data.loodLocatieNumber;
            // Handle the entered number (e.g., save it or perform further actions)
        //    console.log("Entered Lood Locatie Number:", loodLocatieNumber);

            // Now you can save the loodLocatieNumber using your onsaveLoodlocatienumber function
            this.onsaveLoodlocatienumber(loodLocatieNumber);
          },
        },
      ],
    });

    await alert.present();
  }

  async postBarcodeData(data: any) {
    console.log("Data object:", data);

    try {
      // Retrieve locatie from local storage
      const userData = await this.storage.get("login");

      if (userData && userData.locatie) {
        const locatie = userData.locatie;

        // Construct the request body
        const requestBody = {
          barcode: data,
          status: this.status ? this.status.id : null,
          locatie: locatie, // Include locatie in the request body
        };

        // Make the HTTP POST request with the requestBody
        const response: any = await this.http
          .post("https://ssl.app.sr/api/barcode-update-status", requestBody)
          .toPromise();

      //  console.log("Response:", response);

       // console.log("the package was updated from", locatie);

        if (response && response.message) {
          this.storage.set("scan_resp", response.pakket_id);
          this.storage.set("scan_resp2", response.id);

          console.log("The package name ", response.pakket_id);
          console.log("The package id: ", response.id);

          this.alert(response); // Assuming the response is a string or a specific value indicating success

          const toast = await this.toastController.create({
            message: "Barcode data posted successfully",
            duration: 7000,
            color: "success",
            position: "bottom",
          });
          toast.present();
        } else {
          console.log("Invalid response format: ", response);

          const toast = await this.toastController.create({
            message: "Invalid response format",
            duration: 7000,
            color: "danger",
            position: "bottom",
          });
          toast.present();
        }
      } else {
        console.log("Locatie not found in local storage");
      }
    } catch (error) {
      this.sameStatusAlert(error);
     // console.log("Error: ", error);

      if (error instanceof HttpErrorResponse) {
       // console.log("Error status:", error.status);
       // console.log("Error body:", error.error);

        if (error.error && error.error.message) {
          const errorMessage = error.error.message;
          // Display the specific error message to the user
          const toast = await this.toastController.create({
            message: errorMessage,
            duration: 7000,
            color: "danger",
            position: "bottom",
          });
          toast.present();
        } else {
          // Display a generic error message
          const toast = await this.toastController.create({
            message: "Error posting barcode data",
            duration: 7000,
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

  settingsusa(){
    this.router.navigateByUrl("/settingsusa");
  }

  usaPaketten(){
    this.router.navigateByUrl("/usapackages");
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
    let errorMessage = "";

    switch (response.status) {
      case 404:
        errorMessage = "Barcode niet gevonden";
        break;
      case 400:
        errorMessage = "Het pakket is al reeds gescanned ";
        break;
      case 401:
        errorMessage =
          "Invalide Status poging , het pakket heeft zijn eind bereikt.";
        break;
      case 403:
        errorMessage = "Deze update is niet toegestaan";
        break;
      case 406:
        errorMessage = "Palletnummer niet beschikbaar";
        break;

      case 418:
        errorMessage = "Aan dit pakket is al een lood loc nummer toegewezen";
        break;
      case 419:
        errorMessage = "Pakket heeft al lood locatie nummer toegewezen";
        break;
      default:
        errorMessage = "Error: " + response.message;
        break;
    }

    const alert = await this.alertController.create({
      header: "Scan niet succesvol",
      message: errorMessage,
      cssClass: "alertCss",
      buttons: [
        {
          text: "Scan volgende",
          handler: () => {
            this.scan();
          },
        },
        {
          text: "OK",
          handler: () => {
            console.log("OK clicked");
          },
        },
      ],
    });

    await alert.present();
  }
}
