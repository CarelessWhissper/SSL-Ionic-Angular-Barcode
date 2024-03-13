import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SettingsusaPage } from './settingsusa.page';

describe('SettingsusaPage', () => {
  let component: SettingsusaPage;
  let fixture: ComponentFixture<SettingsusaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsusaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsusaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
