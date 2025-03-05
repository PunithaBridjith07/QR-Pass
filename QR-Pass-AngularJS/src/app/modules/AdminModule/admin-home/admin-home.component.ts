import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../sharedComponents/header/header.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [RouterLinkActive, RouterOutlet, RouterLink,HeaderComponent],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminHomeComponent {

}
