import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CpfMaskPipe } from '../../../../shared/pipes/cpf-mask.pipe';
import { PhoneMaskPipe } from '../../../../shared/pipes/phone-mask.pipe';
import { PHONE_TYPE_LABELS, User } from '../../models/user.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    CpfMaskPipe,
    PhoneMaskPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
})
export class UserCardComponent {
  readonly user = input.required<User>();
  readonly edit = output<User>();

  protected readonly phoneTypeLabel = computed(
    () => PHONE_TYPE_LABELS[this.user().phoneType],
  );

  protected onEdit(): void {
    this.edit.emit(this.user());
  }
}
