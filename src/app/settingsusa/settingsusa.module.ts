import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsusaPageRoutingModule } from './settingsusa-routing.module';

import { SettingsusaPage } from './settingsusa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsusaPageRoutingModule
  ],
  declarations: [SettingsusaPage]
})
export class SettingsusaPageModule {}
