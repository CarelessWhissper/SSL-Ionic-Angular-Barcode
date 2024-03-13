import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UsapackagesPage } from './usapackages.page';

describe('UsapackagesPage', () => {
  let component: UsapackagesPage;
  let fixture: ComponentFixture<UsapackagesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsapackagesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UsapackagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
