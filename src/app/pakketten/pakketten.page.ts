import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  LoadingController,
  AlertController,
  PopoverController,
} from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { SortingOptionsComponent } from "./SortingOptionsComponent";
import { ChangeDetectorRef } from "@angular/core";

import { ModalController } from "@ionic/angular";
import { NewPackageModalComponent } from "./new-package-modal/new-package-modal.component";

@Component({
  selector: "app-pakketten",
  templateUrl: "./pakketten.page.html",
  styleUrls: ["./pakketten.page.scss"],
})
export class PakkettenPage implements OnInit {
  pakketten: any[];
  input: string;
  filteredPakketten: any[];
  noMatchingPackages = false;
  expandedCardId: string | null = null;

  constructor(
    public http: HttpClient,
    public loadingController: LoadingController,
    private alertController: AlertController,
    private popoverController: PopoverController,
    private storage: Storage,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  private storedSearchInput: string = "";

  async loadData() {
    const loading = await this.loadingController.create({
      message: "Pakketten worden geladen...",
    });
    await loading.present();

    try {
      const location = await this.getLocation();
      let apiUrl;

      switch (location.toLowerCase()) {
        case "amsterdam":
          apiUrl = "https://ssl.app.sr/api/amsterdam";
          break;
        case "rotterdam":
          apiUrl = "https://ssl.app.sr/api/Rotterdam";
          break;
        case "denhaag":
          apiUrl = "https://ssl.app.sr/api/DenHaag";
          break;
        case "utrecht":
          apiUrl = "https://ssl.app.sr/api/Utrecht";
          break;
        default:
          apiUrl = "https://ssl.app.sr/api/packages"; // Default URL for "suriname" and "nederland"
          break;
      }

      const params = {
        search: "all",
        location: location,
      };

      const response = await this.http
        .get<any[]>(apiUrl, { params })
        .toPromise();

      this.pakketten = response;
      this.filteredPakketten = response; // Initially set filteredPakketten to all packages
    } catch (error) {
      console.log("Error retrieving packages:", error);
    } finally {
      await loading.dismiss();
    }
  }

  async getLocation(): Promise<string> {
    const data = await this.storage.get("login");
    const locatie = data ? data.locatie : null;

    if (locatie === null) {
      console.log("Geen pakketten beschikbaar");
    }

    return locatie !== null ? locatie.toLowerCase() : "nederland";
  }

  // Handle the search input change event
  async onChangeSearch() {
    console.log("Search input:", this.input);
    if (this.input && this.input.trim().length >= 0) {
      // Store the current search input
      this.storedSearchInput = this.input;

      // Filter packages using the API
      await this.filterPackages();

      // Check if any matching packages are found
      this.noMatchingPackages = this.filteredPakketten.length === 0;
    } else {
      this.filteredPakketten = this.pakketten;
      this.noMatchingPackages = false; // Reset the flag when input is less than 3 characters
    }
  }

  // Filter packages based on the search input using the API

  private typingTimer: any;

  async filterPackages(searchInput?: string) {
    console.log("Filtering packages...");

    const startTime = new Date().getTime();
    const loading = await this.loadingController.create({
      message: "Zoeken...",
    });
    await loading.present();

    try {
      const input = searchInput || this.input.trim();

      const params = {
        search: input,
      };

      console.log("Filtering with params:", params); // Log the params being used for the API request

      const response = await this.http
        .get<any[]>("https://ssl.app.sr/api/display", { params })
        .toPromise();

      console.log("Search input:", searchInput);
      console.log("Filtered packages:", response); // Log the API response to inspect the pakket_id values

      // Update the filteredPakketten array with the updated response from the API
      this.filteredPakketten = response.map((item) => ({
        id: item.id,
        pakket_id: item.pakket_id, // Include the pakket_id field in the filtered packages
        klant_id: item.klant_id,
        ontvanger_id: item.ontvanger_id,
        volume: item.volume,
        status_id: item.status_id,
        ontvanger: item.ontvanger,
        verzender: item.verzender,
        status_name: item.status_name,
        bestemming: item.bestemming,
        verzendadres: item.verzendadres,
        locatie: item.locatie,
        number: item.number,
      }));
      console.log(this.filteredPakketten, "the pakketten");

      this.noMatchingPackages = this.filteredPakketten.length === 0; // Update the flag based on the search result
    } catch (error) {
      console.log("Error filtering packages:", error);
    } finally {
      await loading.dismiss();
      const endTime = new Date().getTime();
      const elapsedTime = endTime - startTime;
      console.log(`Time taken to load data: ${elapsedTime} milliseconds`);
    }
  }

  async doChangeStatus(paketId: string, status_id: number): Promise<boolean> {
    console.log(
      "doChangeStatus called with paketId:",
      paketId,
      "and status_id:",
      status_id
    );

    const data = {
      id: paketId,
      status_id: status_id,
    };

    try {
      const loading = await this.loadingController.create({
        spinner: "dots",
        cssClass: "alertCss",
        message: "Even geduld aub...",
      });
      await loading.present();

      const response = await this.http
        .post("https://ssl.app.sr/api/update-status", data)
        .toPromise();
      console.log("API response:", response);

      await loading.dismiss();
      if (this.storedSearchInput.trim().length > 0) {
        clearTimeout(this.typingTimer); // Clear the previous timer

        this.typingTimer = setTimeout(() => {
          this.filterPackages(this.storedSearchInput);
        }, 500); // Set a delay of 500 milliseconds (adjust as needed)
      }

      console.log("doChangeStatus completed successfully");
      return true;
    } catch (error) {
      console.error("Error changing status:", error);
      await this.loadingController.dismiss();
      return false;
    }
  }

  async showConfirmationDialog(id: string, status: number) {
    console.log(
      "showConfirmationDialog called with id:",
      id,
      "and status_id:",
      status
    );

    // Get the corresponding pakket from the data source (this.filteredPakketten) using id
    const pakket = this.filteredPakketten.find((pakket) => pakket.id === id);

    // Check if the pakket is found and get the pakket_id
    const pakket_id = pakket ? pakket.pakket_id : null;

    const currentStatusName = pakket ? pakket.status_name : "";

    // Retrieve the selected status from local storage
    const selectedStatus = JSON.parse(localStorage.getItem("selectedStatus"));
    const selectedStatusId = selectedStatus ? selectedStatus.id : 0;
    const selectedStatusName = selectedStatus
      ? selectedStatus.name
      : "Unknown Status";

    console.log("what is the selected status really: ", selectedStatus);
    console.log("what is the selected statusId really: ", selectedStatusId);

    const alert = await this.alertController.create({
      header: `Wilt u de status "${currentStatusName}" wijzigen van het pakket ${pakket_id} naar de status "${selectedStatusName}"?`,
      buttons: [
        {
          text: "Ja",
          handler: () => {
            console.log(status);
            if (selectedStatusId == 10) {
              //show pallet nummer input
              this.showPalletInput(id, selectedStatusId);
            } else if (selectedStatusId === 11) {
              //lood locatie input
              console.log("status is 10 btw");
              this.showLoodLocatieInput(id, selectedStatusId);
            } else {
              this.doChangeStatus(id, selectedStatusId);
            }
          },
        },
        {
          text: "Nee",
          role: "cancel",
        },
      ],
    });

    console.log("the  selected package is: ", pakket_id);
    console.log("the  selected packageID is: ", id);
    localStorage.setItem("selected_pakket_id", id);
    localStorage.setItem("selected_paket", pakket_id);

    await alert.present();
  }
  async showPalletInput(id: string, status_id: number) {
    const alert = await this.alertController.create({
      header: "Voer pallet nummer in",
      inputs: [
        {
          name: "pallet_number",
          type: "text",
          placeholder: "",
        },
      ],
      buttons: [
        {
          text: "OK",
          handler: (data) => {
            // Handle the data. You can make the POST request here.
            const pallet_number = data.pallet_number;
            this.doChangeStatusWithPalletNumber(pallet_number);
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });

    await alert.present();
  }

  async doChangeStatusWithPalletNumber(pallet_number: string) {
    const apiURL = "https://ssl.app.sr/api/save-pallet2";

    const retrieveId = localStorage.getItem("selected_pakket_id");
    const retrievePackageName = localStorage.getItem("selected_paket");

    console.log("retrievedID: ", retrieveId);
    console.log("PackageName: ", retrievePackageName);

    const payload = {
      id: retrieveId,
      pakket_id: retrievePackageName,
      pallet_number: pallet_number,
    };
    try {
      const loading = await this.loadingController.create({
        spinner: "dots",
        cssClass: "alrertCss",
        message: "Even geduld aub...",
      });
      await loading.present();

      const response = await this.http.post(apiURL, payload).toPromise();

      console.log("the response for uploading pallet number is ", response);
      await loading.dismiss();
      this.filterPackages();
    } catch (error) {
      console.log("something went wrong ", error);
    }
  }

  async showLoodLocatieInput(id: string, status_id: number) {
    const alert = await this.alertController.create({
      header: "Voer lood locatie nummer in",
      inputs: [
        {
          name: "loodLocatie",
          type: "text",
          placeholder: "",
        },
      ],
      buttons: [
        {
          text: "OK",
          handler: (data) => {
            // Handle the data. You can make the POST request here.
            const loodLocatie = data.loodLocatie;
            this.doChangeStatusWithLoodLocatie(loodLocatie);
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });

    await alert.present();
  }

  async doChangeStatusWithLoodLocatie(loodLocatie: String) {
    const apiURL = "https://ssl.app.sr/api/save-aankomst2";

    const retrieveId = localStorage.getItem("selected_pakket_id");
    const retrievePackageName = localStorage.getItem("selected_paket");

    console.log("id: " + retrieveId + "name: " + retrievePackageName);

    const payload = {
      id: retrieveId,
      pakket_id: retrievePackageName,
      lood_locatie_number: loodLocatie,
    };

    try {
      const loading = await this.loadingController.create({
        spinner: "dots",
        cssClass: "alertCss",
        message: "Even geduld aub...",
      });
      await loading.present();

      const response = await this.http.post(apiURL, payload).toPromise();
      console.log("Response is: ", response);

      // Dismiss the loading spinner after a successful API call
      await loading.dismiss();
      this.filterPackages();
    } catch (error) {
      console.error("Error:", error);

      // Ensure the loading spinner is dismissed even in case of an error
    }
  }

  // Show the sorting options popover
  async presentSortingOptions() {
    const popover = await this.popoverController.create({
      component: SortingOptionsComponent,
      showBackdrop: false,
      translucent: true,
      cssClass: "popoverCss",
    });

    popover.onWillDismiss().then((sortOption) => {
      if (sortOption && sortOption.data) {
        this.handleSortingOption(sortOption.data);
      }
    });

    await popover.present();
  }

  // Handle the selected sorting option
  handleSortingOption(option: string) {
    switch (option) {
      case "status_name":
        this.sortByStatusName();
        break;
      case "pakket_id":
        this.sortByPakketId();
        break;

      case "number":
        this.sortByNumber();
        break;
      default:
        break;
    }
  }

  currentSortOrder: "asc" | "desc" = "asc";

  // Sort packages by status name
  sortByStatusName() {
    console.log("Sorting by status name");
    this.toggleSortOrder();
    this.sortPackages((a, b) => {
      const statusA = a.status_name || "";
      const statusB = b.status_name || "";
      const result = statusA.localeCompare(statusB);
      return this.currentSortOrder === "asc" ? result : -result;
    });
  }

  //sort packages by number a.k.a the lood locatie number

  sortByNumber() {
    console.log("Sorting by number");
    this.toggleSortOrder();
    this.sortPackages((a, b) => {
      const numberA = a.number ? (a.number || "").toUpperCase() : "";
      const numberB = b.number ? (b.number || "").toUpperCase() : "";
      const result = numberB.localeCompare(numberA);
      return this.currentSortOrder === "asc" ? result : -result;
    });
  }

  // Sort packages by package ID
  sortByPakketId() {
    console.log("Sorting by pakket_id");
    this.toggleSortOrder();
    this.sortPackages((a, b) => {
      const pakketIdA = a.pakket_id || "";
      const pakketIdB = b.pakket_id || "";
      const result = pakketIdA.localeCompare(pakketIdB);
      return this.currentSortOrder === "asc" ? result : -result;
    });
  }

  // Sort packages based on the provided compare function
  sortPackages(compareFn: (a: any, b: any) => number) {
    this.filteredPakketten.sort(compareFn);
    console.log("Sorted packages:", this.filteredPakketten);
    this.cdr.markForCheck();
  }

  // Add a method to toggle the sort order
  toggleSortOrder() {
    this.currentSortOrder = this.currentSortOrder === "asc" ? "desc" : "asc";
  }

  // Toggle showing package details
  toggleDetails(pakket: any) {
    pakket.showDetails = !pakket.showDetails;
  }

  // Get the eye icon based on whether details are shown or not
  getEyeIcon(pakket: any): string {
    return pakket.showDetails ? "eye-off" : "eye";
  }

  // Reload packages data
  reloadPackages() {
    this.loadData();
  }

  // Show an alert with the provided message
  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      message: message,
      buttons: ["OK"],
    });

    await alert.present();
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  }
  transformAfz(value: string) {
    return this.truncateText(value, 13)
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  toggleCardExpansion(cardId: string) {
    console.log("Card clicked:", cardId);

    if (this.expandedCardId === cardId) {
      this.expandedCardId = null; // Collapse the card if it's already expanded
    } else {
      this.expandedCardId = cardId; // Expand the clicked card
    }
    console.log("expandedCardId:", this.expandedCardId);
  }

  async addNewPackage() {
    // Implement your logic here, for example, opening a modal
    console.log("Add New Package button clicked!");
    this.presentNewPackageModal();
  }

  // Method to present the new package modal
  async presentNewPackageModal() {
    const modal = await this.modalController.create({
      component: NewPackageModalComponent,
      componentProps: {
        existingPackages: this.filteredPakketten, // Pass the existing packages to check for duplicates
      },
      cssClass: "custom-modal-css", // You can define your own modal CSS class
    });

    modal.onDidDismiss().then((result) => {
      // Handle the result if needed (data returned from the modal)
      if (result.data) {
        console.log("New package data:", result.data.newPackage);
        // You can process the new package data here
      }
    });

    await modal.present();
  }
}
