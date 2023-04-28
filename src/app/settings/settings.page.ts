import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  name: any;
  email: any;
  role: any;
  status: any;
  mode: any;
  currentStatus: any;

  constructor(private Storage: Storage,
    private Router: Router) { }

  ngOnInit() {
    this.Storage.get('login').then((data) => {
      this.name = data.name;
      this.email = data.email;
      this.role = data.role;
    })
    this.Storage.get("status").then((val) => {
      this.status = val;
    })
    this.Storage.get("currentStatus").then((val) => {
      if (val != null) {
        this.currentStatus = val.name;

      }
    })
    this.Storage.get("mode").then((val) => {
      // this.currentStatus = val.name;
      this.mode = val;
    })

    if (this.currentStatus == null) {
      this.currentStatus = "Selecteer status"
    }
  }
  onChangeStatus($event) {

    this.status.forEach((value) => {
      if (value.id == $event.detail.value) {
        this.Storage.set("currentStatus", value)
      }
    });
  }
  toggleDarkMode(event) {
    this.Storage.set("mode", event.detail.checked)
    if (event.detail.checked == true) {
      document.body.setAttribute('color-theme', 'dark');
    } else {
      // document.body.setAttribute('color-theme', 'light');
      document.body.setAttribute('color-theme', 'light2');
    }
  }
  logout() {
    this.Storage.clear()
    this.Router.navigateByUrl('/login')
  }

  // toggle(ev){
  //   if (ev.detail.checked == true) {
  //     document.body.setAttribute('color-theme', 'tolight');
  //   }
  // }

}
