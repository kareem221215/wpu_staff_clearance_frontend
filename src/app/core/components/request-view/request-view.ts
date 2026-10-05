import { NgClass } from '@angular/common';
import { Component, input, ResourceRef } from '@angular/core';
import { Building } from '@primeicons/angular/building';
import { Calendar } from '@primeicons/angular/calendar';
import { CaretLeft } from '@primeicons/angular/caret-left';
import { CheckCircle } from '@primeicons/angular/check-circle';
import { Folder } from '@primeicons/angular/folder';
import { GraduationCap } from '@primeicons/angular/graduation-cap';
import { NoteSticky } from '@primeicons/angular/note-sticky';
import { TimesCircle } from '@primeicons/angular/times-circle';
import { User } from '@primeicons/angular/user';
import { RequestActionTypeEnum } from '../../enums/request-action-type.enum';
import { IRequestAction } from '../../interfaces/request-action.interface';
import { IRequest } from '../../interfaces/request.interface';

@Component({
  imports: [
    Building,
    Calendar,
    CaretLeft,
    CheckCircle,
    Folder,
    GraduationCap,
    NgClass,
    NoteSticky,
    TimesCircle,
    User,
  ],
  selector: 'app-request-view',
  styles: ':host { display: contents; }',
  templateUrl: './request-view.html',
})
export class RequestView {
  readonly requestResource = input.required<ResourceRef<IRequest | undefined>>();

  protected isActionApproved(action: IRequestAction) {
    return action.type === RequestActionTypeEnum.APPROVE;
  }

  protected isActionRejected(action: IRequestAction) {
    return action.type === RequestActionTypeEnum.REJECT;
  }
}
