import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataReloadService {
  // Define reload$ as a Subject
  reload$: Subject<void> = new Subject<void>();

  constructor() { }

  triggerReload() {
    // Emit a value to trigger reload
    this.reload$.next();
  }
}
