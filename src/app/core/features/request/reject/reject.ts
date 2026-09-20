import { Component, inject, input, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { CheckCircle } from '@primeicons/angular/check-circle';
import { TimesCircle } from '@primeicons/angular/times-circle';
import { ButtonDirective } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { DialogContainer } from '../../../../shared/components/dialog-container/dialog-container';
import { IRequest } from '../../../interfaces/request.interface';

@Component({
  templateUrl: './reject.html',
  imports: [
    ButtonDirective,
    CheckCircle,
    DialogContainer,
    FormField,
    FormRoot,
    InputText,
    TimesCircle,
  ],
  styles: ':host { display: contents; }',
})
export class RequestReject {
  readonly #ref = inject(DynamicDialogRef);

  readonly request = input.required<IRequest>();

  readonly rejectionFormModel = signal({ note: '' });

  readonly rejectionForm = form(
    this.rejectionFormModel,
    (schema) => {
      required(schema.note);
    },
    {
      submission: {
        action: async (root) => {
          this.#ref.close(root.note().value());
        },
      },
    },
  );

  close() {
    this.#ref.close();
  }
}
