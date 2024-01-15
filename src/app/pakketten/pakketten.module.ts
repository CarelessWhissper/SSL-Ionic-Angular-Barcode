import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PakkettenPageRoutingModule } from './pakketten-routing.module';

import { PakkettenPage } from './pakketten.page';
import { SortingOptionsComponent } from './SortingOptionsComponent';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PakkettenPageRoutingModule
  ],
  declarations: [PakkettenPage, SortingOptionsComponent],
  entryComponents: [SortingOptionsComponent] // Add SortingOptionsComponent to the entryComponents array
})
export class PakkettenPageModule {}
