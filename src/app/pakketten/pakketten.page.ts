import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LoadingController, AlertController, PopoverController } from "@ionic/angular";
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

  // Load packages data from the API
  async loadData() {
    // Show loading spinner while loading data
    const loading = await this.loadingController.create({
      message: "Pakketten worden geladen...",
    });
    await loading.present();

    try {
      const location = await this.getLocation();
      const params = {
        search: "all",
        location: location,
      };
      const response = await this.http
        .get<any[]>("https://ssl.app.sr/api/packages", { params })
        .toPromise();
      this.pakketten = response;
      this.filteredPakketten = response; // Initially set filteredPakketten to all packages
    } catch (error) {
      console.log("Error retrieving packages:", error);
    } finally {
      await loading.dismiss();
    }
  }

  // Get the location from storage
  async getLocation(): Promise<string> {
    const data = await this.storage.get("login");
    const locatie = data ? data.locatie : null;

    if (locatie === null) {
      console.log("Geen pakketten beschikbaar");
    } else if (locatie.toLowerCase() === "surinamehoofd") {
      return "suriname";
    } else {
      return "nederland";
    }
  }

  // Handle the search input change event
  async onChangeSearch() {
    console.log("Search input:", this.input);
    if (this.input && this.input.trim().length >= 5) {
      // Filter packages using the API
      await this.filterPackages();
    } else {
      this.filteredPakketten = this.pakketten;
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
      console.log("Filtered packages:", response);

      this.filteredPakketten = response;
    } catch (error) {
      console.log("Error filtering packages:", error);
    } finally {
      await loading.dismiss();
    }
  }

  // Show a confirmation dialog to change the package status
  async showConfirmationDialog(id: string, status_id: number) {
    const pakket = this.pakketten.find((pakket) => pakket.id === id);
    const pakket_id = pakket ? pakket.pakket_id : id;

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

    await alert.present();
  }

  // Change the package status using the API
  async doChangeStatus(paketId: string, status_id: number): Promise<boolean> {
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
      await loading.dismiss();
      this.reloadPackages();
      return true;
    } catch (error) {
      console.error("Error changing status:", error);
      await this.loadingController.dismiss();
      return false;
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
