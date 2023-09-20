import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageEditComponent } from './image-edit.component';

describe('ImageEditComponent', () => {
  let component: ImageEditComponent;
  let fixture: ComponentFixture<ImageEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageEditComponent]
    });
    fixture = TestBed.createComponent(ImageEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
