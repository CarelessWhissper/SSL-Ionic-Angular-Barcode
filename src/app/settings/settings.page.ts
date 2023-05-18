import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Storage } from "@ionic/storage";
import { Router, ActivatedRoute } from "@angular/router";


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
  showPalletiseren: boolean;
  selectedStatus: any;
  currentPalletNumber: string;
  palletNumber: any;
  statusList: any[] = [];
  saveButtonClicked = false;
  selectedStatusId : number;
  parsedStatus :any;
  
  
   // Show palletiseren fields
  showPalletiserenFields() {
    this.showFields = true;
  }
  // Hide palletiseren fields
  hidePalletiserenFields() {
    this.showFields = false;
  }

  constructor(
    private Storage: Storage,
    private router: Router,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() { 

    // const isFirstOpen = localStorage.getItem("isFirstOpen");

    // if (!isFirstOpen) {
    //   // Clear the stored values from local storage
    //   localStorage.removeItem("login");
    //   localStorage.removeItem("status");
    //   localStorage.removeItem("selectedStatus");
    //   localStorage.removeItem("currentStatus");
    //   localStorage.removeItem("palletNumber");
  
    //   // Set the flag to indicate that the application has been opened
    //   localStorage.setItem("isFirstOpen", "true");
    // }



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
      }
    });
  
    // Get the current status from the query parameter
    this.activatedRoute.queryParams.subscribe((params) => {
      const statusId = params["statusId"];
      const storedStatus = localStorage.getItem("selectedStatus");
  
      if (statusId) {
        const selectedStatus = this.statusList.find((status) => status.id === +statusId);
        if (selectedStatus) {
          this.currentStatus = selectedStatus;
          this.selectedStatusId = selectedStatus.id;
          localStorage.setItem("selectedStatus", JSON.stringify(this.currentStatus));
          localStorage.setItem("currentStatus", JSON.stringify(this.currentStatus));
          console.log("The status has been saved:", this.currentStatus);
        }
      } else if (storedStatus) {
        this.currentStatus = JSON.parse(storedStatus);
        this.selectedStatusId = this.currentStatus ? this.currentStatus.id : null;
        console.log("The status has been retrieved from browser storage:", this.currentStatus);
      }
  
      // Retrieve the stored pallet number from browser storage
      const storedPalletNumber = localStorage.getItem("palletNumber");
      if (this.currentStatus && storedPalletNumber) {
        this.currentStatus.palletNumber = storedPalletNumber;
        console.log("The pallet number is:", storedPalletNumber);
      }
    });
  }
  



  
  onChangeStatus() {
  this.saveButtonClicked = false;
  try {
    if (this.selectedStatusId) {
      const selectedStatus = this.statusList.find((status) => status.id === this.selectedStatusId);
      if (selectedStatus) {
        this.currentStatus = selectedStatus;
        // Update the query parameter with the selected status
        const queryParams = this.currentStatus ? { statusId: this.currentStatus.id } : {};
        this.router.navigate([], {
          queryParams,
          queryParamsHandling: "merge",
        });

        // Save the selected status in browser storage
        localStorage.setItem("currentStatus", JSON.stringify(this.currentStatus));
        console.log(this.currentStatus);
        
       // localStorage.setItem("selectedStatus", JSON.stringify(this.currentStatus));

        if (this.currentStatus.name === "Palletiseren") {
          console.log("palletiseren has been selected");
          this.showFields = true;
          this.currentStatus.palletNumber = this.currentPalletNumber;
        } else {
          console.log("palletiseren has not been selected");
          this.showFields = false;
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
        this.http
          .post(apiUrl, playLoad)
          .toPromise()
          .then((data) => {
            console.log("Pallet number is saved successfully");


            // save the currentStatus and palletNumber in browser storage

            localStorage.setItem("selectedStatus",JSON.stringify(this.currentStatus));
            localStorage.setItem("palletNumber",this.currentStatus.palletNumber);


            this.palletNumber = ""; // Reset the input value
            this.saveButtonClicked = false; // Reset the flag
          })
          .catch((error) => {
            console.log("Error saving pallet number: ", error);
          });
      } else {
        console.log("Button has not been clicked yet, data not saved.");
      }
    }
  }

  onClearPalletNumber() {
    this.palletNumber = '';
    this.currentStatus.palletNumber = ''; // Clear the pallet number in the currentStatus object
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
