import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordlessRegisterComponent } from './passwordless-register.component';

describe('PasswordlessRegisterComponent', () => {
  let component: PasswordlessRegisterComponent;
  let fixture: ComponentFixture<PasswordlessRegisterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordlessRegisterComponent]
    });
    fixture = TestBed.createComponent(PasswordlessRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
