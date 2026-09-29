import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Ban } from '@primeicons/angular/ban';
import { File } from '@primeicons/angular/file';
import { Folder } from '@primeicons/angular/folder';
import { Spinner } from '@primeicons/angular/spinner';
import { finalize } from 'rxjs';
import { AuthService } from '../../../shared/services/auth.service';
import { StatsHttpService } from '../../http-services/stats.http-service';
import { ShellService } from '../../services/shell.service';

@Component({
  templateUrl: './stats.html',
  imports: [NgTemplateOutlet, RouterLink, Spinner, File, Ban, Folder],
  styleUrl: './stats.css',
})
export class Stats {
  readonly #authService = inject(AuthService);
  readonly #shellService = inject(ShellService);
  readonly #statsHttpService = inject(StatsHttpService);

  readonly #source$ = this.#statsHttpService.fetch$().pipe(
    finalize(() => {
      this.loading.set(false);
    }),
  );

  readonly loading = signal(true);
  readonly isAdmin = toSignal(this.#authService.isAdmin$);
  readonly stats = toSignal(this.#source$, {
    initialValue: {
      archivedRequestCount: 0,
      completedRequestCount: 0,
      requestCount: 0,
    },
  });

  ngOnInit(): void {
    this.#shellService.setToolbarTpl();
  }
}
