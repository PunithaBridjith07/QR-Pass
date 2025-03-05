import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'QR-Pass-AngularJS';

  //  Properties
  protected loggedUser = signal<any>(null)

  //  Injections
  readonly router = inject(Router)

  //  LifeCycle Hooks
  constructor(readonly authService: AuthenticationService) { }

  ngOnInit(): void {}

  //  Private or Protected Methods


}
