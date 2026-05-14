import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18nService } from 'src/app/core/services/i18n.service';

@Component({
  selector: 'app-animal-register-individual',
  templateUrl: './animal-register-individual.component.html',
  styleUrls: ['./animal-register-individual.component.scss']
})
export class AnimalRegisterIndividualComponent {
  readonly form: FormGroup;
  feedback: { type: 'success' | 'error'; message: string } | null = null;

  constructor(private readonly fb: FormBuilder, private readonly i18n: I18nService) {
    this.form = this.fb.group({
      ranchUuid: ['', [Validators.required]],
      breedUuid: ['', [Validators.required]],
      sex: ['', [Validators.required]]
    });
  }

  submit(): void {
    this.feedback = null;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.feedback = { type: 'error', message: this.i18n.translate('animal.individualInvalid') };
      return;
    }

    this.feedback = { type: 'success', message: this.i18n.translate('animal.individualSaveStub') };
    this.form.reset({ ranchUuid: '', breedUuid: '', sex: '' });
  }
}
