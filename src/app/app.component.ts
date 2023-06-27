import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';

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
  mode: boolean; // Add the mode property with a boolean type

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
    private router: Router,
  ) {
    this.store = storage;
    this.mode = true; // Set the initial mode to false (light mode)
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
      if (val != null) {
        this.router.navigate(['/scanner'])
      }
    });
  }

  clearLocalStorage() {
    console.log("login data saved, but the rest went bye bye");
    this.storage.get('login').then((loginData) => {
      const itemsToRemove = [
        "status",
        "selectedStatus",
        "currentStatus",
        "palletNumber",
        "loodLocatieNumber"
      ];
  
      itemsToRemove.forEach((item) => {
        localStorage.removeItem(item);
        this.storage.remove(item);
        console.log(item);
      });
  
      // Remove palletNumber from localStorage as well as loodlocatienummer
      localStorage.removeItem("palletNumber");
      localStorage.removeItem("loodLocatieNumber");
  
      // Restore the login data after clearing local storage
      if (loginData) {
        this.storage.set('login', loginData);
      }
    });
  }
  
  setMode() {
    this.storage.get('mode').then((val) => {
      if (val === true) {
        document.body.setAttribute('color-theme', 'dark');
        this.mode = true;
      } else {
        document.body.removeAttribute('color-theme'); // Remove the attribute to use the default theme
        this.mode = false;
      }
    }).catch(() => {
      document.body.removeAttribute('color-theme'); // Remove the attribute to use the default theme
      this.mode = false;
    });
  }
  
  toggleDarkMode(event) {
    this.storage.set('mode', event.detail.checked).then(() => {
      this.mode = event.detail.checked;
  
      if (event.detail.checked) {
        document.body.setAttribute('color-theme', 'dark');
      } else {
        document.body.removeAttribute('color-theme'); // Remove the attribute to use the default theme
      }
    }).catch((error) => {
      console.error('Error saving mode to storage:', error);
    });
  }
  
  
  logout() {
    this.clearLocalStorage(); // Call the clearLocalStorage() method to remove the necessary data
    console.log("Local storage cleared.");
    this.router.navigateByUrl("/login");
  }
}
