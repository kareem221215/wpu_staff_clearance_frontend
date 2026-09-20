import { Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { Fluid } from 'primeng/fluid';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Search } from '@primeicons/angular/search';
import { InputText } from 'primeng/inputtext';

@Component({
  imports: [Fluid, FormField, IconField, InputIcon, Search, InputText],
  selector: 'app-staff-search-input',
  styles: ':host { display: contents; }',
  templateUrl: './staff-search-input.html',
})
export class StaffSearchInput {
  readonly field = input.required<FieldTree<string>>();
  readonly inputId = input('staff-search-input');

  readonly onChange = output<string>();
}
