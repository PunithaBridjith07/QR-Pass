import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'header [appHeader]',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {

  //  LifeCycle Hooks
  constructor(readonly dbService: DatabaseService) { }

  ngOnInit(): void {
    this.getLoggedUserDetails()
  }

  //  Properties
  protected subscription!: Subscription
  protected loggedUser = signal<any>(undefined)

  //  Injections

  readonly router = inject(Router)
  readonly destroyRef = inject(DestroyRef)

  //  Private or Protected Methods
  protected getLoggedUserDetails() {
    const userLoggedId = localStorage.getItem("Logged")!
    this.subscription = this.dbService.getUserById(userLoggedId).subscribe({
      next: (response) => {

        if (response.rows.length > 0) {
          this.loggedUser.set(response.rows[0].value);
        }
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe)
    })
  }

  protected onLogOut() {
    localStorage.removeItem("Logged");
    this.router.navigate(['/'], { replaceUrl: true })
    location.reload()
  }
}
