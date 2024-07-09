import { Component, OnInit, Input } from "@angular/core";
import { ModalController, ToastController,AlertController  } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { debounceTime } from 'rxjs/operators';
import { Subject } from "rxjs";
import { DataReloadService } from "../data-reload.service";






@Component({
  selector: "app-example-modal-component",
  templateUrl: "./example-modal-component.component.html",
  styleUrls: ["./example-modal-component.component.scss"],
})
export class ExampleModalComponentComponent implements OnInit {
  @Input() pakket_id: string;
  message = "This is a modal example";
  name: string;
  idnumber: string;
  address: string;
  telefoon: string;
  volume: string;
  plaats: string;
  pakket_omschrijving: string;
  gewicht: string;
  searchOptions: any[] = [];
  filteredOptions: any[] = [];
  land: string = "Suriname";
  id: string;
  tracking: string;

  packageurl = "https://ssl.app.sr/api/usa";

  isValidName: boolean = true;
  isValidTelefoon: boolean = true;

  // Declare a subject for handling search term changes
private searchTermChanged = new Subject<string>();

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private toastController: ToastController,
    private alertController: AlertController,
    private dataReloadService: DataReloadService
   
   
  ) {}

  moreInfo() {
    this.http
      .get<any[]>(this.packageurl, {
        params: { search_term: this.pakket_id },
      })
      .subscribe(
        (response) => {
          if (response.length > 0) {
            const data = response[0]; // Get the first object from the array
            this.pakket_omschrijving = data.pakket_omschrijving;
            this.volume = data.volume;
            this.tracking = data.tracking;
          } else {
            console.error("No data found for the given pakket_id.");
          }
        },
        (error) => {
          console.error("Error fetching package information:", error);
        }
      );
  }

  ngOnInit() {
    console.log("Received pakket_id:", this.pakket_id);
    // Call moreInfo() within the ngOnInit lifecycle hook
    this.moreInfo();

    this.searchTermChanged.pipe(
      debounceTime(300) // Adjust the debounce time as needed (300 milliseconds in this example)
    ).subscribe(searchTerm => {
      if (searchTerm.length >= 4) {
        this.http
          .get<any>("https://ssl.app.sr/api/getOntvangers", {
            params: { search_term: searchTerm },
          })
          .subscribe(
            (response) => {
              console.log("Filtered options:", response);
              // Assign the 'data' array from the response to 'filteredOptions'
              this.filteredOptions = response.data;
            },
            (error) => {
              console.error("Error fetching search options:", error);
            }
          );
      } else {
        this.filteredOptions = [];
      }
    });
  }

  onSearchChange(event: any) {
    const searchTerm = event.target.value;
    console.log("Search term:", searchTerm);
    this.filterNames(searchTerm);
    this.isValidName = /^[A-Z]/.test(this.name);
    // Check if telefoon contains more than 7 characters
    this.isValidTelefoon = searchTerm.length <= 7;

    if (!this.isValidName) {
      this.name = "";
    }

    if (!this.isValidTelefoon) {
      this.telefoon = "";
    }
  }

  // filterNames(searchTerm: string) {
  //   if (searchTerm.length >= 4) {
  //     this.http
  //       .get<any>("https://ssl.app.sr/tester_app/api/getOntvangers", {
  //         params: { search_term: searchTerm },
  //       })
  //       .subscribe(
  //         (response) => {
  //           console.log("Filtered options:", response);
  //           // Assign the 'data' array from the response to 'filteredOptions'
  //           this.filteredOptions = response.data;
  //         },
  //         (error) => {
  //           console.error("Error fetching search options:", error);
  //         }
  //       );
  //   } else {
  //     this.filteredOptions = [];
  //   }
  // }

  filterNames(searchTerm: string) {
    // Push the new search term to the subject
    this.searchTermChanged.next(searchTerm);
  }

  selectOption(option: any) {
    // Assign the selected option to the name field
    this.name = option.name;

    // Populate modal fields with the data from the selected option

    this.address = option.address;
    this.plaats = option.plaats;
    this.telefoon = option.telefoon;
    this.idnumber = option.idnumber;
    this.land = option.land;
    option.land == "Suriname";
    this.id = option.id;

    // Clear filtered options
    this.filteredOptions = [];
  }

  cancel() {
    this.modalCtrl.dismiss(null, "Cancel");
    this.dataReloadService.triggerReload();
  }

  confirm() {
    this.modalCtrl.dismiss(this.name, "Confirm");
  }

  saveData() {
    if (this.isInputEmpty()) {
      this.presentEmptyFieldsToast();
    } else {
       // Prepare the data to be sent to the backend
      const formData = {
        name: this.name,
        land: this.land,
        address: this.address,
        plaats: this.plaats,
        idnumber: this.idnumber,
        telefoon: this.telefoon,
        pakket_id: this.pakket_id,
        pakket_omschrijving: this.pakket_omschrijving,
        volume: this.volume,
        id: this.id,
        tracking: this.tracking,
      };
  
      // Send a POST request to your backend API to save the data
      this.http
        .post<any>(
          "https://ssl.app.sr/api/updateOntvangerPakket",
          formData
        )
        .subscribe(
          (response) => {
            console.log("Data saved successfully:", response);
            this.presentToast("Data saved successfully", "success");
           
          },
          (error) => {
            console.error("Error saving data:", error);
            if (error.status === 402) {
                // Display the error message to the user
                this.presentToast(error.error.message, "danger");
            } else {
                // Handle other types of errors
                this.presentToast("Failed to save data", "danger");
            }
        }
        );
    }
  }
  
   

  async presentEmptyFieldsToast(){
    const toast = await this.toastController.create({
      message: "Input veld is leeg",
      duration: 2000, // Duration in milliseconds
      position: "bottom", // Position of the toast message
    });
    await toast.present();
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

  async presentNameValidationToast() {
    const toast = await this.toastController.create({
      message: "Name should start with a capital letter",
      duration: 2000, // Duration in milliseconds
      position: "bottom", // Position of the toast message
    });
    await toast.present();
  }

  

  onNameInput() {
    if (this.name && !/^[A-Z]/.test(this.name)) {
      this.presentNameValidationToast();
    }
  }

  

  isInputEmpty(): boolean {
    return !(
      this.name &&
      this.address &&
      this.plaats &&
      this.idnumber &&
      this.telefoon &&
      this.pakket_id &&
      this.tracking &&
      this.pakket_omschrijving &&
      this.volume
    );
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: 'Input veld is leeg',
      buttons: ['OK']
    });

    await alert.present();
  }

}
