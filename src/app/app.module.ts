import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { FormsModule } from '@angular/forms'; 
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";

import { Camera } from "@ionic-native/camera/ngx";
import { HttpClientModule } from "@angular/common/http";
import { IonicStorageModule } from "@ionic/storage";
import { BarcodeScanner } from "@ionic-native/barcode-scanner/ngx";

import { NewPackageModalModule } from "./pakketten/new-package-modal/new-package-modal.module";

@NgModule({
  declarations: [AppComponent],

  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    FormsModule,
    NewPackageModalModule,
  ],
  providers: [
    Camera,
    StatusBar,
    SplashScreen,
    BarcodeScanner,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
