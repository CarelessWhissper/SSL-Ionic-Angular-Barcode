// pakketten-routing.module.ts

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
  declarations: [],
  imports: [RouterModule.forChild(routes)], // Include SharedModule
  exports: [RouterModule],
})
export class PakkettenPageRoutingModule {}
