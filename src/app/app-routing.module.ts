import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule),
  },
  {
    path: 'scanner',
    loadChildren: () => import('./scanner/scanner.module').then(m => m.ScannerPageModule),
  },
  {
    path: 'pakketten',
    loadChildren: () => import('./pakketten/pakketten.module').then(m => m.PakkettenPageModule),
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule),
  },
  {
    path: 'usapackages',
    loadChildren: () => import('./usapackages/usapackages.module').then( m => m.UsapackagesPageModule)
  },
  {
    path: 'settingsusa',
    loadChildren: () => import('./settingsusa/settingsusa.module').then( m => m.SettingsusaPageModule)
  },

  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
