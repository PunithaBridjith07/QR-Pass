import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../sharedComponents/header/header.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

}
