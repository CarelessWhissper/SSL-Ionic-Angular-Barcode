import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { UsapackagesPageRoutingModule } from "./usapackages-routing.module";

import { UsapackagesPage } from "./usapackages.page";
import { ExampleModalComponentComponent } from "../example-modal-component/example-modal-component.component";
import { SortingOptionsComponent } from "./SortingsOptionsComponentUsa";
import { DataReloadService } from "../data-reload.service";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsapackagesPageRoutingModule,
  ],
  declarations: [
    UsapackagesPage,
    ExampleModalComponentComponent,
    SortingOptionsComponent,
  ],
  entryComponents: [ExampleModalComponentComponent, SortingOptionsComponent],
  providers:[DataReloadService]
  
})
export class UsapackagesPageModule {}
