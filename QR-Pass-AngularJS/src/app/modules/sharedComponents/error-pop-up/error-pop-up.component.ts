import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-error-pop-up',
  standalone: true,
  imports: [],
  templateUrl: './error-pop-up.component.html',
  styleUrl: './error-pop-up.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorPopUpComponent {

}
