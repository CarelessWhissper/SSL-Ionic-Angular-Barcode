import { Component, OnInit, Input, AfterViewInit, Renderer2, ElementRef,  } from "@angular/core";
import { ModalController, ToastController } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { NavController } from '@ionic/angular';
import { DataReloadService } from "../data-reload.service";
@Component({
  selector: 'app-editnumber',
  templateUrl: './editnumber.component.html',
  styleUrls: ['./editnumber.component.scss'],
})
export class EditnumberComponent implements OnInit, AfterViewInit{
  

  
  

  @Input() number: string;  
  @Input() pakket_id:string



  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private toastController: ToastController,
    private navController: NavController,
    private dataReloadService: DataReloadService,
    private renderer: Renderer2, private elementRef: ElementRef
  ) { }

  ngOnInit() {}

  dismiss() {
    this.modalController.dismiss(); // Dismiss the modal without any changes
  }

  ngAfterViewInit() {
    // Ensure the DOM is fully loaded before adding event listener
    this.disableTouchOnInput();
  }

  disableTouchOnInput() {
    const inputElement = this.elementRef.nativeElement.querySelector('#pakketIdInput');
    if (inputElement) {
      this.renderer.listen(inputElement, 'touchstart', (event) => {
        event.stopPropagation();
      });
    }
  }
  async saveData() {
    try {
      const formData = {
        number: this.number,
        pakket_id: this.pakket_id
      };

      // Send HTTP POST request to update the load information
      const response = await this.http.post<any>("https://ssl.app.sr/api/updateLoad", formData).toPromise();

      if (response.success) {
        this.presentToast('Data saved successfully', 'success');

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
    this.dataReloadService.triggerReload();
  }

  confirm() {
    this.modalController.dismiss(this.number, 'confirm');
  }
  
  reloadPackages() {
    // Navigate back to the previous page
    this.navController.back();
  }

}
