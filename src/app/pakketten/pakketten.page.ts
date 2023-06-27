import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingController, AlertController, PopoverController } from '@ionic/angular';
import { Storage } from '@ionic/storage';




@Component({
  selector: 'app-pakketten',
  templateUrl: './pakketten.page.html',
  styleUrls: ['./pakketten.page.scss'],
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
    this.loader();
    this.status = await this.storage.get('currentStatus');
  
    try {
      const location = await this.getLocation();
      const params = {
        search: 'all',
        location: location,
      };
      const response = await this.http.get<any[]>('https://ssl.app.sr/api/packages', { params }).toPromise();
      this.pakketten = response;
      this.filteredPakketten = response;
      this.loadingController.dismiss();
    } catch (error) {
      console.log('Error retrieving packages:', error);
    }
  }

  async showConfirmationDialog(paketId: string, currentStatus: number) {
    const alert = await this.alertController.create({
      header: 'Wilt u de status wijzigen van pakket ' + paketId + '?',
      buttons: [
        {
          text: 'Ja',
          handler: () => {
            this.doChangeStatus(paketId, currentStatus);
          }
        },
        {
          text: 'Nee',
          handler: () => {
            // Handle "Nee" button action
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  
  onChangeSearch() {
    if (this.input && this.input.trim() !== '') {
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
      const response = await this.http.get<any[]>(`https://ssl.app.sr/api/packages?search=all&location=${location}`).toPromise();
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
       console.log("geen pakketten beschikbaar")
      } else if (locatie.toLowerCase() === "surinamehoofd") {
        return "suriname";
      } else {
        return "nederland";
      }
    });
  }


  async changeStatus(paket) {
    const statusto = parseInt(paket.status) + 1;
  
    const val = await this.storage.get("status");
    const matchingStatus = val.find(data => parseInt(data.id) === statusto);
  
    if (matchingStatus) {
      const statusName = matchingStatus.name;
      const alert = await this.alertController.create({
        header: 'Wilt u zeker de status wijzigen?',
        buttons: [
          {
            text: 'Ja',
            handler: async () => {
              await this.doChangeStatus(paket.id, statusto);
              const successAlert = await this.alertController.create({
                message: `Pakket ${paket.id} gewijzigd naar ${statusName}`,
                buttons: ['OK']
              });
              await successAlert.present();
            }
          },
          {
            text: 'Nee',
            handler: () => {
              // Handle "Nee" button action
            }
          }
        ]
      });
  
      await alert.present();
    }
  }
  async doChangeStatus(paketId: string, currentStatus: number) {
    let data = {
      "id": paketId,
      "status": currentStatus + 1
    };
  
    this.loader();
  
    return this.http.post('https://ssl.app.sr/api/update-status', data).toPromise();
  }
  
  async loader() {
    const loading = await this.loadingController.create({
      spinner: "bubbles",
      cssClass: 'alertCss',
      message: 'Even geduld aub...',
    });
  
    await loading.present();
  }
  
  





async presentAlert(message: string): Promise<void> {
  const alert = await this.alertController.create({
    message: message,
    buttons: ['OK']
  });

  await alert.present();
}

 

  toggleDetails(pakket: any) {
    pakket.showDetails = !pakket.showDetails;
  }

  getEyeIcon(pakket: any): string {
    return pakket.showDetails ? 'eye-off' : 'eye';
  }
}


