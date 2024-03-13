import { Component, OnInit } from "@angular/core";
import { LoadingController, ToastController,AlertController  } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { ExampleModalComponentComponent } from "../example-modal-component/example-modal-component.component";
import { ModalController } from "@ionic/angular";
import { SortingOptionsComponent } from "./SortingsOptionsComponentUsa";
import { PopoverController } from "@ionic/angular";

@Component({
  selector: "app-usapackages",
  templateUrl: "./usapackages.page.html",
  styleUrls: ["./usapackages.page.scss"],
})
export class UsapackagesPage implements OnInit {
  pakkettenUsaData: {
    ontvanger_id: string;
    pakket_id: string;
    tracking: string;
    verzender: string;
    volume: string;
    invoer: Date;
    status_name: string;
    ontvanger: string;
    ontvanger_land: string;
  }[] = [];
  searchText: string = "";
  suggestions: any[] = [];
  showSuggestions: boolean = false;
  selectedPakket: any;
  searchOptions: any[] = [];
  selectedOntvangers: any[] = [];

  isModalOpen: boolean[] = [];
  filteredOptions: any[] = [];

  selectedCountry: any;

  countryData: any[] = [];

  countryInput: string[] = [];

  selectedOntvangerId: string | null = null;
  selectedPakketId: string | null = null;

  searchTerm: string = "";
  usaData: any[] = [];

  currentSortOrder: "asc" | "desc" = "asc";

  constructor(
    public loadingController: LoadingController,
    public http: HttpClient,
    private modalController: ModalController,
    public toastController: ToastController,
    public popoverController: PopoverController,
    private alertController: AlertController
  ) {
    this.loadSearchOptions();
  }

  ngOnInit() {
    this.loadDataFromApi();
  }

  async onSearch(): Promise<void> {
    if (this.searchTerm && this.searchTerm.length >= 3) {
      await this.loadDataFromApi(this.searchTerm);
    }
  }
  

  onClear(): void {
    // Set the search term to an empty space
    this.searchTerm = " ";

    // Reload data from the API with an empty search term
    this.loadDataFromApi();
  }

  async loadDataFromApi(searchTerm: string | null = null): Promise<void> {
    const loading = await this.loadingController.create({
      message: "Pakketten worden geladen...",
      translucent: true,
      cssClass: "custom-loading",
    });
    await loading.present();

    let apiUrl = "https://ssl.app.sr/tester_app/api/usa";

    // Append the search term as a query parameter if it is provided
    if (searchTerm && searchTerm.length >= 3) {
      apiUrl += `?search_term=${encodeURIComponent(searchTerm)}`;
    }

    this.http.get<any[]>(apiUrl).subscribe(
      (response: any[]) => {
        this.pakkettenUsaData = response.map((item) => ({
          pakket_id: item.pakket_id,
          tracking: item.tracking,
          verzender: item.verzender,
          volume: item.volume,
          invoer: item.invoer,
          status_name: item.status_name,
          ontvanger_land: item.ontvanger_land,
          ontvanger: item.ontvanger,
          ontvanger_id: item.ontvanger_id,
        }));
        loading.dismiss(); // Dismiss the loading animation after data is loaded
      },
      (error) => {
        console.error("Error fetching data from API:", error);
        loading.dismiss(); // Dismiss the loading animation if there's an error
      }
    );
  }

  async presentModal(pakket_id: string) {
    const modal = await this.modalController.create({
      component: ExampleModalComponentComponent,
      componentProps: {
        pakket_id: pakket_id
      }
    });
  
    // Set modal open flag to true
    return await modal.present();
  }
  
 

 
  toggleCard(pakket: any) {
    pakket.showCardContent = !pakket.showCardContent;
    console.log('Selected pakket_id:', pakket.pakket_id);
  }

  clearOntvanger(cardIndex: number) {
    this.selectedOntvangers[cardIndex] = ""; // Clear the ontvanger input
  }

  clearOntvangerLand(cardIndex: number) {
    this.selectedOntvangers[cardIndex] = ""; // Clear the ontvanger_land input
  }

  loadSearchOptions() {
    this.http
      .get<any>("https://ssl.app.sr/tester_app/api/getOntvangers")
      .subscribe(
        (response) => {
          if (response.success && Array.isArray(response.data)) {
            // Extract names from the data array
            this.searchOptions = response.data.map((item: any) => item.name);
          } else {
            console.error("Invalid response format:", response);
          }
        },
        (error) => {
          console.error("Error fetching search options:", error);
        }
      );
  }

  selectName(event: any) {
    console.log("Selected name:", event.detail.value);
  }

  // Function to handle button click and trigger update
  updateButtonClicked() {
    // Check if both ontvanger ID and pakket ID are available
    if (this.selectedOntvangerId && this.selectedPakketId) {
      // Call the update function with the stored data
      this.updateUsa(this.selectedOntvangerId, this.selectedPakketId);
    } else {
      console.error("Missing required fields");
    }
  }

  async updateUsa(
    selectedOntvangerId: string,
    selectedPakketId: string
  ): Promise<void> {
    // Check if the required fields are present
    if (!selectedOntvangerId || !selectedPakketId) {
      console.error("Missing required fields");
      return;
    }

    const requestData = {
      ontvanger_id: selectedOntvangerId,
      pakket_id: selectedPakketId,
    };

    try {
      const response = await this.http
        .post<any>("https://ssl.app.sr/tester_app/api/update-usa", requestData)
        .toPromise();
      console.log("Update successful:", response);

      // Find the index of the updated package in the pakkettenUsaData array
      const index = this.pakkettenUsaData.findIndex(
        (pakket) => pakket.pakket_id === selectedPakketId
      );
      if (index !== -1) {
        // Update the ontvanger and ontvanger_land properties in the local array
        this.pakkettenUsaData[index].ontvanger_id = selectedOntvangerId;
        // Assuming you have the corresponding country data available in response, update it accordingly
        this.pakkettenUsaData[index].ontvanger_land = response.countryData;
      }

      const toast = await this.toastController.create({
        message: "Update successful",
        duration: 2000,
        position: "bottom",
      });
      await toast.present();
    } catch (error) {
      console.error("Update failed:", error);

      const toast = await this.toastController.create({
        message: "Update failed",
        duration: 2000,
        position: "bottom",
      });
      await toast.present();
    }
  }

  async handleUpdateClick(cardIndex: number, pakketId: string): Promise<void> {
    if (this.selectedOntvangerId && pakketId) {
      console.log(
        "the id and pakket_id are",
        this.selectedOntvangerId,
        pakketId
      );
      await this.updateUsa(this.selectedOntvangerId, pakketId);
    } else {
      console.error("Ontvanger ID or pakket ID is undefined");
    }
  }

  async handleUpdateStatusClick(
   
    pakketId: string
  ): Promise<void> {
    if (pakketId) {
      await this.updateStatus(pakketId);
    } else {
      console.log(
        "pakket_id is",

        pakketId
      );
      console.error("pakket_id is undefined");
    }
  }

  async updateStatus(selectedPakketId: string): Promise<void> {
    if (!selectedPakketId) {
      console.error("Missing required fields");
      return;
    }
  
    const requestData = {
      pakket_id: selectedPakketId,
    };
  
    try {
      const response = await this.http
        .post<any>(
          "https://ssl.app.sr/tester_app/api/updateUsaStatus",
          requestData
        )
        .toPromise();
      console.log("Update successful:", response);
  
      const toast = await this.toastController.create({
        message: "Update successful",
        duration: 2000,
        position: "bottom",
        color: "success" // Apply success color
      });
      await toast.present();
      this.loadDataFromApi();
    } catch (error) {
      console.error("Update failed:", error);
  
      const toast = await this.toastController.create({
        message: "Update failed",
        duration: 2000,
        position: "bottom",
        color: "danger" // Apply failure color
      });
      await toast.present();
    }
  }
  

  async presentSortingOptions(ev: any) {
    const popover = await this.popoverController.create({
      component: SortingOptionsComponent,
      event: ev,
      translucent: true,
      cssClass: "minimalist-popover",
    });
  
    popover.onWillDismiss().then((sortOption) => {
      if (sortOption && sortOption.data) {
        this.handleSortingOption(sortOption.data);
      }
    });
  
    await popover.present();
  }
  
  // Handle the selected sorting option
  handleSortingOption(option: string) {
    switch (option) {
      case "pakket_id":
        this.sortById();
        break;
      case "tracking":
        this.sortByTracking();
        break;
      case "verzender":
        this.sortByVerzender();
        break;
      default:
        break;
    }
  }

  toggleSortOrder() {
    this.currentSortOrder = this.currentSortOrder === "asc" ? "desc" : "asc";
  }

  // Sort packages by status name
  sortById() {
    console.log("Sorting by status name");

    // Sort the pakkettenUsaData array based on status_name
    this.pakkettenUsaData.sort((a, b) => {
      const statusA = a.pakket_id || "";
      const statusB = b.pakket_id || "";
      const result = statusA.localeCompare(statusB);
      return this.currentSortOrder === "asc" ? result : -result;
    });
    this.toggleSortOrder();
  }

  sortByTracking() {
    console.log("Sorting by ontvanger");

    //sort the data array based on the ontvanger
    this.pakkettenUsaData.sort((a, b) => {
      const ontvangerA = a.tracking || "";
      const ontvangerB = b.tracking || "";
      const result = ontvangerA.localeCompare(ontvangerB);
      return this.currentSortOrder === "asc" ? result : -result;
    });
    this.toggleSortOrder();
  }

  sortByVerzender() {
    console.log("sorting by verzender");

    //sort the data array based on the verzender
    this.pakkettenUsaData.sort((a, b) => {
      const verzenderA = a.verzender || "";
      const verzenderB = b.verzender || "";
      const result = verzenderA.localeCompare(verzenderB);
      return this.currentSortOrder === "asc" ? result : -result;
    });
    this.toggleSortOrder();
  }

  async confirmUpdateStatusClick(pakketId: string) {
    
    const alert = await this.alertController.create({
      header: 'Bevestiging',
      message: `Wilt u zeker het pakket ${pakketId} updaten?`,
      buttons: [
        {
          text: 'Nee',
          role: 'cancel'
        },
        {
          text: 'Ja',
          handler: () => {
            this.handleUpdateStatusClick(pakketId);
          }
        }
      ]
    });
  
    await alert.present();
  }
  
}
