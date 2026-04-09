import { CpfMaskPipe } from './cpf-mask.pipe';

describe('CpfMaskPipe', () => {
  let pipe: CpfMaskPipe;

  beforeEach(() => {
    pipe = new CpfMaskPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for empty input', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should mask a plain 11-digit CPF string', () => {
    expect(pipe.transform('52998224725')).toBe('529.982.247-25');
  });

  it('should not alter an already masked CPF', () => {
    expect(pipe.transform('529.982.247-25')).toBe('529.982.247-25');
  });

  it('should handle partial input without breaking', () => {
    expect(pipe.transform('529')).toBe('529');
    expect(pipe.transform('529982')).toBe('529.982');
  });
});
