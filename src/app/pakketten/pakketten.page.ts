import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController, AlertController, PopoverController } from '@ionic/angular';
import { PopoverListComponent } from '../popover-list/popover-list.component';
import { Storage } from '@ionic/storage';
@Component({
  selector: 'app-pakketten',
  templateUrl: './pakketten.page.html',
  styleUrls: ['./pakketten.page.scss'],
})
export class PakkettenPage implements OnInit {
  pakketten: Object;
  input: any;
  status: any;
  statusName: any;
  pakId: any;
  switch: number = 0;
  clickCounter: number = 0;
  constructor(
    public http: HttpClient,
    public loadingController: LoadingController,
    private AlertController: AlertController,
    private popoverController: PopoverController,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.loader()
    this.storage.get("currentStatus").then((val) => {
      this.status = val;
    })
    // this.http.post('http://mia.bitdynamics.sr/sslapp/api/get-pakketten', { "search": "all" })
    this.http.post('https://ssl.app.sr/api/get-pakketten', { "search": "all" })


      .subscribe(async Response => {
        this.pakketten = Response;
        this.loadingController.dismiss();
      }, async error => {


      });

  }
  onChangeFase() {
    let data = {
      "search": this.input
    }

    // this.http.post('http://mia.bitdynamics.sr/sslapp/api/get-pakketten', data)
    this.http.post('https://ssl.app.sr/api/get-pakketten', data)

      .subscribe(async Response => {
        this.pakketten = Response;
      }, async error => {

      });
  }
  doChangeStatus(paket) {
    let data = {
      "id": paket.id,
      "status": parseInt(paket.status) + 1
    }
    this.loader()
    // this.http.post('http://mia.bitdynamics.sr/sslapp/api/update-status', data)
    this.http.post('https://ssl.app.sr/api/update-status', data)

      .subscribe(async Response => {
        console.log(Response);
        this.pakketten = Response;
        this.loadingController.dismiss();
      }, async error => {

      });

  }
  async changeStatus(paket) {
    var statusto = parseInt(paket.status) + 1
    this.storage.get("status").then((val) => {
      for (var data of val) {
        if (statusto == parseInt(data.id)) {
          this.statusName = data.name;
        }
      }

    })
    const alert = await this.AlertController.create({
      header: 'Weet u zeker dat u de status wilt wijzigen?',
      cssClass: 'alertCss',
      buttons: [{
        text: 'Ja',
        handler: () => {
          this.doChangeStatus(paket)
        }
      },
      {
        text: 'Nee',
        handler: () => {
        }
      }]
    });
    await alert.present();
  }
  async loader() {
    const loading = await this.loadingController.create({
      spinner: "bubbles",
      cssClass: 'alertCss',
      message: 'Even geduld aub...',
    })
    await loading.present();
  }
  presentListPopover() {
    this.popoverController.create({
      component: PopoverListComponent,
      showBackdrop: false,
      // event: ev,
      translucent: true,
      cssClass:"popoverCss",
    }).then((popoverElement) => {
      popoverElement.onWillDismiss().then((sortby) => {
        let data = {
          "status": sortby.data
        }
        // this.http.post('http://mia.bitdynamics.sr/sslapp/api/get-pakketten', data)
        this.http.post('https://ssl.app.sr/api/get-pakketten', data)

          .subscribe(async Response => {
            this.pakketten = Response;
            this.loadingController.dismiss();
          }, async error => {

          });
      });
      popoverElement.present();
    });
  }

  open(data) {
    this.switch = 1;
    if (this.pakId != data.id) {
      this.clickCounter = 0;
    }
    this.pakId = data.id;
    this.clickCounter = this.clickCounter + 1
    if (this.switch == 1 && this.clickCounter > 1 && this.pakId == data.id) {
      this.changeStatus(data);
    }
  }
}
