import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PakkettenPageRoutingModule } from './pakketten-routing.module';

import { PakkettenPage } from './pakketten.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PakkettenPageRoutingModule
  ],
  declarations: [PakkettenPage]
})
export class PakkettenPageModule {}
