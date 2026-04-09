import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cpfMask', standalone: true })
export class CpfMaskPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const stripped = value.replace(/\D/g, '').slice(0, 11);
    return stripped
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
}
