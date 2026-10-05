import { Component, computed, inject, input, output } from '@angular/core';
import { Folder } from '@primeicons/angular/folder';
import { ButtonDirective } from 'primeng/button';
import { IRequest } from '../../../interfaces/request.interface';
import { RequestActionsService } from '../../../services/request-actions.service';
import { RequestPolicyService } from '../../../services/request-policy.service';

@Component({
  imports: [ButtonDirective, Folder],
  selector: 'app-archive-button',
  styles: ':host { display: contents; }',
  templateUrl: './archive-button.html',
})
export class ArchiveButton {
  readonly #requestActionsService = inject(RequestActionsService);
  readonly #requestPolicyService = inject(RequestPolicyService);

  readonly request = input.required<IRequest>();

  readonly onArchive = output<boolean>();

  protected readonly canArchive = computed(() => {
    return this.#requestPolicyService.canArchive(this.request());
  });

  archive(evt: MouseEvent) {
    this.#requestActionsService.archive(evt, this.request()).then(() => {
      this.onArchive.emit(true);
    });
  }
}
