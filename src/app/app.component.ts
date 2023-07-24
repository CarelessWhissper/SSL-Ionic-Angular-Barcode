import { Component, OnInit } from "@angular/core";
import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";

import { StatusBar } from "@ionic-native/status-bar/ngx";

import { Storage } from "@ionic/storage";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit {
  mode: boolean = true;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private storage: Storage,
    private router: Router,
    private statusBar: StatusBar
  ) {}

  ngOnInit() {
    this.initializeApp();
    this.checkLogin();
    this.splashScreen.hide();

    this.statusBar.styleDefault();
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
        document.body.setAttribute("color-theme", this.mode ? "dark" : "light");
      })
      .catch(() => {
        document.body.setAttribute("color-theme", "light");
        this.mode = false;
      });
  }

  toggleDarkMode(event: any) {
    this.storage
      .set("mode", event.detail.checked)
      .then(() => {
        this.mode = event.detail.checked;
        document.body.setAttribute("color-theme", this.mode ? "dark" : "light");
      })
      .catch((error) => {
        console.error("Error saving mode to storage:", error);
      });
  }
  logout() {
    this.clearLocalStorage();
    console.log("Local storage cleared.");
    this.router.navigateByUrl("/login");
  }

}
