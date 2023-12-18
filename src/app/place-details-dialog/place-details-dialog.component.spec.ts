import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceDetailsDialog } from './place-details-dialog.component';

describe('PlaceDetailsDialogComponent', () => {
  let component: PlaceDetailsDialog;
  let fixture: ComponentFixture<PlaceDetailsDialog>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlaceDetailsDialog]
    });
    fixture = TestBed.createComponent(PlaceDetailsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
