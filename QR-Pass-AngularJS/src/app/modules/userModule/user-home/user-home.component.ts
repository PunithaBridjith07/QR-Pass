import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HeaderComponent } from '../../sharedComponents/header/header.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [HeaderComponent, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserHomeComponent {

  //  Properties
  userId = input.required<string>()
}
