import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
  tap,
} from 'rxjs/operators';

import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { UserCardComponent } from '../../components/user-card/user-card.component';
import {
  UserFormDialogComponent,
  UserFormDialogData,
} from '../../components/user-form-dialog/user-form-dialog.component';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserStateService } from '../../state/user-state.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule,
    UserCardComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly userState = inject(UserStateService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly searchControl = new FormControl('', { nonNullable: true });

  protected readonly users = this.userState.paginatedUsers;
  protected readonly isLoading = this.userState.isLoading;
  protected readonly error = this.userState.error;
  protected readonly totalUsers = this.userState.totalUsers;
  protected readonly pageSize = this.userState.pageSize;
  protected readonly currentPage = this.userState.currentPage;

  protected readonly retryFn = () => this.loadAllUsers();

  constructor() {
    this.initSearchStream();
  }

  ngOnInit(): void {
    this.loadAllUsers();
  }

  private loadAllUsers(): void {
    this.userState.setLoading(true);
    this.userState.resetError();

    this.userService
      .getAll()
      .pipe(
        catchError((err: Error) => {
          this.userState.setError(err.message ?? 'Erro ao carregar usuarios.');
          return of([]);
        }),
      )
      .subscribe((users) => {
        if (!this.userState.error()) {
          this.userState.setUsers(users);
        }
      });
  }

  private initSearchStream(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.userState.setLoading(true)),
        switchMap((query) =>
          this.userService.searchByName(query).pipe(
            catchError((err: Error) => {
              this.userState.setError(err.message ?? 'Erro na pesquisa.');
              return of([]);
            }),
            finalize(() => this.userState.setLoading(false)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((users) => {
        this.userState.setUsers(users);
      });
  }

  protected onPageChange(event: PageEvent): void {
    this.userState.setPage(event.pageIndex + 1);
  }

  protected openCreateDialog(): void {
    const data: UserFormDialogData = {};
    this.dialog.open(UserFormDialogComponent, {
      width: '32.5rem',
      maxWidth: '95vw',
      data,
      disableClose: true,
    });
  }

  protected openEditDialog(user: User): void {
    const data: UserFormDialogData = { user };
    this.dialog.open(UserFormDialogComponent, {
      width: '32.5rem',
      maxWidth: '95vw',
      data,
      disableClose: true,
    });
  }

  protected trackByUserId(_index: number, user: User): string {
    return user.id;
  }
}
