import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Storage } from "@ionic/storage";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastController } from '@ionic/angular';


@Component({
  selector: "app-settings",
  templateUrl: "./settings.page.html",
  styleUrls: ["./settings.page.scss"],
})
export class SettingsPage implements OnInit {
  // Variables declaration
  name: any;
  email: any;
  role: any;
  status: any;
  mode: any;
  locatie: any;
  currentStatus: any = null;
  showFields: boolean;
  showLoodFields: boolean;
  showPalletiseren: boolean;
  selectedStatus: any;
  currentPalletNumber: string;
  palletNumber: any;
  statusList: any[] = [];
  saveButtonClicked = false;
  OpSlaanButtonClicked = false;
  selectedStatusId: number;
  parsedStatus: any;
  loodLocatieNumber: any;
  currentLoodLocatie: number;
  toastController: any;
  

  // Show palletiseren fields
  showPalletiserenFields() {
    this.showFields = true;
  }
  // Hide palletiseren fields
  hidePalletiserenFields() {
    this.showFields = false;
  }

  showLoodLocatieFields() {
    this.showLoodFields = true;
  }

  hideLoodLocatieFields() {
    this.showLoodFields = false;
  }

  constructor(
    private Storage: Storage,
    private router: Router,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private ToastController: ToastController
  ) {}

  ngOnInit() {
    // Get the stored values from the local storage
    this.Storage.get("login").then((data) => {
      this.name = data.name;
      this.email = data.email;
      this.role = data.role;
      this.locatie = data.locatie;
    });

    this.Storage.get("status").then((response) => {
      if (response && response.status) {
        this.statusList = Object.values(response.status);
      } else {
        console.log("No data in statusList just yet,");
        alert("the app will restart");
        window.location.href = "/login";
      }
    });

    // Get the current status from the query parameter
    this.activatedRoute.queryParams.subscribe((params) => {
      const statusId = params["statusId"];
      const storedStatus = localStorage.getItem("selectedStatus");

      if (statusId) {
        const selectedStatus = this.statusList.find(
          (status) => status.id === +statusId
        );
        if (selectedStatus) {
          this.currentStatus = selectedStatus;
          this.selectedStatusId = selectedStatus.id;
          localStorage.setItem(
            "selectedStatus",
            JSON.stringify(this.currentStatus)
          );
          localStorage.setItem(
            "currentStatus",
            JSON.stringify(this.currentStatus)
          );
          console.log("The status has been saved:", this.currentStatus);
        }
      } else if (storedStatus) {
        this.currentStatus = JSON.parse(storedStatus);
        this.selectedStatusId = this.currentStatus
          ? this.currentStatus.id
          : null;
        console.log(
          "The status has been retrieved from browser storage:",
          this.currentStatus
        );
      }

      // Retrieve the stored pallet number and the LoodLocatieNummer  from browser storage
      const storedPalletNumber = localStorage.getItem("palletNumber");
      if (this.currentStatus && storedPalletNumber) {
        this.currentStatus.palletNumber = storedPalletNumber;
        console.log("The pallet number is:", storedPalletNumber);
      }

      //retrieve the lood locatie nummer from the query parameter
      const loodLocatieNumber = params["loodLocatieNumber"];
      if (loodLocatieNumber) {
        this.loodLocatieNumber = parseInt(loodLocatieNumber, 11);
        console.log("the lood locatie number is ", this.loodLocatieNumber);
      }
    });
  }

  onChangeStatus() {
    this.saveButtonClicked = false;
    try {
      if (this.selectedStatusId) {
        const selectedStatus = this.statusList.find(
          (status) => status.id === this.selectedStatusId
        );
        if (selectedStatus) {
          this.currentStatus = selectedStatus;
          // Update the query parameter with the selected status
          const queryParams = this.currentStatus
            ? { statusId: this.currentStatus.id }
            : {};
          this.router.navigate([], {
            queryParams,
            queryParamsHandling: "merge",
          });

          // Save the selected status in browser storage
          localStorage.setItem(
            "currentStatus",
            JSON.stringify(this.currentStatus)
          );
          console.log(this.currentStatus);

          // localStorage.setItem("selectedStatus", JSON.stringify(this.currentStatus));

          if (this.currentStatus.name === "Palletiseren") {
            console.log("palletiseren has been selected");
            this.showFields = true;
            this.showLoodFields = false;
            this.currentStatus.palletNumber = this.currentPalletNumber;
          } else if (
            this.currentStatus === 11 ||
            this.currentStatus.name === "Aankomst"
          ) {
            console.log("Aankomst status with the id of 11 as been selected");
            this.showLoodFields = true;
            this.showFields = false;
            this.currentStatus.loodlocatieNumber = this.currentLoodLocatie;
          } else {
            console.log(
              " neither palletiseren  or aankomst  has not been selected"
            );
            this.showFields = false;
            this.showLoodFields = false;
            // this.currentStatus.loodlocatieNumber = this.loodLocatieNumber; geen idea what this is..
            console.log(this.loodLocatieNumber);
          }
        } else {
          // Placeholder option selected, set currentStatus to null
          this.currentStatus = null;
          // Hide the palletiseren fields or perform any other necessary actions
          this.router.navigate([], {
            queryParams: { statusId: null }, // Update the query parameter to null
            queryParamsHandling: "merge",
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  // async onSavePalletNumber() {
  //   const apiUrl = "https://ssl.app.sr/api/save-pallet";

  //   if (typeof this.currentStatus === "object") {
  //     // Save the pallet number in the currentStatus object
  //     this.currentStatus.palletNumber = this.palletNumber;
  //     const palletNumber = this.palletNumber;

  //     // Check if the pallet number is empty
  //     if (!palletNumber) {
  //       alert("Pallet number is empty. Please enter a valid pallet number.");
  //       return; // Stop further execution
  //     }

  //     // Get the stored values from the local storage
  //     const data = await this.Storage.get("login");

  //     // Include the location data in the payload
  //     const playLoad = {
  //       pallet_number: palletNumber,
  //       Locatie: data.locatie,
  //     };

  //     // Check if the button has been clicked before saving data
  //     if (this.saveButtonClicked) {
  //       this.http
  //         .post(apiUrl, playLoad)
  //         .toPromise()
  //         .then((data) => {
  //           console.log("Pallet number is saved successfully");
            

  //           // save the currentStatus and palletNumber in browser storage

  //           localStorage.setItem(
  //             "selectedStatus",
  //             JSON.stringify(this.currentStatus)
  //           );
  //           localStorage.setItem(
  //             "palletNumber",
  //             this.currentStatus.palletNumber
  //           );

  //           this.palletNumber = ""; // Reset the input value
  //           this.saveButtonClicked = false; // Reset the flag
  //         })
  //         .catch((error) => {
  //           console.log("Error saving pallet number: ", error);
  //         });
  //     } else {
  //       console.log("Button has not been clicked yet, data not saved.");
  //     }
  //   }
  // }

  async onSavePalletNumber() {
    const apiUrl = "https://ssl.app.sr/api/save-pallet";
  
    if (typeof this.currentStatus === "object") {
      // Save the pallet number in the currentStatus object
      this.currentStatus.palletNumber = this.palletNumber;
      const palletNumber = this.palletNumber;
  
      // Check if the pallet number is empty
      if (!palletNumber) {
        alert("Pallet number is empty. Please enter a valid pallet number.");
        return; // Stop further execution
      }
  
      // Get the stored values from the local storage
      const data = await this.Storage.get("login");
  
      // Include the location data in the payload
      const playLoad = {
        pallet_number: palletNumber,
        Locatie: data.locatie,
      };
  
      // Check if the button has been clicked before saving data
      if (this.saveButtonClicked) {
        try {
          const response = await this.http.post(apiUrl, playLoad).toPromise();
          console.log("Pallet number is saved successfully");
  
          // Display a success toast
          const toast = await this.ToastController.create({
            message: 'Pallet number saved successfully',
            duration: 2000,
            color: 'success',
            position: 'bottom',
          });
          toast.present();
  
          // Save the currentStatus and palletNumber in browser storage
          localStorage.setItem("selectedStatus", JSON.stringify(this.currentStatus));
          localStorage.setItem("palletNumber", this.currentStatus.palletNumber);
  
          this.palletNumber = ""; // Reset the input value
          this.saveButtonClicked = false; // Reset the flag
        } catch (error) {
          console.log("Error saving pallet number: ", error);
  
          // Display an error toast
          const toast = await this.toastController.create({
            message: 'Error saving pallet number',
            duration: 2000,
            color: 'danger',
            position: 'bottom',
          });
          toast.present();
        }
      } else {
        console.log("Button has not been clicked yet, data not saved.");
      }
    }
  }

  async onSaveLoodLocatieNumber() {
    const sslApiUrl = "https://ssl.app.sr/api/save-aankomst";
  
    if (typeof this.currentStatus === "object") {
      const loodLocatieNumber = this.loodLocatieNumber;
  
      // Check if the required data is available
      if (!loodLocatieNumber) {
        alert("Geen lood locatie doorgegeven, voer 1 in aub.");
        return;
      }
  
      const palletData = this.currentStatus.pallet_data;
      if (!palletData || !palletData.id) {
        alert("Pallet data is missing or invalid.");
        return;
      }
  
      const palletiserenDataId = palletData.id;
  
      // Include the necessary data in the payload
      const payload = {
        lood_locatie_nummer: loodLocatieNumber,
        palletiseren_data_id: palletiserenDataId,
      };
  
      try {
        const response = await this.http.post(sslApiUrl, payload).toPromise();
        console.log("Lood locatie number is saved successfully");
  
        // Update the currentStatus object and save loodLocatieNumber in browser storage if needed
        this.currentStatus.lood_locatie_nummer = loodLocatieNumber;
        localStorage.setItem("selectedStatus", JSON.stringify(this.currentStatus));
        localStorage.setItem("loodLocatieNumber", loodLocatieNumber);
  
        this.loodLocatieNumber = ""; // Reset the input value
        this.saveButtonClicked = false; // Reset the flag
  
        // Display a success toast
        const toast = await this.toastController.create({
          message: 'Lood locatie number saved successfully',
          duration: 2000,
          color: 'success',
          position: 'bottom',
        });
        toast.present();
      } catch (error) {
        console.log("Error saving lood locatie number: ", error);
  
        // Display an error toast
        const toast = await this.toastController.create({
          message: 'Error saving lood locatie number',
          duration: 2000,
          color: 'danger',
          position: 'bottom',
        });
        toast.present();
      }
    }
  }
  

  onClearPalletNumber() {
    this.palletNumber = "";
    this.currentStatus.palletNumber = ""; // Clear the pallet number in the currentStatus object
  }

  onClearLoodLocatieNumber() {
    this.loodLocatieNumber = "";
    this.currentStatus.loodLocatieNumber = ""
  }

  toggleDarkMode(event) {
    this.Storage.set("mode", event.detail.checked);
    if (event.detail.checked == true) {
      document.body.setAttribute("color-theme", "dark");
    } else {
      // document.body.setAttribute('color-theme', 'light');
      document.body.setAttribute("color-theme", "light2");
    }
  }
  logout() {
    localStorage.removeItem("login");
    localStorage.removeItem("status");
    localStorage.removeItem("selectedStatus");
    localStorage.removeItem("currentStatus");
    localStorage.removeItem("palletNumber");
    console.log("Local storage cleared.");
    this.router.navigateByUrl("/login");
  }
}
