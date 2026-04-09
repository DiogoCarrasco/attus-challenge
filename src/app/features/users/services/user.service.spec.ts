import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { CreateUserPayload, UpdateUserPayload, User } from '../models/user.model';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [UserService] });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return the full list of users after latency', fakeAsync(() => {
      let result: User[] = [];
      service.getAll().subscribe((users) => (result = users));
      tick(1000);
      expect(result.length).toBeGreaterThan(0);
    }));

    it('should return a copy (immutable source)', fakeAsync(() => {
      let first: User[] = [];
      let second: User[] = [];
      service.getAll().subscribe((u) => (first = u));
      service.getAll().subscribe((u) => (second = u));
      tick(1000);
      expect(first).not.toBe(second);
    }));
  });

  describe('getById', () => {
    it('should return user with the given id', fakeAsync(() => {
      let found: User | undefined;
      service.getById('1').subscribe((u) => (found = u));
      tick(1000);
      expect(found).toBeDefined();
      expect(found?.id).toBe('1');
    }));

    it('should emit an error for a non-existent id', fakeAsync(() => {
      let errorMessage = '';
      service.getById('nonexistent').subscribe({
        error: (err: Error) => (errorMessage = err.message),
      });
      tick(1000);
      expect(errorMessage).toContain('nonexistent');
    }));
  });

  describe('create', () => {
    it('should add a new user and return it with a generated id', fakeAsync(() => {
      const payload: CreateUserPayload = {
        name: 'Novo Usuario',
        email: 'novo@email.com',
        cpf: '123.456.789-09',
        phone: '(11) 99999-0000',
        phoneType: 'mobile',
      };

      let created: User | undefined;
      service.create(payload).subscribe((u) => (created = u));
      tick(1000);

      expect(created).toBeDefined();
      expect(created?.id).toBeTruthy();
      expect(created?.name).toBe(payload.name);
      expect(created?.email).toBe(payload.email);
    }));

    it('should persist the new user in subsequent getAll calls', fakeAsync(() => {
      const payload: CreateUserPayload = {
        name: 'Persistido',
        email: 'persist@email.com',
        cpf: '000.000.000-00',
        phone: '(11) 11111-1111',
        phoneType: 'work',
      };

      service.create(payload).subscribe();
      tick(1000);

      let all: User[] = [];
      service.getAll().subscribe((u) => (all = u));
      tick(1000);

      expect(all.some((u) => u.name === 'Persistido')).toBeTrue();
    }));
  });

  describe('update', () => {
    it('should update an existing user and return the updated data', fakeAsync(() => {
      const payload: UpdateUserPayload = {
        id: '1',
        name: 'Ana Souza Atualizada',
        email: 'ana.nova@email.com',
        cpf: '529.982.247-25',
        phone: '(11) 91234-5678',
        phoneType: 'mobile',
      };

      let updated: User | undefined;
      service.update(payload).subscribe((u) => (updated = u));
      tick(1000);

      expect(updated?.name).toBe('Ana Souza Atualizada');
      expect(updated?.email).toBe('ana.nova@email.com');
    }));

    it('should emit an error when updating a non-existent user', fakeAsync(() => {
      const payload: UpdateUserPayload = {
        id: 'ghost-id',
        name: 'Fantasma',
        email: 'ghost@email.com',
        cpf: '000.000.000-00',
        phone: '(00) 00000-0000',
        phoneType: 'mobile',
      };

      let errored = false;
      service.update(payload).subscribe({ error: () => (errored = true) });
      tick(1000);

      expect(errored).toBeTrue();
    }));
  });

  describe('searchByName', () => {
    it('should return all users when query is empty', fakeAsync(() => {
      let all: User[] = [];
      let searched: User[] = [];

      service.getAll().subscribe((u) => (all = u));
      tick(1000);

      service.searchByName('').subscribe((u) => (searched = u));
      tick(1000);

      expect(searched.length).toBe(all.length);
    }));

    it('should filter users by name (case-insensitive)', fakeAsync(() => {
      let result: User[] = [];
      service.searchByName('ana').subscribe((u) => (result = u));
      tick(1000);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((u) =>
        expect(u.name.toLowerCase()).toContain('ana'),
      );
    }));

    it('should return empty array when no users match', fakeAsync(() => {
      let result: User[] = [];
      service.searchByName('xyzxyzxyznotexist').subscribe((u) => (result = u));
      tick(1000);
      expect(result.length).toBe(0);
    }));
  });

  describe('delete', () => {
    it('should remove the user from the list', fakeAsync(() => {
      service.delete('1').subscribe();
      tick(1000);

      let all: User[] = [];
      service.getAll().subscribe((u) => (all = u));
      tick(1000);

      expect(all.find((u) => u.id === '1')).toBeUndefined();
    }));
  });
});
