import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { CreateUserPayload, UpdateUserPayload, User } from '../models/user.model';

const SIMULATED_LATENCY_MS = 700;

const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Ana Souza',
    email: 'ana.souza@email.com',
    cpf: '529.982.247-25',
    phone: '(11) 91234-5678',
    phoneType: 'mobile',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Bruno Carvalho',
    email: 'bruno.carvalho@empresa.com',
    cpf: '111.444.777-35',
    phone: '(21) 3456-7890',
    phoneType: 'work',
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Carla Fernandes',
    email: 'carla.fernandes@email.com',
    cpf: '390.533.447-05',
    phone: '(31) 98765-4321',
    phoneType: 'mobile',
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'Diego Lima',
    email: 'diego.lima@email.com',
    cpf: '153.509.460-56',
    phone: '(41) 2345-6789',
    phoneType: 'home',
    createdAt: '2024-04-05',
  },
  {
    id: '5',
    name: 'Elena Martins',
    email: 'elena.martins@empresa.com',
    cpf: '191.191.190-20',
    phone: '(51) 91111-2222',
    phoneType: 'mobile',
    createdAt: '2024-05-18',
  },
  {
    id: '6',
    name: 'Felipe Rocha',
    email: 'felipe.rocha@email.com',
    cpf: '747.464.150-05',
    phone: '(61) 3333-4444',
    phoneType: 'work',
    createdAt: '2024-06-22',
  },
  {
    id: '7',
    name: 'Gabriela Nunes',
    email: 'gabriela.nunes@email.com',
    cpf: '085.914.760-69',
    phone: '(71) 95555-6666',
    phoneType: 'mobile',
    createdAt: '2024-07-30',
  },
  {
    id: '8',
    name: 'Henrique Barros',
    email: 'henrique.barros@empresa.com',
    cpf: '943.895.750-23',
    phone: '(81) 2222-1111',
    phoneType: 'home',
    createdAt: '2024-08-14',
  },
  {
    id: '9',
    name: 'Isabela Costa',
    email: 'isabela.costa@email.com',
    cpf: '607.011.990-83',
    phone: '(91) 97777-8888',
    phoneType: 'mobile',
    createdAt: '2024-09-01',
  },
  {
    id: '10',
    name: 'Joao Pereira',
    email: 'joao.pereira@email.com',
    cpf: '862.883.667-57',
    phone: '(11) 4000-0000',
    phoneType: 'home',
    createdAt: '2024-10-12',
  },
];

@Injectable({ providedIn: 'root' })
export class UserService {
  private users: User[] = [...INITIAL_USERS];

  getAll(): Observable<User[]> {
    return of([...this.users]).pipe(delay(SIMULATED_LATENCY_MS));
  }

  getById(id: string): Observable<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      return throwError(() => new Error(`Usuário com id "${id}" não encontrado.`)).pipe(
        delay(SIMULATED_LATENCY_MS),
      );
    }
    return of({ ...user }).pipe(delay(SIMULATED_LATENCY_MS));
  }

  searchByName(query: string): Observable<User[]> {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return this.getAll();

    const results = this.users.filter((u) =>
      u.name.toLowerCase().includes(normalized),
    );
    return of([...results]).pipe(delay(SIMULATED_LATENCY_MS));
  }

  create(payload: CreateUserPayload): Observable<User> {
    const newUser: User = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.users = [...this.users, newUser];
    return of({ ...newUser }).pipe(delay(SIMULATED_LATENCY_MS));
  }

  update(payload: UpdateUserPayload): Observable<User> {
    const index = this.users.findIndex((u) => u.id === payload.id);
    if (index === -1) {
      return throwError(
        () => new Error(`Usuário com id "${payload.id}" não encontrado.`),
      ).pipe(delay(SIMULATED_LATENCY_MS));
    }
    const updated: User = { ...this.users[index], ...payload };
    this.users = [
      ...this.users.slice(0, index),
      updated,
      ...this.users.slice(index + 1),
    ];
    return of({ ...updated }).pipe(delay(SIMULATED_LATENCY_MS));
  }

  delete(id: string): Observable<void> {
    this.users = this.users.filter((u) => u.id !== id);
    return of(undefined).pipe(delay(SIMULATED_LATENCY_MS));
  }
}
