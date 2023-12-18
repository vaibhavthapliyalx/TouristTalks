import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlacesComponent } from './add-places.component';

describe('AddPlacesComponent', () => {
  let component: AddPlacesComponent;
  let fixture: ComponentFixture<AddPlacesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPlacesComponent]
    });
    fixture = TestBed.createComponent(AddPlacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
