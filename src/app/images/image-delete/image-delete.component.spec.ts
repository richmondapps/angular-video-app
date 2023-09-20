import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDeleteComponent } from './image-delete.component';

describe('ImageDeleteComponent', () => {
  let component: ImageDeleteComponent;
  let fixture: ComponentFixture<ImageDeleteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageDeleteComponent]
    });
    fixture = TestBed.createComponent(ImageDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
