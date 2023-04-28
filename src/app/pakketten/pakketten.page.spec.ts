import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PakkettenPage } from './pakketten.page';

describe('PakkettenPage', () => {
  let component: PakkettenPage;
  let fixture: ComponentFixture<PakkettenPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PakkettenPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PakkettenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
