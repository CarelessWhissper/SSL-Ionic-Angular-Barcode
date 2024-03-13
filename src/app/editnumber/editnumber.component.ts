import { Component, OnInit, Input } from "@angular/core";
import { ModalController, ToastController,AlertController  } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-editnumber',
  templateUrl: './editnumber.component.html',
  styleUrls: ['./editnumber.component.scss'],
})
export class EditnumberComponent implements OnInit {
  

  
  

  @Input() number: string;  
  @Input() pakket_id:string



  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private toastController: ToastController,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {}

  dismiss() {
    this.modalController.dismiss(); // Dismiss the modal without any changes
  }

  async saveData() {
    try {
      const formData = {
        number: this.number,
        pakket_id: this.pakket_id
      };

      // Send HTTP POST request to update the load information
      const response = await this.http.post<any>("https://ssl.app.sr/tester_app/api/updateLoad", formData).toPromise();

      if (response.success) {
        this.presentToast('Data saved successfully', 'success');
        this.dismiss(); // Dismiss the modal after successful save
        this.reloadPackages();
      } else {
        this.presentToast('Failed to save data', 'danger');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      this.presentToast('Failed to save data', 'danger');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: "bottom",
    });
    toast.present();
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalController.dismiss(this.number, 'confirm');
  }
  
  reloadPackages() {
    // Navigate back to the previous page
    this.navController.back();
  }

}
