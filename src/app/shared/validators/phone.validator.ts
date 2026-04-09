import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;
    const stripped = value.replace(/\D/g, '');
    const isValid = stripped.length === 10 || stripped.length === 11;
    return isValid ? null : { invalidPhone: true };
  };
}
