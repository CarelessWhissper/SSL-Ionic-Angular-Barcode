import { Component, OnInit } from '@angular/core';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Location } from "@angular/common";
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
})
export class ScannerPage implements OnInit {
  scanData: any;
  status: any;
  constructor(
    private barcodeScanner: BarcodeScanner,
    private AlertController: AlertController,
    private router: Router,
    private platform: Platform,
    private location: Location,
    public http: HttpClient,
    private storage: Storage

  ) {
    this.platform.backButton.subscribeWithPriority(666666, () => {
      if (this.router.url == "/scanner") {
        this.exitalert()
      } else {
        this.location.back();
      }
    })
  }

  ngOnInit() {
    // this.http.get('http://192.168.0.159:8080/api/get-status')
    // this.http.get('http://mia.bitdynamics.sr/sslapp/api/get-status')
    this.http.get('https://ssl.app.sr/api/get-status')
      .subscribe(async Response => {
        console.log(Response);
        this.storage.set("status", Response);
      }, async error => {

      });
    this.storage.get("currentStatus").then((val) => {
      this.status = val;
      console.log(val)
    })
  }
  ionViewDidEnter() {
    this.storage.get("currentStatus").then((val) => {
      this.status = val;
      console.log(val)
    })
  }
  scan() {
    this.storage.get("currentStatus").then((val) => {
      if (val == null) {
        this.setStatus();
      }
      if (val != null) {
        const options: BarcodeScannerOptions = {
          preferFrontCamera: false,
          showFlipCameraButton: false,
          prompt: 'Place a barcode inside the scan area',
          formats: 'CODE_93',
          orientation: 'portrait',
        };

        this.barcodeScanner.scan(options).then((barcodeData) => {
          console.log(barcodeData);
          console.log(barcodeData.text);
          if (!barcodeData.text) {
            console.log("barcodeData.text is undefined");
            return;
          }
          if(barcodeData.text != ""){
            this.postBarcodeData(barcodeData.text)
          }
         
          this.scanData = barcodeData;
        }, (err) => {
          console.log("Error occured : " + err);
        });
      }
    })

  }
  async alert(Response) {
    const alert = await this.AlertController.create({
      header: 'Scan succesvol',
      cssClass: 'alertCss',
      message: Response.pakket_id + ' status is gewijzigd ' + Response.name,
      buttons: [{
        text: 'Scan volgende',
        handler: () => {
          this.scan()
        }
      },
      {
        text: 'ok',
        handler: () => {
          console.log('Yes clicked');

        }
      }]
    });
    await alert.present();
  }

  postBarcodeData(data) {
    let barcode = {
      "barcode": data,
      "status": this.status.id
    }
    console.log(barcode)
    //  this.http.post('http://192.168.0.159:8080/api/barcode-update-status', barcode)
    // this.http.post('http://mia.bitdynamics.sr/sslapp/api/barcode-update-status', barcode)
    this.http.post('https://ssl.app.sr/api/barcode-update-status', barcode)
    
      .subscribe(async Response => {
        console.log(Response);
        // this.loadingController.dismiss();
        console.log("weee")
        this.alert(Response[0]);
      }, async error => {
        this.sameStatusAlert(error)
        console.log(error)
      });

  }

  pakketten() {
    this.router.navigateByUrl('/pakketten');
  }
  settings() {
    this.router.navigateByUrl('/settings');
  }
  async exitalert() {
    const alert = await this.AlertController.create({
      // header: 'Registratie Successvol',
      header: 'Wilt u de applicatie verlaten?',
      cssClass: 'alertCss',
      // message: 'U zal een verificatie ontvangen in uw mail',
      buttons: [{
        text: 'Ja',
        handler: () => {
          navigator["app"].exitApp();
        }
      },
      {
        text: 'Nee',
        handler: () => {
          console.log('Yes clicked');

        }
      }]
    });
    await alert.present();
  }

  async setStatus() {
    const alert = await this.AlertController.create({
      header: 'Er is geen status geselecteerd',
      // header: 'Selecteer eerst een status',
      // message: 'Er is geen status geselecteerd',
      cssClass: 'alertCss',
      buttons: [{
        text: 'Selecteer status',
        handler: () => {
          this.router.navigateByUrl('/settings');
        }
      },
      {
        text: 'annuleer',
        handler: () => {
          console.log('Yes clicked');

        }
      }]
    });
    await alert.present();
  }
  async sameStatusAlert(Response) {
    const alert = await this.AlertController.create({
      header: 'Scan niet succesvol',
      message: Response.error.message,
      cssClass: 'alertCss',
      buttons: [{
        text: 'Scan volgende',
        handler: () => {
          this.scan()
        }
      },
      {
        text: 'ok',
        handler: () => {
          console.log('Yes clicked');

        }
      }]
    });
    await alert.present();
  }
}
