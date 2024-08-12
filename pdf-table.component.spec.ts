import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfTableComponent } from './pdf-table.component';

describe('PdfTableComponent', () => {
  let component: PdfTableComponent;
  let fixture: ComponentFixture<PdfTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
