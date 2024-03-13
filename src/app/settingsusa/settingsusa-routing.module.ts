import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsusaPage } from './settingsusa.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsusaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsusaPageRoutingModule {}
