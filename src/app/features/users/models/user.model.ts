export type PhoneType = 'mobile' | 'home' | 'work';

export const PHONE_TYPE_LABELS: Record<PhoneType, string> = {
  mobile: 'Celular',
  home: 'Residencial',
  work: 'Comercial',
};

export interface User {
  readonly id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  phoneType: PhoneType;
  readonly createdAt: string;
}

export type CreateUserPayload = Omit<User, 'id' | 'createdAt'>;

export type UpdateUserPayload = CreateUserPayload & { readonly id: string };
