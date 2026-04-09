import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrapper" role="status" aria-label="Carregando...">
      <mat-spinner diameter="48" />
    </div>
  `,
  styles: [`
    .wrapper {
      display: flex;
      justify-content: center;
      padding: 4rem 0;
    }
  `],
})
export class LoadingSpinnerComponent {}
