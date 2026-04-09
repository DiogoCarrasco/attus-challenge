import { FormControl } from '@angular/forms';

import { isValidCpf, cpfValidator } from './cpf.validator';

describe('isValidCpf', () => {
  it('should return true for a valid CPF', () => {
    expect(isValidCpf('529.982.247-25')).toBeTrue();
    expect(isValidCpf('52998224725')).toBeTrue();
  });

  it('should return false for a CPF with all equal digits', () => {
    expect(isValidCpf('111.111.111-11')).toBeFalse();
    expect(isValidCpf('00000000000')).toBeFalse();
  });

  it('should return false for a CPF with wrong check digits', () => {
    expect(isValidCpf('123.456.789-00')).toBeFalse();
  });

  it('should return false for a CPF with incorrect length', () => {
    expect(isValidCpf('123.456')).toBeFalse();
    expect(isValidCpf('12345678901234')).toBeFalse();
  });
});

describe('cpfValidator', () => {
  const validator = cpfValidator();

  it('should return null for an empty control (not required)', () => {
    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });

  it('should return null for a valid CPF', () => {
    const control = new FormControl('529.982.247-25');
    expect(validator(control)).toBeNull();
  });

  it('should return invalidCpf error for an invalid CPF', () => {
    const control = new FormControl('123.456.789-00');
    expect(validator(control)).toEqual({ invalidCpf: true });
  });
});
