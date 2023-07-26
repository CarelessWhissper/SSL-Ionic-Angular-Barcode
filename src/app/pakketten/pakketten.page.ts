import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  LoadingController,
  AlertController,
  PopoverController,
} from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { SortingOptionsComponent } from "./SortingOptionsComponent";

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

  constructor(
    public http: HttpClient,
    public loadingController: LoadingController,
    private alertController: AlertController,
    private popoverController: PopoverController,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  //load packages from the api, based on user location
  async loadData() {
    // Show loading spinner while loading data
    const loading = await this.loadingController.create({
      message: "Pakketten worden geladen...",
    });
    await loading.present();

    try {
      const location = await this.getLocation();
      let apiUrl = "https://ssl.app.sr/api/packages"; // Default URL for "suriname" and "nederland"

      // Check for the new locations and set dedicated URLs accordingly using a switch statement
      switch (location) {
        case "amsterdam":
          apiUrl = "https://ssl.app.sr/api/amsterdam";
          break;
        case "rotterdam":
          apiUrl = "https://ssl.app.sr/api/Rotterdam";
          break;
        case "denhaag":
          apiUrl = "https://ssl.app.sr/api/DenHaag";
        case "utrecht":
          apiUrl = "https://ssl.app.sr/api/Utrecht";
          break;
        default:
          // Keep the default URL for "suriname" and "nederland"
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
    } else {
      const lowerCaseLocatie = locatie.toLowerCase();
      switch (lowerCaseLocatie) {
        case "surinamehoofd":
          return "suriname";
        case "amsterdam":
          return "amsterdam";
        case "rotterdam":
          return "rotterdam";
        case "denhaag":
          return "denhaag";
        default:
          return "nederland";
      }
    }
  }

  // Handle the search input change event
  async onChangeSearch() {
    console.log("Search input:", this.input);
    if (this.input && this.input.trim().length >= 5) {
      // Filter packages using the API
      await this.filterPackages();
  
      // Check if any matching packages are found
      this.noMatchingPackages = this.filteredPakketten.length === 0;
    } else {
      this.filteredPakketten = this.pakketten;
      this.noMatchingPackages = false; // Reset the flag when input is less than 5 characters
    }
  }
  
  // Filter packages based on the search input using the API

  async filterPackages() {
    console.log("Filtering packages...");
    const loading = await this.loadingController.create({
      message: "Zoeken...",
    });
    await loading.present();
  
    try {
      const searchInput = this.input.trim();
  
      const params = {
        search: searchInput,
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
      }));
  
      this.noMatchingPackages = this.filteredPakketten.length === 0; // Update the flag based on the search result
    } catch (error) {
      console.log("Error filtering packages:", error);
    } finally {
      await loading.dismiss();
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
      this.reloadPackages();
      console.log("doChangeStatus completed successfully");
      return true;
    } catch (error) {
      console.error("Error changing status:", error);
      await this.loadingController.dismiss();
      return false;
    }
  }

  async showConfirmationDialog(id: string, status_id: number) {
    console.log(
      "showConfirmationDialog called with id:",
      id,
      "and status_id:",
      status_id
    );
  
    // Get the corresponding pakket from the data source (this.filteredPakketten) using id
    const pakket = this.filteredPakketten.find((pakket) => pakket.id === id);
  
    // Check if the pakket is found and get the pakket_id
    const pakket_id = pakket ? pakket.pakket_id : null;
  
    const alert = await this.alertController.create({
      header: `Wilt u de status wijzigen van het pakket ${pakket_id}?`,
      buttons: [
        {
          text: "Ja",
          handler: () => {
            this.doChangeStatus(id, status_id);
          },
        },
        {
          text: "Nee",
          role: "cancel",
        },
      ],
    });
    console.log(pakket_id);
  
    await alert.present();
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
      case "verzender":
        this.sortByVerzender();
        break;
      case "ontvanger":
        this.sortByOntvanger();
        break;
      default:
        break;
    }
  }

  // Sort packages by status name
  sortByStatusName() {
    this.sortPackages((a, b) => {
      const statusA = (a.status_name || "").toUpperCase();
      const statusB = (b.status_name || "").toUpperCase();
      return statusA.localeCompare(statusB);
    });
  }

  // Sort packages by package ID
  sortByPakketId() {
    this.sortPackages((a, b) => {
      const pakketIdA = (a.pakket_id || "").toUpperCase();
      const pakketIdB = (b.pakket_id || "").toUpperCase();
      return pakketIdA.localeCompare(pakketIdB);
    });
  }

  // Sort packages by sender
  sortByVerzender() {
    this.sortPackages((a, b) => {
      const verzenderA = (a.verzender || "").toUpperCase();
      const verzenderB = (b.verzender || "").toUpperCase();
      return verzenderA.localeCompare(verzenderB);
    });
  }

  // Sort packages by recipient
  sortByOntvanger() {
    this.sortPackages((a, b) => {
      const ontvangerA = (a.ontvanger || "").toUpperCase();
      const ontvangerB = (b.ontvanger || "").toUpperCase();
      return ontvangerA.localeCompare(ontvangerB);
    });
  }

  // Sort packages based on the provided compare function
  sortPackages(compareFn: (a: any, b: any) => number) {
    this.filteredPakketten.sort(compareFn);
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
}
