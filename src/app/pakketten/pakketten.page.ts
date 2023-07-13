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
  switch = 0;
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

  async loadData() {
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
      const response = await this.http.get<any[]>("https://ssl.app.sr/api/packages", { params }).toPromise();
      this.pakketten = response;
      this.filteredPakketten = response;
    } catch (error) {
      console.log("Error retrieving packages:", error);
    } finally {
      await loading.dismiss();
    }
  }

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

  onChangeSearch() {
    if (this.input && this.input.trim() !== "") {
      this.filteredPakketten = this.pakketten.filter((pakket) =>
        pakket.pakket_id.toLowerCase().includes(this.input.toLowerCase())
      );
    } else {
      this.filteredPakketten = this.pakketten;
    }
  }

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

  async changeStatus(paket: any) {
    const newStatus = paket.status_id + 1;

    const alert = await this.alertController.create({
      header: "Wilt u zeker de status wijzigen?",
      buttons: [
        {
          text: "Ja",
          handler: async () => {
            const success = await this.doChangeStatus(paket.id, newStatus);
            const message = success
              ? `Pakket ${paket.id} gewijzigd naar status ${newStatus}`
              : "Er is een fout opgetreden tijdens het wijzigen van de status";
            this.presentAlert(message);
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

      const response = await this.http.post("https://ssl.app.sr/api/update-status", data).toPromise();
      await loading.dismiss();
      this.reloadPackages();
      return true;
    } catch (error) {
      console.error("Error changing status:", error);
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

  async presentAlert(message: string) {
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

  sortByStatusName() {
    this.sortPackages((a, b) => {
      const statusA = (a.status_name || "").toUpperCase();
      const statusB = (b.status_name || "").toUpperCase();
      return statusA.localeCompare(statusB);
    });
  }

  sortByPakketId() {
    this.sortPackages((a, b) => {
      const pakketIdA = (a.pakket_id || "").toUpperCase();
      const pakketIdB = (b.pakket_id || "").toUpperCase();
      return pakketIdA.localeCompare(pakketIdB);
    });
  }

  sortPackages(compareFn: (a: any, b: any) => number) {
    this.filteredPakketten.sort(compareFn);
  }

  toggleDetails(pakket: any) {
    pakket.showDetails = !pakket.showDetails;
  }

  getEyeIcon(pakket: any): string {
    return pakket.showDetails ? "eye-off" : "eye";
  }

  reloadPackages() {
    this.loadData(); // Re-fetch the packages data
  }
}
