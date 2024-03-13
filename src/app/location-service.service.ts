// location.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private userLocationSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private storage: Storage) { 
    this.initUserLocation();
  }

  private async initUserLocation(): Promise<void> {
    try {
      const userData = await this.storage.get('login');
      if (userData && userData.locatie) {
        this.userLocationSubject.next(userData.locatie);
        console.log("the userlocation is has been received")
      }
    } catch (error) {
      console.error('Error retrieving user location:', error);
    }
  }

  setUserLocation(location: string): void {
    this.userLocationSubject.next(location);
  }

  getUserLocation(): Observable<string> {
    return this.userLocationSubject.asObservable();
  }
}
