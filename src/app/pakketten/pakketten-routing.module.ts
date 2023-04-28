import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PakkettenPage } from './pakketten.page';

const routes: Routes = [
  {
    path: '',
    component: PakkettenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PakkettenPageRoutingModule {}
