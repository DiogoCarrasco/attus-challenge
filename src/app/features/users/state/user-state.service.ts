import { Injectable, computed, signal } from '@angular/core';

import { User } from '../models/user.model';

interface UserState {
  readonly users: User[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly currentPage: number;
  readonly pageSize: number;
}

const INITIAL_STATE: UserState = {
  users: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  pageSize: 8,
};

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private readonly _state = signal<UserState>(INITIAL_STATE);

  readonly users = computed(() => this._state().users);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);
  readonly currentPage = computed(() => this._state().currentPage);
  readonly pageSize = computed(() => this._state().pageSize);

  readonly totalUsers = computed(() => this._state().users.length);

  readonly paginatedUsers = computed(() => {
    const { currentPage, pageSize, users } = this._state();
    const start = (currentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this._state().users.length / this._state().pageSize)),
  );

  setLoading(isLoading: boolean): void {
    this._state.update((s) => ({ ...s, isLoading }));
  }

  setError(error: string): void {
    this._state.update((s) => ({ ...s, error, isLoading: false }));
  }

  setUsers(users: User[]): void {
    this._state.update((s) => ({
      ...s,
      users,
      isLoading: false,
      error: null,
      currentPage: 1,
    }));
  }

  addUser(user: User): void {
    this._state.update((s) => ({ ...s, users: [...s.users, user] }));
  }

  updateUser(updated: User): void {
    this._state.update((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === updated.id ? updated : u)),
    }));
  }

  setPage(page: number): void {
    this._state.update((s) => ({ ...s, currentPage: page }));
  }

  resetError(): void {
    this._state.update((s) => ({ ...s, error: null }));
  }
}
