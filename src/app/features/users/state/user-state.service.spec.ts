import { TestBed } from '@angular/core/testing';

import { User } from '../models/user.model';
import { UserStateService } from './user-state.service';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  name: 'Usuario Teste',
  email: 'teste@email.com',
  cpf: '000.000.000-00',
  phone: '(11) 91111-2222',
  phoneType: 'mobile',
  createdAt: '2024-01-01',
  ...overrides,
});

describe('UserStateService', () => {
  let service: UserStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserStateService);
  });

  it('should be created with default initial state', () => {
    expect(service).toBeTruthy();
    expect(service.users()).toEqual([]);
    expect(service.isLoading()).toBeFalse();
    expect(service.error()).toBeNull();
    expect(service.currentPage()).toBe(1);
  });

  describe('setLoading', () => {
    it('should update the loading flag', () => {
      service.setLoading(true);
      expect(service.isLoading()).toBeTrue();

      service.setLoading(false);
      expect(service.isLoading()).toBeFalse();
    });
  });

  describe('setError', () => {
    it('should set the error message and clear loading', () => {
      service.setLoading(true);
      service.setError('Algo deu errado');

      expect(service.error()).toBe('Algo deu errado');
      expect(service.isLoading()).toBeFalse();
    });
  });

  describe('setUsers', () => {
    it('should replace the users list and reset state', () => {
      service.setError('erro anterior');
      service.setLoading(true);

      const users = [makeUser({ id: '1' }), makeUser({ id: '2' })];
      service.setUsers(users);

      expect(service.users().length).toBe(2);
      expect(service.isLoading()).toBeFalse();
      expect(service.error()).toBeNull();
      expect(service.currentPage()).toBe(1);
    });
  });

  describe('addUser', () => {
    it('should append the new user to the existing list', () => {
      service.setUsers([makeUser({ id: '1' })]);
      service.addUser(makeUser({ id: '2', name: 'Novo' }));

      expect(service.users().length).toBe(2);
      expect(service.users()[1].name).toBe('Novo');
    });
  });

  describe('updateUser', () => {
    it('should replace the user with matching id', () => {
      service.setUsers([makeUser({ id: '1', name: 'Original' })]);
      service.updateUser(makeUser({ id: '1', name: 'Atualizado' }));

      expect(service.users()[0].name).toBe('Atualizado');
    });

    it('should not alter users when id does not match', () => {
      service.setUsers([makeUser({ id: '1', name: 'Original' })]);
      service.updateUser(makeUser({ id: '999', name: 'Fantasma' }));

      expect(service.users().length).toBe(1);
      expect(service.users()[0].name).toBe('Original');
    });
  });

  describe('setPage', () => {
    it('should update the current page', () => {
      service.setPage(3);
      expect(service.currentPage()).toBe(3);
    });
  });

  describe('paginatedUsers (computed)', () => {
    it('should return only the current page slice', () => {
      const allUsers = Array.from({ length: 20 }, (_, i) =>
        makeUser({ id: String(i + 1), name: `User ${i + 1}` }),
      );
      service.setUsers(allUsers);

      const page1 = service.paginatedUsers();
      expect(page1.length).toBe(8);
      expect(page1[0].name).toBe('User 1');

      service.setPage(2);
      const page2 = service.paginatedUsers();
      expect(page2.length).toBe(8);
      expect(page2[0].name).toBe('User 9');
    });
  });

  describe('totalPages (computed)', () => {
    it('should calculate total pages correctly', () => {
      const users = Array.from({ length: 17 }, (_, i) =>
        makeUser({ id: String(i + 1) }),
      );
      service.setUsers(users);
      expect(service.totalPages()).toBe(3);
    });

    it('should return 1 when there are no users', () => {
      service.setUsers([]);
      expect(service.totalPages()).toBe(1);
    });
  });

  describe('resetError', () => {
    it('should clear the error message', () => {
      service.setError('some error');
      service.resetError();
      expect(service.error()).toBeNull();
    });
  });
});
