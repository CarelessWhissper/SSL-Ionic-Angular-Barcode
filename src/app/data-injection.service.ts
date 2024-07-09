import { Injectable  } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LoadingController } from "@ionic/angular";


@Injectable({
  providedIn: "root",
})
export class DataInjectionService {
  constructor(
    private http: HttpClient,
    public loadingController: LoadingController,
   
  ) {}

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

  async loadDataFromApi(searchTerm: string | null = null): Promise<any[]> {
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

    return new Promise<any[]>((resolve, reject) => {
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
          resolve(this.pakkettenUsaData); // Resolve the Promise with the loaded data
        },
        (error) => {
          console.error("Error fetching data from API:", error);
          loading.dismiss(); // Dismiss the loading animation if there's an error
          reject(error); // Reject the Promise with the error
        }
      );
    });
  }

  reloadUsaPackages(){
    //reload data from the api
    this.loadDataFromApi().then(data=>{

    }).catch(error=>{
      console.error("you messed up",error);
    })
  }
}
