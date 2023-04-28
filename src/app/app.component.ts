import { Component } from '@angular/core';

import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Storage } from '@ionic/storage';
import { Router, } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  store: Storage;
  key: any;
  today: any;
  expireDay: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
    private router: Router,
    private AlertController: AlertController,


  ) {
    this.store = storage;
    this.mode();
    this.initializeApp();
    this.checkLogin();

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      setTimeout(() => {
        this.splashScreen.hide();
      }, 300);
      // this.splashScreen.hide();
    });
  }

  checkLogin() {
    this.storage.get('login').then((val) => {
     if (val != null){
      this.router.navigate(['/scanner'])
     }
    })
  }

  mode(){
    this.storage.get("mode").then((val)=>{
      // this.currentStatus = val.name;
      if (val == true){
        document.body.setAttribute('color-theme','dark');
      }else{
           document.body.setAttribute('color-theme','light2');
      }

    })
  }

}
