import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrapper" role="alert">
      <mat-icon>error_outline</mat-icon>
      <p>{{ message() }}</p>
      @if (retryFn()) {
        <button mat-stroked-button color="warn" (click)="retryFn()!()">
          Tentar novamente
        </button>
      }
    </div>
  `,
  styles: [`
    .wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 4rem 1.5rem;
      color: #c62828;
      text-align: center;
    }

    mat-icon {
      font-size: 3.5rem;
      width: 3.5rem;
      height: 3.5rem;
      opacity: 0.7;
    }

    p {
      margin: 0;
      font-size: 1rem;
    }
  `],
})
export class ErrorMessageComponent {
  readonly message = input.required<string>();
  readonly retryFn = input<(() => void) | null>(null);
}
