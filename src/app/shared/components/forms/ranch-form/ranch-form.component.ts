import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

export interface RanchFormValue {
  name: string;
  location: string;
  area: string;
}

@Component({
  selector: 'app-ranch-form',
  templateUrl: './ranch-form.component.html',
  styleUrls: ['./ranch-form.component.scss']
})
export class RanchFormComponent implements OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() loading = false;
  @Input() submitLabelKey = 'common.save';
  @Input() cancelLabelKey = 'common.cancel';
  @Input() value: RanchFormValue = this.buildEmptyValue();

  @Output() readonly submitForm = new EventEmitter<RanchFormValue>();
  @Output() readonly cancelForm = new EventEmitter<void>();

  submitAttempted = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange) {
      this.submitAttempted = false;
    }
    if (changes['mode'] && !changes['mode'].firstChange) {
      this.submitAttempted = false;
    }
  }

  get isValid(): boolean {
    return (this.value.name ?? '').trim().length > 0;
  }

  onSubmit(): void {
    this.submitAttempted = true;
    if (!this.isValid) {
      return;
    }
    this.submitForm.emit({
      name: this.value.name.trim(),
      location: (this.value.location ?? '').trim(),
      area: (this.value.area ?? '').trim()
    });
  }

  onCancel(): void {
    this.submitAttempted = false;
    this.cancelForm.emit();
  }

  private buildEmptyValue(): RanchFormValue {
    return { name: '', location: '', area: '' };
  }
}
