import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShellService {
  readonly #toolbarTpl = new BehaviorSubject<TemplateRef<void> | undefined>(undefined);

  readonly toolbarTpl$ = this.#toolbarTpl.asObservable();

  setToolbarTpl(tpl?: TemplateRef<void>) {
    this.#toolbarTpl.next(tpl);
  }
}
