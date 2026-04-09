import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { signal, computed } from '@angular/core';

import { UserService } from '../../services/user.service';
import { UserStateService } from '../../state/user-state.service';
import { UserCardComponent } from '../../components/user-card/user-card.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { User } from '../../models/user.model';
import { UserListComponent } from './user-list.component';

function makeUser(id: string, name: string): User {
  return {
    id,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
    cpf: '529.982.247-25',
    phone: '(11) 91234-5678',
    phoneType: 'mobile',
    createdAt: '2024-01-01',
  };
}

function createUserStateStub(users: User[] = []) {
  const usersSignal = signal(users);
  const loadingSignal = signal(false);
  const errorSignal = signal<string | null>(null);
  const pageSignal = signal(1);
  const pageSizeSignal = signal(8);

  return {
    paginatedUsers: computed(() => usersSignal()),
    isLoading: computed(() => loadingSignal()),
    error: computed(() => errorSignal()),
    totalUsers: computed(() => usersSignal().length),
    currentPage: computed(() => pageSignal()),
    pageSize: computed(() => pageSizeSignal()),
    setLoading: (v: boolean) => loadingSignal.set(v),
    setError: (msg: string) => errorSignal.set(msg),
    setUsers: (u: User[]) => usersSignal.set(u),
    setPage: (p: number) => pageSignal.set(p),
    resetError: () => errorSignal.set(null),
    addUser: () => {},
    updateUser: () => {},
  };
}

describe('UserListComponent', () => {
  let fixture: ComponentFixture<UserListComponent>;
  let component: UserListComponent;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let userStateStub: ReturnType<typeof createUserStateStub>;

  const sampleUsers = [
    makeUser('1', 'Ana Souza'),
    makeUser('2', 'Bruno Costa'),
  ];

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'getAll',
      'searchByName',
    ]);
    mockUserService.getAll.and.returnValue(of(sampleUsers));
    mockUserService.searchByName.and.returnValue(of(sampleUsers));

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    userStateStub = createUserStateStub();

    await TestBed.configureTestingModule({
      imports: [
        UserListComponent,
        UserCardComponent,
        LoadingSpinnerComponent,
        ErrorMessageComponent,
        ReactiveFormsModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatPaginatorModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: UserStateService, useValue: userStateStub },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAll on init', () => {
    expect(mockUserService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should open create dialog when add button is clicked', () => {
    component['openCreateDialog']();
    expect(mockDialog.open).toHaveBeenCalledTimes(1);
  });

  it('should open edit dialog with user data when edit is triggered', () => {
    const user = sampleUsers[0];
    component['openEditDialog'](user);
    expect(mockDialog.open).toHaveBeenCalledTimes(1);
    const callArgs = mockDialog.open.calls.mostRecent().args;
    expect(callArgs[1]?.data).toEqual({ user });
  });

  it('should debounce search and call searchByName', fakeAsync(() => {
    component['searchControl'].setValue('ana');
    tick(300);
    expect(mockUserService.searchByName).toHaveBeenCalledWith('ana');
  }));

  it('should not trigger search before debounce expires', fakeAsync(() => {
    component['searchControl'].setValue('bru');
    tick(100);
    expect(mockUserService.searchByName).not.toHaveBeenCalled();
    tick(200);
    expect(mockUserService.searchByName).toHaveBeenCalledTimes(1);
  }));

  it('trackByUserId should return the user id', () => {
    const user = sampleUsers[0];
    expect(component['trackByUserId'](0, user)).toBe(user.id);
  });

  it('should set error state when getAll fails', fakeAsync(() => {
    mockUserService.getAll.and.returnValue(
      throwError(() => new Error('Falha na API')),
    );

    component['loadAllUsers']();
    tick(0);

    expect(userStateStub.error()).toBe('Falha na API');
  }));
});
