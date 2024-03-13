import { Storage } from "@ionic/storage";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastController } from "@ionic/angular";
import { Observable, from } from "rxjs";
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
  showPalletNumber: boolean = false;

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

  storedStatus: { id: number; name: string } | null = null; // Initialize it as null

  constructor(
    private storage: Storage,
    private router: Router,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController
  ) {
    this.currentId = null;

    this.storage
      .get("mode")
      .then((mode) => {
        if (mode) {
          document.body.setAttribute("color-theme", "dark");
        } else {
          document.body.setAttribute("color-theme", "light");
        }
        this.mode = mode;
      })
      .catch((error) => {
        console.error("Error retrieving mode from storage:", error);
      });

    const storedStatusString = localStorage.getItem("selectedStatus");
    if (storedStatusString) {
      this.storedStatus = JSON.parse(storedStatusString);
    }
  }

  dataObservable: Observable<any>;

  ngOnInit() {
    this.storage.get("login").then(
      (data) => {
        if (data) {
          this.name = data.name;
          this.email = data.email;
          this.role = data.role;
          this.locatie = data.locatie;
          console.log("Location obtained:", this.locatie); // Add this log
        } else {
          // Handle missing data
          console.log("no data found");
        }
      },
      (error) => {
        console.error("Error fetching data from storage:", error);
        // Handle the error, e.g., show an error message to the user
      }
    );

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
            "Updated number is: ",
            response.pallet_data.lood_locatie_nummer
          );
        }
      } else {
        console.log("No data in statusList just yet,");
      }
      localStorage.removeItem("palletNumber");
      const palletNumber = localStorage.getItem("palletNumber");

      if (palletNumber === null) {
        console.log("palletNumber has been removed from local storage.");
      } else {
        console.log(
          "palletNumber is still present in local storage:",
          palletNumber
        );
      }
    });

    // Get the current status from the query parameter or browser storage
    this.activatedRoute.queryParams.subscribe((params) => {
      const statusId = params["statusId"];
      const storedStatusString = localStorage.getItem("selectedStatus");
      let storedStatus;

      if (storedStatusString) {
        storedStatus = JSON.parse(storedStatusString);
      }

      console.log("Status ID from query parameter:", statusId);
      console.log("Stored status from localStorage:", storedStatus);

      // Check if statusId is undefined and storedStatus is null or empty
      if (statusId !== undefined && !storedStatus) {
        // Create a new status object from the query parameter and set it in local storage
        const newStatus = { id: statusId, name: "Unknown" }; // You may want to set a default name
        localStorage.setItem("selectedStatus", JSON.stringify(newStatus));
        storedStatus = JSON.stringify(newStatus); // Update the storedStatus variable
      }

      // Check if statusId is present and retrieve the corresponding status
      if (statusId) {
        const selectedStatus = this.statusList.find(
          (status) => status.id === +statusId
        );
        if (selectedStatus) {
          // Update currentStatus if it's different from selectedStatus
          if (
            !this.currentStatus ||
            this.currentStatus.id !== selectedStatus.id
          ) {
            this.currentStatus = selectedStatus;
            localStorage.setItem(
              "selectedStatus",
              JSON.stringify(this.currentStatus)
            );
            console.log(
              "Current status updated from query parameter:",
              this.currentStatus
            );
          }
        }
      } else if (storedStatus) {
        // Update currentStatus if it's different from storedStatus
        if (!this.currentStatus || this.currentStatus.id !== storedStatus.id) {
          this.currentStatus = storedStatus;
          console.log(
            "Current status updated from localStorage:",
            this.currentStatus
          );
        }
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

      // Update the showFields flag based on the selected status
      if (
        this.currentStatus &&
        (this.currentStatus.id === 10 ||
          this.currentStatus.name === "Palletiseren")
      ) {
        this.showFields = true;
      } else {
        this.showFields = false;
      }
      if (
        this.currentStatus &&
        (this.currentStatus.id === 11 ||
          this.currentStatus.name === "Aankomst in SR")
      ) {
        this.showLoodFields = true;
      } else {
        this.showLoodFields = false;
      }
    });

    this.loadPalletNumberFromStorage();

    // // Call the function to filter the status list based on the user's location
    this.filterStatusList();
  }

  loadPalletNumberFromStorage() {
    const storedPalletNumber = localStorage.getItem("palletNumber");
    if (storedPalletNumber) {
      this.palletNumber = storedPalletNumber;
      console.log("The pallet number is:", this.palletNumber);
    } else if (this.currentStatus && this.currentStatus.palletNumber) {
      this.palletNumber = this.currentStatus.palletNumber;
      setTimeout(() => {
        this.palletNumber = this.currentStatus.palletNumber;
        console.log("The pallet number is:", this.palletNumber);
      }, 0);
    }
  }

  filterStatusList() {
    console.log("Making HTTP request to retrieve status list...");
    this.http.get<any>("https://ssl.app.sr/api/get-status").subscribe(
      (data) => {
        console.log("Received data:", data);
        // Clear the status list
        this.statusList = [];

        // Filter status list based on location
        if (this.locatie === "surinamehoofd") {
          // Filter statuses for Surinamehoofd
          this.statusList = data.status.filter((status: any) =>
            [1, 2, 3, 11].includes(+status.id)
          );
        } else if (
          [
            "nederland",
            "amsterdam",
            "rotterdam",
            "denhaag",
            "utrecht",
          ].includes(this.locatie)
        ) {
          // Filter statuses for Dutch cities
          const customOrder = [9, 10, 4];
          this.statusList = data.status.filter((status: { id: number }) =>
            customOrder.includes(+status.id)
          );
          this.statusList.sort(
            (a, b) => customOrder.indexOf(+a.id) - customOrder.indexOf(+b.id)
          );
        } else {
          console.log("No status data available for the current location.");
        }
        console.log("Filtered status list:", this.statusList);
      },
      (error) => {
        console.error("Error occurred while fetching status data:", error);
      }
    );
  }

  onChangeStatus() {
    console.log("Selected Status ID:", this.selectedStatusId); // Log the selected status ID
    console.log("Status List:", this.statusList); // Log the status list

    // Show/hide Palletiseren fields based on the selected status
    if (this.selectedStatusId === 10) {
      this.showPalletiserenFields();
    } else {
      this.hidePalletiserenFields();
    }

    // Find the selected status from the status list
    const selectedStatus = this.statusList.find(
      (status) => status.id === this.selectedStatusId
    );

    // Handle the selected status
    if (selectedStatus) {
      this.currentStatus = selectedStatus;
      console.log("The status has been saved:", this.currentStatus);
      localStorage.setItem(
        "selectedStatus",
        JSON.stringify(this.currentStatus)
      );

      // Handle different statuses
      if (this.currentStatus.name === "Palletiseren") {
        console.log("Palletiseren has been selected");
        this.showFields = true;
        this.showLoodFields = false;
        this.currentStatus.palletNumber = this.palletNumber;
      } else if (
        this.currentStatus.id === 11 ||
        this.currentStatus.name === "Aankomst in SR"
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

      // Update the query parameter with the selected status
      const queryParams = this.currentStatus
        ? { statusId: this.currentStatus.id }
        : {};
      this.router.navigate([], {
        queryParams,
        queryParamsHandling: "merge",
      });
    } else {
      // Placeholder option selected, set currentStatus to null
      this.currentStatus = null;
      // Hide the palletiseren fields or perform any other necessary actions
      this.router.navigate([], {
        queryParams: { statusId: null },
        queryParamsHandling: "merge",
      });
    }
  }

  async onSavePalletNumber() {
    const storedPalletNumber = localStorage.getItem("palletNumber");
    if (storedPalletNumber !== this.palletNumber) {
      localStorage.setItem("palletNumber", this.palletNumber);
      this.currentStatus.palletNumber = this.palletNumber;
      console.log("The pallet number is saved:", this.palletNumber);

      // Save the pallet number to the database
      const apiUrl = "https://ssl.app.sr/api/save-pallet";
      const data = await this.storage.get("login");
      const playLoad = {
        pallet_number: this.palletNumber,
        Locatie: data.locatie,
      };

      try {
        const response = await this.http.post(apiUrl, playLoad).toPromise();
        console.log("Pallet number is saved successfully to the database");

        // Display a success toast
        const toast = await this.toastController.create({
          message: "Pallet number saved successfully",
          duration: 2000,
          color: "success",
          position: "bottom",
        });
        toast.present();
      } catch (error) {
        console.log("Error saving pallet number to the database: ", error);

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
      console.log("The pallet number is already saved:", this.palletNumber);
    }
  }

  async onsaveLoodlocatienumber() {
    const apiURL = "https://ssl.app.sr/api/save-aankomst";

    this.storage.get("status").then((response) => {
      if (response && response.pallet_data && response.pallet_data.pakket_id) {
        const currentId = response.pallet_data.pakket_id;

        console.log("the currentId is for package",currentId);

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

  clearLoad() {
    this.loodLocatieNumber = "";
    this.currentStatus.loadLocatieNumber = "";
    console.log("was it cleared? ");
  }

  toggleDarkMode(event: any) {
    this.storage
      .set("mode", event.detail.checked)
      .then(() => {
        this.mode = event.detail.checked;
        document.body.setAttribute("color-theme", this.mode ? "dark" : "light");
      })
      .catch((error) => {
        console.error("Error saving mode to storage:", error);
      });
  }

  ionViewWillEnter() {
    this.storage
      .get("mode")
      .then((mode) => {
        if (mode) {
          document.body.setAttribute("color-theme", "dark");
        } else {
          document.body.setAttribute("color-theme", "light");
        }
        this.mode = mode;
      })
      .catch((error) => {
        console.error("Error retrieving mode from storage:", error);
      });
  }

  async logout() {
    try {
      // Clear all stored data from Ionic Storage
      await this.storage.clear();
      console.log("All data removed from Ionic Storage.");
  
      // Navigate to the login page after clearing the data
      this.router.navigateByUrl("/login");
    } catch (error) {
      console.error("Error clearing Ionic Storage:", error);
    }
  }
  
}
