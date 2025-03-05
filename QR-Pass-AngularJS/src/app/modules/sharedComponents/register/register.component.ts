import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { emailIsUnique, equalPassword } from './register.model';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid'
import { ErrorPopUpComponent } from '../error-pop-up/error-pop-up.component';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, ErrorPopUpComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {

  // Properties
  protected userRegisterForm: FormGroup
  ERROR = signal<string>('')

  // Package Injections
  readonly router = inject(Router)
  readonly http = inject(HttpClient);

  //hooks Methods
  constructor(readonly authService: AuthenticationService, readonly fb: FormBuilder) {

    // Organizer Form Properties
    this.userRegisterForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Z][a-z]*(?:\s[A-Z][a-z]*)*$/)]],
      email: ['',
        [Validators.required, Validators.email, Validators.pattern(/^[a-z0-9._%+-]+@gmail\.com$/)],
        [emailIsUnique(this.http)] // Async validator
      ],
      passwords: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
      }, { validators: [equalPassword('password', 'confirmPassword')] }),
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]],
    });
  }

  // Form Methods
  register() {
    this.ERROR.set('');

    if (this.userRegisterForm.valid && !this.userRegisterForm.controls['email']?.errors?.['emailExist']) {
      const data: any = {
        _id: `user_2_${uuidv4()}`,
        data: {
          username: this.userRegisterForm.controls['name'].value.toLowerCase(),
          email: this.userRegisterForm.controls['email'].value,
          password: this.userRegisterForm.get('passwords.password')?.value,
          phonenumber: this.userRegisterForm.controls['phoneNumber'].value,
          createdat: new Date(),
          type: 'user'
        }
      }

      this.authService.createUser(data).subscribe({
        next: (response: any) => {
          this.router.navigate(['/login'], { replaceUrl: true })
        },
        error: (error) => {
          this.ERROR.set("Registration Failed")
        },
        complete: () => {
          if (!this.ERROR()) {
            this.userRegisterForm.reset();
          }
          this.ERROR.set('')
        }
      })
    } else {
      this.ERROR.set("Registration Invalid!")
    }
  }

}
