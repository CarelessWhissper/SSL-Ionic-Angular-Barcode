
import { Component, OnInit } from "@angular/core";
import { Platform } from "@ionic/angular";

import { Storage } from "@ionic/storage";
import { Router } from "@angular/router";

declare const SplashScreen: any;
declare const StatusBar: any;

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit {
  mode: boolean = true;

  constructor(
    private platform: Platform,

    private storage: Storage,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeApp();
    this.checkLogin();
    SplashScreen.show({
      showDuration: 5000,
      autoHide: true,
    });
    StatusBar.show();
    this.setMode();
  }

  initializeApp() {
    this.platform.ready().then(() => {});
  }

  checkLogin() {
    this.storage.get("login").then((val) => {
      if (val != null) {
        this.router.navigate(["/scanner"]);
      }
    });
  }

  clearLocalStorage() {
    console.log("login data saved, but the rest went bye bye");
    const itemsToRemove = [
      "status",
      "selectedStatus",
      "currentStatus",
      "palletNumber",
      "loodLocatieNumber",
    ];

    itemsToRemove.forEach((item) => {
      localStorage.removeItem(item);
      this.storage.remove(item);
      console.log(item);
    });

    localStorage.removeItem("palletNumber");
    localStorage.removeItem("loodLocatieNumber");

    this.storage.get("login").then((loginData) => {
      if (loginData) {
        this.storage.set("login", loginData);
      }
    });
  }

  setMode() {
    this.storage
      .get("mode")
      .then((val) => {
        this.mode = val === true;
        if (this.mode) {
          document.body.setAttribute("color-theme", "dark");
        } else {
          document.body.removeAttribute("color-theme");
        }
      })
      .catch(() => {
        document.body.setAttribute("color-theme", "light");
        this.mode = false;
      });
  }
  
  
  toggleDarkMode(event: { detail: { checked: boolean } }) {
    localStorage.setItem('mode', String(event.detail.checked));
    this.mode = event.detail.checked;
    document.body.setAttribute('color-theme', this.mode ? 'dark' : 'light');
  }

  logout() {
    this.clearLocalStorage();
    console.log("Local storage cleared.");
    this.router.navigateByUrl("/login");
  }
}
