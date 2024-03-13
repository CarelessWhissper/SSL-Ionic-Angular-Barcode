import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor(private http: HttpClient) {}

  getResults(searchTerm: string): Observable<any[]> {
    // Define the endpoint URL
    const url = "https://ssl.app.sr/api/getOntvangers";

    // Set the search term as a query parameter
    const params = new HttpParams().set("search_term", searchTerm);

    // Make the HTTP request with the search term as a query parameter
    return this.http.get<any[]>(url, { params }).pipe(
      map((response: any) => {
        if (response.success && Array.isArray(response.data)) {
          // Check if searchTerm is null or empty before filtering
          const filteredResults = searchTerm ? response.data.filter((item: any) => 
            item.name.includes(searchTerm.toLowerCase())
          ) : [];
          return filteredResults;
        } else {
          // Return an empty array if there are no results or if the response is invalid
          return [];
        }
      })
    );
  }
}
