import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSenderModalComponent } from './code-sender-modal.component';

describe('CodeSenderModalComponent', () => {
  let component: CodeSenderModalComponent;
  let fixture: ComponentFixture<CodeSenderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeSenderModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSenderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
