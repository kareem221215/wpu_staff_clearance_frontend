import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, input, output, TemplateRef } from '@angular/core';
import { Times } from '@primeicons/angular/times';
import { ButtonDirective } from 'primeng/button';
@Component({
  selector: 'app-dialog-container',
  templateUrl: './dialog-container.html',
  styleUrl: './dialog-container.css',
  imports: [Times, ButtonDirective, NgTemplateOutlet],
})
export class DialogContainer {
  readonly headerTpl = contentChild<TemplateRef<void>>('headerTpl');
  readonly contentTpl = contentChild.required<TemplateRef<void>>('contentTpl');
  readonly footerTpl = contentChild<TemplateRef<void>>('footerTpl');

  readonly title = input('header');

  readonly close = output();
}
import { PrimeIcons } from 'primeng/api';
