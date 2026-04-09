import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { UserService } from '../../services/user.service';
import { UserStateService } from '../../state/user-state.service';
import { User } from '../../models/user.model';
import { UserFormDialogComponent, UserFormDialogData } from './user-form-dialog.component';

const VALID_CPF = '529.982.247-25';
const VALID_PHONE = '(11) 91234-5678';

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: '1',
    name: 'Usuario Existente',
    email: 'usuario@email.com',
    cpf: VALID_CPF,
    phone: VALID_PHONE,
    phoneType: 'mobile',
    createdAt: '2024-01-01',
    ...overrides,
  };
}

describe('UserFormDialogComponent — create mode', () => {
  let fixture: ComponentFixture<UserFormDialogComponent>;
  let component: UserFormDialogComponent;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<UserFormDialogComponent>>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockUserState: jasmine.SpyObj<UserStateService>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockUserService = jasmine.createSpyObj('UserService', ['create', 'update']);
    mockUserState = jasmine.createSpyObj('UserStateService', ['addUser', 'updateUser']);

    const data: UserFormDialogData = {};

    await TestBed.configureTestingModule({
      imports: [
        UserFormDialogComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: UserService, useValue: mockUserService },
        { provide: UserStateService, useValue: mockUserState },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in create mode', () => {
    expect(component['isEditMode']).toBeFalse();
  });

  it('should have an invalid form when empty', () => {
    expect(component['form'].invalid).toBeTrue();
  });

  it('should have a valid form when all required fields are correctly filled', () => {
    component['form'].setValue({
      name: 'Maria Silva',
      email: 'maria@email.com',
      cpf: VALID_CPF,
      phone: VALID_PHONE,
      phoneType: 'mobile',
    });
    expect(component['form'].valid).toBeTrue();
  });

  it('should mark email as invalid when format is wrong', () => {
    component['form'].get('email')!.setValue('not-an-email');
    component['form'].get('email')!.markAsTouched();
    expect(component['form'].get('email')!.hasError('email')).toBeTrue();
  });

  it('should mark CPF as invalid when digits are wrong', () => {
    component['form'].get('cpf')!.setValue('111.111.111-11');
    component['form'].get('cpf')!.markAsTouched();
    expect(component['form'].get('cpf')!.hasError('invalidCpf')).toBeTrue();
  });

  it('should call userService.create and close dialog on successful submit', fakeAsync(() => {
    const createdUser = createMockUser({ id: 'new-id', name: 'Novo Usuario' });
    mockUserService.create.and.returnValue(of(createdUser));

    component['form'].setValue({
      name: 'Novo Usuario',
      email: 'novo@email.com',
      cpf: VALID_CPF,
      phone: VALID_PHONE,
      phoneType: 'mobile',
    });

    component['onSubmit']();
    tick(1000);

    expect(mockUserService.create).toHaveBeenCalledTimes(1);
    expect(mockUserState.addUser).toHaveBeenCalledWith(createdUser);
    expect(mockDialogRef.close).toHaveBeenCalledWith(createdUser);
  }));

  it('should not call service when form is invalid', () => {
    component['onSubmit']();
    expect(mockUserService.create).not.toHaveBeenCalled();
  });

  it('should close dialog without saving on cancel', () => {
    component['onCancel']();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
    expect(mockUserService.create).not.toHaveBeenCalled();
  });
});

describe('UserFormDialogComponent — edit mode', () => {
  let fixture: ComponentFixture<UserFormDialogComponent>;
  let component: UserFormDialogComponent;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<UserFormDialogComponent>>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockUserState: jasmine.SpyObj<UserStateService>;

  const existingUser = createMockUser();

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockUserService = jasmine.createSpyObj('UserService', ['create', 'update']);
    mockUserState = jasmine.createSpyObj('UserStateService', ['addUser', 'updateUser']);

    const data: UserFormDialogData = { user: existingUser };

    await TestBed.configureTestingModule({
      imports: [
        UserFormDialogComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: UserService, useValue: mockUserService },
        { provide: UserStateService, useValue: mockUserState },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize in edit mode', () => {
    expect(component['isEditMode']).toBeTrue();
  });

  it('should pre-fill the form with existing user data', () => {
    expect(component['form'].get('name')!.value).toBe(existingUser.name);
    expect(component['form'].get('email')!.value).toBe(existingUser.email);
    expect(component['form'].get('cpf')!.value).toBe(existingUser.cpf);
  });

  it('should call userService.update on submit and update state', fakeAsync(() => {
    const updatedUser = createMockUser({ name: 'Nome Atualizado' });
    mockUserService.update.and.returnValue(of(updatedUser));

    component['form'].get('name')!.setValue('Nome Atualizado');
    component['onSubmit']();
    tick(1000);

    expect(mockUserService.update).toHaveBeenCalledTimes(1);
    expect(mockUserState.updateUser).toHaveBeenCalledWith(updatedUser);
    expect(mockDialogRef.close).toHaveBeenCalledWith(updatedUser);
  }));
});
