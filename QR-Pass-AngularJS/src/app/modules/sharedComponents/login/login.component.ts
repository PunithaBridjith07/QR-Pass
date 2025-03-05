import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { validateEmailIsUnique, validatePasswordIsValid } from '../register/register.model';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {

  //   Properties
  protected loginForm: FormGroup
  ERROR = signal<string>('')

  //  Injections
  readonly router = inject(Router);
  readonly http = inject(HttpClient);

  // LifeCycle hooks
  constructor(readonly authService: AuthenticationService, readonly fb: FormBuilder) {

    //  Login Form Properties
    this.loginForm = this.fb.group({
      email: ['',
        [Validators.required, Validators.email, Validators.pattern(/^[a-z0-9._%+-]+@gmail\.com$/)],
        [validateEmailIsUnique(this.http)]
      ],
      password: ['',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)],
        [validatePasswordIsValid(this.http, 'email')]
      ]
    });
  }

  //  Main Methods
  login() {
    this.ERROR.set('');
    if (this.loginForm.valid) {
      this.authService.validateUser(this.loginForm.value.email).subscribe({
        next: (response) => {
          const userLogged = response.rows[0].value;

          if (userLogged.data.type === "user") {
            localStorage.setItem('Logged', userLogged._id)
            this.router.navigate(['/', userLogged._id], { replaceUrl: true })
          } else if (userLogged.data.type === "admin") {
            localStorage.setItem('Logged', userLogged._id)
            this.router.navigate(['/admin'], { replaceUrl: true })
          }
        },
        error: (error) => {
          this.ERROR.set('Invalid! email or password')
        }
      })
    } else {
      this.ERROR.set('Invalid! email or password')
    }

    //  Private Methods
  }
}
