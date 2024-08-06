import { LocationService } from './../location-service.service';

import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LoadingController } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { Router } from "@angular/router";
import { Platform } from "@ionic/angular";
import { AlertController } from "@ionic/angular";


@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit {
  showPassword = false;
  type = "password";
  validation = null;
  email: any;
  password: any;
  buttonDisabled: any;
  store: Storage;
  userId:number;

  constructor(
    public http: HttpClient,
    public loadingController: LoadingController,
    private storage: Storage,
    private router: Router,
    private platform: Platform,
    private AlertController: AlertController,
    private locationService: LocationService
  ) {
    this.platform.backButton.subscribeWithPriority(666666, () => {
      if (this.router.url == "/login") {
        this.exitalert();
      }
    });
  }

  ngOnInit() {
    const userLocation = 'usa'; 
    this.locationService.setUserLocation(userLocation);
  }

  toggleShow() {
    switch (this.showPassword) {
      case false: {
        this.showPassword = true;
        this.type = "text";
        break;
      }
      case true: {
        this.showPassword = false;
        this.type = "password";
        break;
      }
    }
  }

  CheckInput() {
    if (
      this.email == null ||
      this.password == null ||
      this.email == "" ||
      this.password == ""
    ) {
      this.buttonDisabled = true;
    } else if (this.email != null && this.password != null) {
      this.buttonDisabled = false;
    }
  }



  async DoLogin() {
    this.loader();
    this.validation = null;
    console.log("Login Clicked");
    var headers = new HttpHeaders();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    const requestOptions = { headers: headers };
  
    var data = {
      email: this.email,
      password: this.password,
      
    };
    
  
    this.http
      .post("https://ssl.app.sr/tester_app/api/login", data, requestOptions)
      .subscribe(
        async (Response:any) => {
          // After successfully logging in and getting the user data
          const userData = {
            name: Response.name,
            email: Response.email,
            role: Response.role,
            locatie: Response.locatie,
            userId: Response.id 
          };

          
  
          // Show loading animation
          const loading = await this.loadingController.create({
            spinner: "bubbles",
            cssClass: "alertCss",
            message: "Even geduld aub...",
            duration: 2000, // Set a duration to simulate the loading animation
          });
          await loading.present();
  
          // Reload the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 2000); // Adjust the delay as needed
  
          console.log(Response);
          this.storage.set('login', userData).then(() => {
            console.log('User data saved to local storage.',userData);
          });
          this.loadingController.dismiss();
        },
        async (error) => {
          if (error.status == 200) {
            this.loadingController.dismiss();
          } else {
            this.validation = 1;
            this.loadingController.dismiss();
          }
        }
      );
  }
  

  async loader() {
    const loading = await this.loadingController.create({
      spinner: "bubbles",
      cssClass: "alertCss",
      message: "Even geduld aub...",
    });
    await loading.present();
  }
  async exitalert() {
    const alert = await this.AlertController.create({
      // header: 'Registratie Successvol',
      header: "Wilt u de applicatie verlaten?",
      // message: 'U zal een verificatie ontvangen in uw mail',
      cssClass: "alertCss",
      buttons: [
        {
          text: "Ja",
          handler: () => {
            navigator["app"].exitApp();
          },
        },
        {
          text: "Nee",
          handler: () => {
            console.log("Yes clicked");
          },
        },
      ],
    });
    await alert.present();
  }
}
