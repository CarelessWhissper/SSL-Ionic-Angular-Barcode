import { Component, OnInit } from "@angular/core";
import { Storage } from "@ionic/storage";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

@Component({
  selector: "app-settingsusa",
  templateUrl: "./settingsusa.page.html",
  styleUrls: ["./settingsusa.page.scss"],
})
export class SettingsusaPage implements OnInit {
  mode: any;
  name: string;
  email: string;
  role: string;
  locatie: string;
  numberOfObjects: number = 0;
  latestCreatedPakketId: string;
  latestUpdatedPakketId: string;
 

  constructor(private storage: Storage, private http: HttpClient, private router: Router) {
    this.storage
      .get("mode")
      .then((mode) => {
        if (mode) {
          document.body.setAttribute("color-theme", "dark");
        } else {
          document.body.setAttribute("color-theme", "light");
        }
        this.mode = mode;
      })
      .catch((error) => {
        console.error("Error retrieving mode from storage:", error);
      });
  }

  ngOnInit(){
    this.loadLoginDataFromStorage();
    this.loadDataFromApi();
    this.loadData();
  }

  loadLoginDataFromStorage(): void {
    this.storage.get("login").then(
      (data) => {
        if (data) {
          this.name = data.name;
          this.email = data.email;
          this.role = data.role;
          this.locatie = data.locatie;
          console.log("Location obtained:", this.locatie);
        } else {
          console.log("no data found");
        }
      },
      (error) => {
        console.error("Error fetching data from storage:", error);
       
      }
    );
  }

  loadDataFromApi(): void {
    this.http.get<any>('https://ssl.app.sr/api/usa').subscribe(
      (data) => {
        // Assuming the response is an array and you want to get the length
        this.numberOfObjects = data.length;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  loadData() {
    this.http.get<any>('https://ssl.app.sr/tester_app/api/recent').subscribe(
      (data: any) => {
        this.latestCreatedPakketId = data.latest_created_pakket_id;
        this.latestUpdatedPakketId = data.latest_updated_pakket_id;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );

    
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

  async logout() {
    try {
      // Clear all stored data from Ionic Storage
      await this.storage.clear();
      console.log("All data removed from Ionic Storage.");
  
      // Navigate to the login page after clearing the data
      this.router.navigateByUrl("/login");
    } catch (error) {
      console.error("Error clearing Ionic Storage:", error);
    }
  }
}
