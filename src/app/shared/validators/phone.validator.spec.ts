import { FormControl } from '@angular/forms';

import { phoneValidator } from './phone.validator';

describe('phoneValidator', () => {
  const validator = phoneValidator();

  it('should return null for an empty value (not required)', () => {
    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });

  it('should return null for a valid 10-digit phone (landline)', () => {
    const control = new FormControl('(11) 3456-7890');
    expect(validator(control)).toBeNull();
  });

  it('should return null for a valid 11-digit phone (mobile)', () => {
    const control = new FormControl('(11) 91234-5678');
    expect(validator(control)).toBeNull();
  });

  it('should return invalidPhone for a phone with fewer than 10 digits', () => {
    const control = new FormControl('(11) 1234');
    expect(validator(control)).toEqual({ invalidPhone: true });
  });

  it('should return invalidPhone for a phone with more than 11 digits', () => {
    const control = new FormControl('(11) 912345-67890');
    expect(validator(control)).toEqual({ invalidPhone: true });
  });
});
