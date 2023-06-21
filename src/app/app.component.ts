import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Storage } from '@ionic/storage';
import { Router, } from '@angular/router';

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


  ) {
    this.store = storage;
    this.mode();
    this.initializeApp();
    this.checkLogin();

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.show();
      this.checkLogin();
    });
  }

  checkLogin() {
    this.storage.get('login').then((val) => {
     if (val != null){
      this.router.navigate(['/scanner'])
     }
    })
  }
  clearLocalStorage() {
    console.log("login data saved, but the rest went bye bye")
    this.storage.get('login').then((loginData) => {
      this.storage.clear().then(() => {
        // Restore the login data after clearing local storage
        if (loginData) {
          this.storage.set('login', loginData);
          
        }
      });
    });
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