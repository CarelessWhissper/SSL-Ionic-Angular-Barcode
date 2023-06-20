import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Storage } from "@ionic/storage";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastController } from "@ionic/angular";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.page.html",
  styleUrls: ["./settings.page.scss"],
})
export class SettingsPage implements OnInit {
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
  currentId: any;
  palletNumber: any;
  statusList: any[] = [];
  saveButtonClicked = false;
  OpSlaanButtonClicked = false;
  selectedStatusId: number;
  parsedStatus: any;
  loodLocatieNumber: string;
  currentLoodLocatie: string;
  dynamicLoodLocatieNumber: number;
  selectedStatusName: string;
 

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
    private storage: Storage,
    private router: Router,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
   
  ) {
    this.currentId = null;
  }



  ngOnInit() {
    // Get the stored values from the local storage
    this.storage.get("login").then((data) => {
      this.name = data.name;
      this.email = data.email;
      this.role = data.role;
      this.locatie = data.locatie;
    });
     // Call the function to filter the status list based on the user's location
     this.filterStatusList();

    this.storage.get("status").then((response) => {
      if (response && response.status) {
        this.statusList = Object.values(response.status);

        // Update dynamicLoodLocatieNumber with the retrieved value
        if (response.pallet_data && response.pallet_data.lood_locatie_nummer) {
          console.log(
            "Response lood_locatie_nummer:",
            response.pallet_data.lood_locatie_nummer
          );
          this.loodLocatieNumber = response.pallet_data.lood_locatie_nummer;
          
          console.log(
            "updated number is: ",
            response.pallet_data.lood_locatie_nummer
          );
        }
      } else {
        console.log("No data in statusList just yet,");
        alert("the app will restart");
        window.location.href = "/login";
      }
    });

    // Get the current status from the query parameter or browser storage
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

      // Retrieve the stored pallet number from browser storage
      const storedPalletNumber = localStorage.getItem("palletNumber");
      if (this.currentStatus && storedPalletNumber) {
        this.currentStatus.palletNumber = storedPalletNumber;
        console.log("The pallet number is:", storedPalletNumber);
      }

      const storedLoodLocatieNumber = localStorage.getItem("loodLocatieNumber");
      if (storedLoodLocatieNumber !== null) {
        this.loodLocatieNumber = storedLoodLocatieNumber;
        if (this.currentStatus) {
          this.currentStatus.loodLocatieNumber = this.loodLocatieNumber;
        }
        console.log("The lood locatie number is:", this.loodLocatieNumber);
      } else {
        console.log("No lood locatie number found in storage");
      }
    });

    this.palletNumber = localStorage.getItem("palletNumber");
  }

   filterStatusList() {
  // Make API call to retrieve status list
  this.http.get<any>('https://ssl.app.sr/api/get-status').subscribe((data) => {
    // Filter the status list based on the user's location
    this.statusList = data.status.filter((status) => {
      if (this.locatie === 'surinamehoofd' && [1, 2, 3, 4].includes(status.id)) {
        return true;
      } else if (this.locatie === 'nederland' && [9, 10, 11].includes(status.id)) {
        return true;
      } else {
        return false;
      }
    });

    // Update dynamicLoodLocatieNumber with the retrieved value
    if (data.pallet_data && data.pallet_data.lood_locatie_nummer) {
      console.log(
        "Response lood_locatie_nummer:",
        data.pallet_data.lood_locatie_nummer
      );
      this.loodLocatieNumber = data.pallet_data.lood_locatie_nummer;

      console.log(
        "Updated number is: ",
        data.pallet_data.lood_locatie_nummer
      );
    }

    // Update the currentStatus object with the updated loodLocatieNumber
    if (this.currentStatus) {
      this.currentStatus.loodLocatieNumber = this.loodLocatieNumber;
    }
  });
}


   

  onChangeStatus() {
    this.saveButtonClicked = false;
    const selectedStatus = this.statusList.find(
      (status) => status.id === this.selectedStatusId
    );
    this.selectedStatusName = selectedStatus ? selectedStatus.name : "";

    try {
      if (this.selectedStatusId) {
        this.currentStatus = selectedStatus;

        // Update the query parameter with the selected status
        const queryParams = this.currentStatus
          ? { statusId: this.currentStatus.id }
          : {};
        this.router.navigate([], {
          queryParams,
          queryParamsHandling: "merge",
        });

        // Save the selected status in component variable
        this.currentStatus = selectedStatus;
        console.log("The status has been saved:", this.currentStatus);

        if (this.currentStatus.name === "Palletiseren") {
          console.log("Palletiseren has been selected");
          this.showFields = true;
          this.showLoodFields = false;
          this.currentStatus.palletNumber = this.currentPalletNumber;
        } else if (
          this.currentStatus &&
          (this.currentStatus.id === 11 ||
            this.currentStatus.name === "Aankomst")
        ) {
          console.log("Aankomst status with the id of 11 has been selected");
          this.showLoodFields = true;
          this.showFields = false;
        } else {
          console.log("Neither Palletiseren nor Aankomst has been selected");
          this.showFields = false;
          this.showLoodFields = false;
          this.currentLoodLocatie = this.loodLocatieNumber;
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
    } catch (error) {
      console.error(error);
    }
  }

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
      const data = await this.storage.get("login");

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
          const toast = await this.toastController.create({
            message: "Pallet number saved successfully",
            duration: 2000,
            color: "success",
            position: "bottom",
          });
          toast.present();

          // Save the currentStatus and palletNumber in browser storage
          localStorage.setItem(
            "selectedStatus",
            JSON.stringify(this.currentStatus)
          );
          localStorage.setItem("palletNumber", this.currentStatus.palletNumber);

          this.palletNumber = ""; // Reset the input value
          this.saveButtonClicked = false; // Reset the flag
        } catch (error) {
          console.log("Error saving pallet number: ", error);

          // Display an error toast
          const toast = await this.toastController.create({
            message: "Error saving pallet number",
            duration: 2000,
            color: "danger",
            position: "bottom",
          });
          toast.present();
        }
      } else {
        console.log("Button has not been clicked yet, data not saved.");
      }
    }
  }

  async onsaveLoodlocatienumber() {
    const apiURL = "https://ssl.app.sr/api/save-aankomst";
  
    this.storage.get("status").then((response) => {
      if (response && response.pallet_data && response.pallet_data.pakket_id) {
        const currentId = response.pallet_data.pakket_id;
  
        // Retrieve the user-inputted loodLocatieNumber from the component property
        const loodLocatieNumber = this.loodLocatieNumber;
  
        // Modify the response object directly
        response.pallet_data.lood_locatie_nummer = loodLocatieNumber;
  
        const payload = {
  
          lood_locatie_number: loodLocatieNumber,
        };
  
        // Perform the HTTP POST request to save the loodLocatieNumber
        this.http.post(apiURL, payload).subscribe(
          (data) => {
            console.log("Post request successful:", data);
            this.showToast(
              "Lood locatie number updated successfully",
              "success"
            );
            localStorage.setItem(
              "loodLocatieNumber",
              this.loodLocatieNumber.toString()
            );
            // Update the storage with the modified response object
            this.storage.set("status", response);
          },
          (error) => {
            console.error("Post request failed:", error);
            if (error.status === 404) {
              this.showToast("Invalid pakket ID", "danger");
            } else if (error.status === 500) {
              this.showToast("Failed to update lood locatie number", "danger");
            } else {
              this.showToast("Error updating lood locatie number", "danger");
            }
          }
        );
      } else {
        console.log("No current ID found in local storage");
        this.showToast("No matching ID found", "danger");
      }
    });
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

  onClearPalletNumber() {
    this.palletNumber = "";
    this.currentStatus.palletNumber = ""; // Clear the pallet number in the currentStatus object
  }

  clearLoad(){
    this.loodLocatieNumber = "";
    this.currentStatus.loadLocatieNumber = "";
    console.log("was it cleared? ")
  }
 

  toggleDarkMode(event) {
    this.storage.set("mode", event.detail.checked);
    this.mode = event.detail.checked;
    console.log(this.mode); // Add this line to check the value of the mode property
    if (event.detail.checked) {
      document.body.setAttribute("color-theme", "dark");
    } else {
      document.body.setAttribute("color-theme", "light");
    }
  }
  
 

  logout() {
  const itemsToRemove = [
    "login",
    "status",
    "selectedStatus",
    "currentStatus",
    "palletNumber",
    "loodLocatieNumber"
  ];

  itemsToRemove.forEach(item => {
    localStorage.removeItem(item);
  });

  console.log("Local storage cleared.");
  this.router.navigateByUrl("/login");
}

}
