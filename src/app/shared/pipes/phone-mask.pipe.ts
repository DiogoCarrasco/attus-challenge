import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'phoneMask', standalone: true })
export class PhoneMaskPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
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
}
