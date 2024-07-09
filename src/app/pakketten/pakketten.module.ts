import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PakkettenPageRoutingModule } from './pakketten-routing.module';

import { PakkettenPage } from './pakketten.page';
import { SortingOptionsComponent } from './SortingOptionsComponent';
import { EditnumberComponent } from '../editnumber/editnumber.component';
import { DataReloadService } from '../data-reload.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PakkettenPageRoutingModule
  ],
  declarations: [PakkettenPage, SortingOptionsComponent,EditnumberComponent],
  entryComponents: [SortingOptionsComponent,EditnumberComponent],
  providers:[DataReloadService]
})
export class PakkettenPageModule {}
