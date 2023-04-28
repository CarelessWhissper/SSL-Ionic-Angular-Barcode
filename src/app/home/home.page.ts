import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { DomSanitizer } from '@angular/platform-browser';
// import EscPosEncoder from 'esc-pos-encoder';
import { Platform, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  expireDay: any;
  today: any;
  store: Storage;
  clickedImage: string;
  options: CameraOptions = {
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }

  text: string;
  data: any;



  constructor(
    private camera: Camera,
    private sanitizer: DomSanitizer,
    public platform: Platform,
    private Router: Router,
    private AlertController: AlertController,
    private storage: Storage,


  ) {
    // this.checkKey();
    this.platform.backButton.subscribeWithPriority(666666, () => {
      if (this.Router.url == "/home") {
        this.exitalert()
      }
    })
    this.text = 'HalloooooO!';
  }

  ngOnInit() {
    console.log('init');
    this.text = 'HalloooooO!';
    // setInterval(() => this.checkKey(), 3600000);
  }

  checkKey() {
    this.storage.get('key').then((key) => {
      const datePipe = new DatePipe('en-US');
      this.expireDay = datePipe.transform(Date.parse(key.key_expired_at), 'ddMMyyyy')
      this.today = datePipe.transform(Date.now(), 'ddMMyyyy')
      // console.log(key.key_expired_at)

      if (this.expireDay >= this.today) {
        // this.Router.navigate(['/home'])
      } else {
        this.Router.navigate(['/home'])
        this.expireAlert()
      }

    })
  }
  info() {
    console.log("info")
    this.storage.get('key').then((key) => {
      this.showInfo(key);
    })
  }

  captureImage() {
    this.camera.getPicture(this.options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.clickedImage = base64Image;

      // this is the complete list of currently supported params you can pass to the plugin (all optional)
      var options = {
        message: null, // not supported on some apps (Facebook, Instagram)
        subject: null, // fi. for email
        files: [this.clickedImage], // an array of filenames either locally or remotely
        url: null,
        chooserTitle: 'Pick an app', // Android only, you can override the default share sheet title
        appPackageName: 'ru.a402d.rawbtprinter', // Android only, you can provide id of the App you want to share with
      };

      var onSuccess = function (result) {

        console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
        console.log("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
      };

      var onError = function (msg) {
        console.log("Sharing failed with message: " + msg);
      };

      (<any>window).plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
      this.clickedImage = null;
      // (<any>window).plugins.socialsharing.share(null, 'Image', this.clickedImage, null);
    }, (err) => {
      console.log(err);
      // Handle error
    });
  }

  openWindow() {
    if (!this.clickedImage) {
      alert('No image');
    } else {
      if (this.platform.is("cordova")) {
        console.log('print');
        (<any>window).plugins.socialsharing.share(null, 'Image', this.clickedImage, null);
        // window.plugins.socialsharing.share('Message only')
      }
    }
  }
  async exitalert() {
    const alert = await this.AlertController.create({
      header: 'Exit?',
      message: 'Are you sure you want to exit?',
      buttons: [{
        text: 'Yes',
        handler: () => {
          navigator["app"].exitApp();
        }
      },
      {
        text: 'No',
        handler: () => {
          console.log('Yes clicked');

        }
      }]
    });
    await alert.present();
  }
  async expireAlert() {
    const alert = await this.AlertController.create({
      header: 'Licence expired',
      // message: 'Are you sure you want to exit?',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.Router.navigate(['/key-activation']);
        }
      }]
    });
    await alert.present();
  }
  async showInfo(key) {
    console.log(key)
    const datePipe = new DatePipe('en-US');
    var key_st = datePipe.transform(key.key_created_at, 'dd-MM-yyyy')
    var key_ex = datePipe.transform(key.key_expired_at, 'dd-MM-yyyy')
    console.log(key_st +' '+key_ex )
    const alert = await this.AlertController.create({
      cssClass: 'my-custom-class',
      header: 'Licence information',
      // mode:'ios',
      message: key.bedrijf + '<br><ion-row><ion-col class="ion-no-padding">Status:</ion-col><ion-col class="ion-no-padding">' + key.status + '</ion-col></ion-row><ion-row><ion-col class="ion-no-padding">Licence:</ion-col><ion-col class="ion-no-padding">' + key.key + '</ion-col></ion-row><ion-row><ion-col class="ion-no-padding">Valid from:</ion-col><ion-col class="ion-no-padding">' + key_st + '</ion-col></ion-row><ion-row><ion-col class="ion-no-padding">Valid to:</ion-col><ion-col class="ion-no-padding">' + key_ex + '</ion-col></ion-row>',
      // message:'<ion-row><ion-col>'+key.bedrijf+'</ion-row><ion-row><ion-col>'+key.naam+" "+key.voornaam+'</ion-row><ion-row><ion-col>12</ion-col><ion-col>12</ion-col></ion-row><ion-row><ion-col>12</ion-col><ion-col>12</ion-col></ion-row>',
      buttons: [{
        text: 'Close',
        // handler: () => {
        //   this.Router.navigate(['/key-activation']);
        // }
      }]
    });
    await alert.present();
  }
}