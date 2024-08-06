import { Component, OnInit, NgZone } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  LoadingController,
  AlertController,
  PopoverController,
} from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { SortingOptionsComponent } from "./SortingOptionsComponent";
import { ChangeDetectorRef } from "@angular/core";
import { ToastController } from "@ionic/angular";

import { ModalController } from "@ionic/angular";
import { NewPackageModalComponent } from "./new-package-modal/new-package-modal.component";
import { debounceTime } from "rxjs/operators";
import { Subject } from "rxjs";

import { EditnumberComponent } from "../editnumber/editnumber.component";
import { NavController } from "@ionic/angular";
import { DataReloadService } from "../data-reload.service";

import { DelayedReasonModalComponent } from "../delayed-reason-modal/delayed-reason-modal.component";

@Component({
  selector: "app-pakketten",
  templateUrl: "./pakketten.page.html",
  styleUrls: ["./pakketten.page.scss"],
})
export class PakkettenPage implements OnInit {
  pakketten: any[];
  input: string;
  pakket_id: string;
  filteredPakketten: any[];
  noMatchingPackages = false;
  expandedCardId: string | null = null;
  loadingData: boolean = false;
  pageSize: number = 10; // Number of packages to load per request
  offset: number = 0; // Start at the beginning
  hasMorePackages: boolean = true; // Track if more packages are available
  isEditingNumber: boolean = false;
  editedNumber: string = "";
  pakket: any;
  pageTitle: string;
  userId: any;
  role:any;

  constructor(
    public http: HttpClient,
    public loadingController: LoadingController,
    private alertController: AlertController,
    private popoverController: PopoverController,
    private storage: Storage,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController,
    private navController: NavController,
    private dataReloadService: DataReloadService,
    private toastController: ToastController,
    private zone: NgZone
  ) {
    this.setPageTitle();
  }

  async ngOnInit() {
    await this.loadData();
    this.searchInputSubject.pipe(debounceTime(300)).subscribe(async (input) => {
      await this.filterPackages(input);
    });

    this.dataReloadService.reload$.subscribe(() => {
      // Call the method to reload the data
      this.loadData();
      console.log("Data reloaded");
    });
  }

  getSelectedStatus(): { id: number; name: string } | null {
    return JSON.parse(localStorage.getItem("selectedStatus")) || null;
  }

  private storedSearchInput: string = "";
  // Define a subject for the search input changes
  private searchInputSubject = new Subject<string>();

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      clearTimeout(this.typingTimer); // Clear the previous timer
      this.searchInputSubject.next(this.input); // Trigger the search immediately
    }
  }

  async loadData(initialLoad: boolean = true) {
    if (initialLoad) {
      this.offset = 0;
      this.pakketten = [];
      this.filteredPakketten = [];
      this.hasMorePackages = true;
    }

    this.loadingData = true;
    const loading = await this.loadingController.create({
      message: "Pakketten worden geladen...",
      spinner: "circles",
    });
    await loading.present();

    try {
      const data = await this.storage.get("login");

      const params = new HttpParams()
        .set('search', 'all')
        .set('userId', data.userId)
        .set('role', data.role)
        .set('limit', this.pageSize.toString())
        .set('offset', this.offset.toString());

      const response = await this.http
        .get<{ count: number; data: any[] }>(
          "https://ssl.app.sr/tester_app/api/packages",
          { params }
        )
        .toPromise();

      if (response.data.length < this.pageSize) {
        this.hasMorePackages = false; // No more packages to load
      }

      this.zone.run(() => {
        this.pakketten = [...this.pakketten, ...response.data];
        this.filteredPakketten = [...this.filteredPakketten, ...response.data];
      });

      this.offset += this.pageSize; // Update the offset for the next load
    } catch (error) {
      console.log("Error retrieving packages:", error);
    } finally {
      await loading.dismiss();
      this.loadingData = false;
    }
  }

  async loadMore(event: any) {
    if (this.hasMorePackages && !this.loadingData) {
      await this.loadData(false);
    }
    event.target.complete();
    if (!this.hasMorePackages) {
      event.target.disabled = true; // Disable infinite scroll if no more packages
    }
  }
  

  async applySearch(searchTerm: string) {
    this.offset = 0; // Reset offset for new search
    this.pakketten = [];
    this.hasMorePackages = true; // Reset pagination
    await this.loadData(true);
  }
  
  


  async setPageTitle() {
    const location = await this.getLocation();
    if (location === "surinamehoofd") {
      this.pageTitle = "Pakketten SR-NED";
    } else {
      this.pageTitle = "Pakketten NED-SR";
    }
  }

  async getLocation(): Promise<string> {
    const data = await this.storage.get("login");
    const locatie = data ? data.locatie : null;

    console.log("current locatie", locatie);

    if (locatie === null) {
      console.log("Geen pakketten beschikbaar");
    }

    return locatie !== null ? locatie.toLowerCase() : "nederland";
  }

  // Handle the search input change event

  // Filter packages based on the search input using the API

  private typingTimer: any;

  async filterPackages(searchInput?: string) {
    if (this.loadingData) {
      return;
    }

    this.loadingData = true;

    const loading = await this.loadingController.create({
      message: "Zoeken...",
    });
    await loading.present();

    try {
      const data = await this.storage.get("login");
      const params = {
        search: searchInput ? searchInput.trim() : "",
        userId: data.userId,
        role: data.role,
      };

      console.log("the search term is", searchInput);

      const response = await this.http
        .get<{ count: number; data: any[] }>(
          "https://ssl.app.sr/tester_app/api/packages",
          { params }
        )
        .toPromise();

      this.filteredPakketten = response.data;
      this.noMatchingPackages = this.filteredPakketten.length === 0;
    } catch (error) {
      console.log("Error filtering packages:", error);
    } finally {
      await loading.dismiss();
      this.loadingData = false;
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
        .post("https://ssl.app.sr/tester_app/api/update-status", data)
        .toPromise();
      console.log("API response:", response);

      await loading.dismiss();
      if (this.storedSearchInput.trim().length > 0) {
        clearTimeout(this.typingTimer); // Clear the previous timer

        this.typingTimer = setTimeout(() => {
          this.filterPackages(this.storedSearchInput);
        }, 1000); // Set a delay of 1000 milliseconds (adjust as needed)
      }

      console.log("doChangeStatus completed successfully");
      this.loadData();
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
    const selectedStatusId = selectedStatus
      ? parseInt(selectedStatus.id, 10)
      : 0; // Parse to integer
    const selectedStatusName = selectedStatus
      ? selectedStatus.name
      : "Unknown Status";

    console.log("what is the selected status really: ", selectedStatus);
    console.log("what is the selected statusId really: ", selectedStatusId);

    console.log("selectedStatusId:", selectedStatusId); // New debug statement

    const alert = await this.alertController.create({
      header: `Bevestiging`,
      message: `Wilt u de status van pakket ${pakket_id} wijzigen van "${currentStatusName}" naar "${selectedStatusName}"?
      `,
      buttons: [
        {
          text: "Nee",
          role: "cancel",
        },
        {
          text: "Ja",
          handler: () => {
            console.log(status);
            if (selectedStatusId == 10) {
              // Show pallet nummer input
              this.showPalletInput(id, selectedStatusId);
            } else if (selectedStatusId === 11) {
              // Lood locatie input
              console.log("status is 11");
              this.showLoodLocatieInput(id, selectedStatusId);
            } else {
              this.doChangeStatus(id, selectedStatusId);
            }
          },
        },
      ],
    });

    console.log("the selected package is: ", pakket_id);
    console.log("the selected packageID is: ", id);
    localStorage.setItem("selected_pakket_id", id);
    localStorage.setItem("selected_paket", pakket_id);

    try {
      await alert.present(); // Attempt to present the alert dialog
    } catch (error) {
      console.error("Error presenting alert:", error); // Handle error if alert presentation fails
    }
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
    try {
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

      console.log("Showing lood locatie input dialog...");
      await alert.present();
    } catch (error) {
      console.error("Error while showing lood locatie input dialog:", error);
    }
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
  async openDelayModal(pakket: any) {
    const modal = await this.modalController.create({
      component: DelayedReasonModalComponent,
      componentProps: { pakket: pakket }, // Pass the pakket object to the modal
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.confirmDelay(pakket.id, data);
    }
  }

  async confirmDelay(pakketId: number, reason: string) {
    const statusId = 14; // Status ID for delayed
    this.http
      .post("https://ssl.app.sr/tester_app/api/update-status", {
        id: pakketId,
        status_id: statusId,
        delay_reason: reason, // Make sure this matches the backend parameter
      })
      .subscribe(
        async (response) => {
          console.log("Package set to delayed:", response);
          // Update the UI to reflect the new status
          await this.showToast(
            "Package has been delayed successfully",
            "success"
          );
          this.loadData();
        },
        async (error) => {
          console.error("Error setting package to delayed:", error);
          await this.showToast("Failed to update package status.", "danger");
        }
      );
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

  isAankomstInSR(): boolean {
    const selectedStatus = localStorage.getItem("selectedStatus");
    if (selectedStatus) {
      const parsedStatus = JSON.parse(selectedStatus);
      console.log("hehexD", selectedStatus);
      return parsedStatus.name === "Aankomst in SR";
    }
    return false; // Default to false if selectedStatus is not found or cannot be parsed
  }

  async addNewPackage() {
    const modal = await this.modalController.create({
      component: NewPackageModalComponent,
      componentProps: {
        existingPackages: this.pakketten,
      },
    });

    modal.onDidDismiss().then(async (data) => {
      if (data && data.data && data.data.newPackage) {
        // Fetch the updated list from the server after adding a new package
        await this.filterPackages();

        // Reset the search input
        this.input = "";
      }
    });

    return await modal.present();
  }

  // Method to present the new package modal
  async presentNewPackageModal() {
    const modal = await this.modalController.create({
      component: NewPackageModalComponent,
      componentProps: {
        existingPackages: this.filteredPakketten, // Pass the existing packages to check for duplicates
      },
      cssClass: "custom-modal-css", //
    });

    modal.onDidDismiss().then((result) => {
      // Handle the result if needed (data returned from the modal)
      if (result.data) {
        console.log("New package data:", result.data.newPackage);
      }
    });

    await modal.present();
  }

  clearSearch() {
    this.input = ""; // Clear the search input
    this.loadData();
  }

  async openEditNumberModal(pakket: any) {
    const modal = await this.modalController.create({
      component: EditnumberComponent, // Adjust the component name accordingly
      componentProps: {
        number: pakket.number, // Pass the current number to the modal
        pakket_id: pakket.pakket_id,
        navController: this.navController,
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data && data.data.updatedNumber) {
        pakket.number = data.data.updatedNumber; // Update the number if it was changed in the modal
      }
    });

    return await modal.present();
  }

  stopEventPropagation(event: Event) {
    event.stopPropagation();
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: "bottom",
    });
    toast.present();
  }
}
