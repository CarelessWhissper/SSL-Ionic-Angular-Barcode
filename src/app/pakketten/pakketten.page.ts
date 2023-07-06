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
  pakketten: any;
  input: string;
  status: any;
  statusName: any;
  pakId: any;
  switch: number = 0;
  filteredPakketten: any;
  clickCounter: number = 0;

  constructor(
    public http: HttpClient,
    public loadingController: LoadingController,
    private alertController: AlertController,
    private popoverController: PopoverController,
    private storage: Storage
  ) {}

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'pakketten worden geladen...',
    });
    await loading.present();

    try {
      this.status = JSON.parse(localStorage.getItem('currentStatus'));

      const location = await this.getLocation();
      const params = {
        search: 'all',
        location: location,
      };
      const response = await this.http
        .get<any[]>('https://ssl.app.sr/api/packages', { params })
        .toPromise();
      this.pakketten = response;
      this.filteredPakketten = response;
    } catch (error) {
      console.log('Error retrieving packages:', error);
    } finally {
      await loading.dismiss();
    }
  }


  async showConfirmationDialog(id: string, status_id: number) {
    console.log("the pakket id is", id);
    console.log("the status of the package is", status_id);
  
    const pakket = this.pakketten.find((pakket) => pakket.id === id);
    const pakket_id = pakket ? pakket.pakket_id : id;
  
    const alert = await this.alertController.create({
      header: `Wilt u de status wijzigen van het pakket ${pakket_id}?`,
      buttons: [
        {
          text: "Ja",
          handler: () => {
            console.log("Current status:", status_id);
            this.doChangeStatus(id, status_id);
          },
        },
        {
          text: "Nee",
          handler: () => {
            // Handle "Nee" button action
          },
        },
      ],
    });
  
    await alert.present();
  }

  onChangeSearch() {
    if (this.input && this.input.trim() !== "") {
      this.filteredPakketten = this.pakketten.filter((pakket) =>
        pakket.pakket_id.toLowerCase().includes(this.input.toLowerCase())
      );
    } else {
      this.filteredPakketten = this.pakketten;
    }
  }

  async getPackages() {
    try {
      const location = await this.getLocation();
      console.log(location);
      const response = await this.http
        .get<any[]>(
          `https://ssl.app.sr/api/packages?search=all&location=${location}`
        )
        .toPromise();
      const packages = response;
      console.log(packages);
    } catch (error) {
      console.error(error);
    }
  }

  getLocation(): Promise<string> {
    return this.storage.get("login").then((data) => {
      const locatie = data.locatie;
      console.log("send me your location ", locatie);

      if (locatie === null) {
        console.log("geen pakketten beschikbaar");
      } else if (locatie.toLowerCase() === "surinamehoofd") {
        return "suriname";
      } else {
        return "nederland";
      }
    });
  }

  async changeStatus(paket) {
    const newStatus = paket.status_id + 1;
    console.log("Checking if pak.status exists:", paket.status_id);

    const alert = await this.alertController.create({
      header: "Wilt u zeker de status wijzigen?",
      buttons: [
        {
          text: "Ja",
          handler: async () => {
            const success = await this.doChangeStatus(paket.id, newStatus);
            if (success) {
              this.presentAlert(`Pakket ${paket.id} gewijzigd naar status ${newStatus}`);
            } else {
              this.presentAlert("Er is een fout opgetreden tijdens het wijzigen van de status");
            }
          },
        },
        {
          text: "Nee",
          handler: () => {
            // Handle "Nee" button action
          },
        },
      ],
    });

    await alert.present();
  }

  async doChangeStatus(paketId: string, status_id: number): Promise<boolean> {
    let data = {
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

      const response = await this.http.post("https://ssl.app.sr/api/update-status", data).toPromise();
      console.log(response);

      // Update the status in the pakketten array or perform any other necessary actions
      await loading.dismiss();
      this.reloadPackages();
      return true;
    } catch (error) {
      console.error("Error changing status:", error);
      // Handle error scenario
      await this.loadingController.dismiss();
      return false;
    }
  }

  async loader() {
    const loading = await this.loadingController.create({
      spinner: "dots",
      cssClass: "alertCss",
      message: "Even geduld aub...",
    });

    await loading.present();
  }

  async presentAlert(message: string): Promise<void> {
    const alert = await this.alertController.create({
      message: message,
      buttons: ["OK"],
    });

    await alert.present();
  }

  async presentSortingOptions() {
    const popover = await this.popoverController.create({
      component: SortingOptionsComponent,
      showBackdrop: false,
      translucent: true,
      cssClass: "popoverCss",
    });

    popover.onWillDismiss().then((sortOption) => {
      if (sortOption && sortOption.data) {
        if (sortOption.data === "status_name") {
          this.sortByStatusName();
        } else if (sortOption.data === "pakket_id") {
          this.sortByPakketId();
        }
      }
    });

    await popover.present();
  }

  async sortByStatusName() {
    // Implement the sorting logic based on status_name
    const loader = await this.loadingController.create({
      message: "Sorting...",
    });
    await loader.present(); // Show the loader while retrieving sorted packages

    this.filteredPakketten.sort((a, b) => {
      const statusA = (a.status_name || "").toUpperCase();
      const statusB = (b.status_name || "").toUpperCase();

      if (statusA < statusB) {
        return -1;
      } else if (statusA > statusB) {
        return 1;
      } else {
        return 0;
      }
    });

    // Hide the loader after sorting is completed
    await loader.dismiss();
  }

  async sortByPakketId() {
    // Implement the sorting logic based on pakket_id
    const loader = await this.loadingController.create({
      message: 'Sorting...',
    });
    await loader.present(); // Show the loader while retrieving sorted packages

    this.filteredPakketten.sort((a, b) => {
      const pakketIdA = (a.pakket_id || '').toUpperCase();
      const pakketIdB = (b.pakket_id || '').toUpperCase();

      if (pakketIdA < pakketIdB) {
        return -1;
      } else if (pakketIdA > pakketIdB) {
        return 1;
      } else {
        return 0;
      }
    });

    // Hide the loader after sorting is completed
    await loader.dismiss();
  }

  toggleDetails(pakket: any) {
    pakket.showDetails = !pakket.showDetails;
  }

  getEyeIcon(pakket: any): string {
    return pakket.showDetails ? "eye-off" : "eye";
  }

  reloadPackages() {
    this.ngOnInit(); // Reinitialize the component to fetch fresh data
  }
}
