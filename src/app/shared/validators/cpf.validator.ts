import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function calcCheckDigit(slice: string, factor: number): number {
  const sum = slice
    .split('')
    .reduce((acc, digit, i) => acc + Number(digit) * (factor - i), 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(cpf: string): boolean {
  const stripped = cpf.replace(/\D/g, '');

  if (stripped.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(stripped)) return false;

  const firstDigit = calcCheckDigit(stripped.slice(0, 9), 10);
  if (firstDigit !== Number(stripped[9])) return false;

  const secondDigit = calcCheckDigit(stripped.slice(0, 10), 11);
  return secondDigit === Number(stripped[10]);
}

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;
    return isValidCpf(value) ? null : { invalidCpf: true };
  };
}
