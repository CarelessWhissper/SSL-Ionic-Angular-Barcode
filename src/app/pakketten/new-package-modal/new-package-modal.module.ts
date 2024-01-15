// new-package-modal.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { IonicModule } from '@ionic/angular';

import { NewPackageModalComponent } from './new-package-modal.component';

@NgModule({
  declarations: [NewPackageModalComponent],
  imports: [
    CommonModule,
    FormsModule, // Import FormsModule here
    IonicModule,
  ],
  entryComponents: [NewPackageModalComponent],
  exports: [NewPackageModalComponent],
})
export class NewPackageModalModule {}
