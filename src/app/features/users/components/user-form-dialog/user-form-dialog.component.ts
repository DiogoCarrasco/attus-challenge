import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { cpfValidator } from '../../../../shared/validators/cpf.validator';
import { phoneValidator } from '../../../../shared/validators/phone.validator';
import { CreateUserPayload, PhoneType, UpdateUserPayload, User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserStateService } from '../../state/user-state.service';

export interface UserFormDialogData {
  user?: User;
}

type PhoneFormValue = PhoneType;

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.scss',
})
export class UserFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  private readonly data = inject<UserFormDialogData>(MAT_DIALOG_DATA);
  private readonly userService = inject(UserService);
  private readonly userState = inject(UserStateService);

  protected readonly isEditMode = !!this.data?.user;
  protected readonly isSaving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, cpfValidator()]],
    phone: ['', [Validators.required, phoneValidator()]],
    phoneType: ['mobile' as PhoneFormValue, Validators.required],
  });

  ngOnInit(): void {
    if (this.data?.user) {
      this.form.patchValue(this.data.user);
    }
  }

  protected getControl(name: string): AbstractControl {
    return this.form.get(name)!;
  }

  protected hasError(controlName: string, errorKey: string): boolean {
    const control = this.getControl(controlName);
    return control.hasError(errorKey) && (control.dirty || control.touched);
  }

  protected onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const masked = this.applyCpfMask(input.value);
    this.form.get('cpf')!.setValue(masked, { emitEvent: false });
    input.value = masked;
  }

  protected onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const masked = this.applyPhoneMask(input.value);
    this.form.get('phone')!.setValue(masked, { emitEvent: false });
    input.value = masked;
  }

  private applyCpfMask(value: string): string {
    const stripped = value.replace(/\D/g, '').slice(0, 11);
    return stripped
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  private applyPhoneMask(value: string): string {
    const stripped = value.replace(/\D/g, '').slice(0, 11);
    if (stripped.length <= 10) {
      return stripped
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return stripped
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.isSaving()) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.saveError.set(null);

    const raw = this.form.getRawValue();
    const phoneType = raw.phoneType as PhoneType;

    if (this.isEditMode && this.data.user) {
      const payload: UpdateUserPayload = {
        id: this.data.user.id,
        name: raw.name!,
        email: raw.email!,
        cpf: raw.cpf!,
        phone: raw.phone!,
        phoneType,
      };
      this.userService.update(payload).subscribe({
        next: (updated) => {
          this.userState.updateUser(updated);
          this.dialogRef.close(updated);
        },
        error: (err: Error) => {
          this.saveError.set(err.message ?? 'Erro ao atualizar usuário.');
          this.isSaving.set(false);
        },
      });
    } else {
      const payload: CreateUserPayload = {
        name: raw.name!,
        email: raw.email!,
        cpf: raw.cpf!,
        phone: raw.phone!,
        phoneType,
      };
      this.userService.create(payload).subscribe({
        next: (created) => {
          this.userState.addUser(created);
          this.dialogRef.close(created);
        },
        error: (err: Error) => {
          this.saveError.set(err.message ?? 'Erro ao criar usuário.');
          this.isSaving.set(false);
        },
      });
    }
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
