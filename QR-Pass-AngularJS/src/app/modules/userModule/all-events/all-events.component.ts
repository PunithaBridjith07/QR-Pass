import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { EventData } from '../organize-event/organize-event.model';
import { CurrencyPipe, DatePipe, PercentPipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of, Subscription } from 'rxjs';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'app-all-events',
  standalone: true,
  imports: [TitleCasePipe, PercentPipe, DatePipe, CurrencyPipe],
  templateUrl: './all-events.component.html',
  styleUrl: './all-events.component.css'
})
export class AllEventsComponent implements OnInit {

  //  LifeCycle Hooks
  constructor() { }

  ngOnInit(): void {
    this.getAllEvents()
  }

  //  Injections
  readonly dbService = inject(DatabaseService);

  readonly router = inject(Router)
  readonly destroyRef = inject(DestroyRef)

  //  Properties
  userId = input.required<string>()
  user = signal<string>('')

  protected subscription!: Subscription

  allEvents = signal<EventData[]>([])
  selectEvent = signal<boolean>(false)

  //  Card Methods
  set concatUserId(uuid: string) {
    this.user.set(`user_2_${uuid}`)
  }

  onSelectEventCard(eventId: string) {
    this.router.navigate(['/', this.userId(), 'event', eventId])
  }

  //  Protected Methods
  protected getAllEvents() {
    this.subscription = this.dbService.getSubscribedDetail("active").pipe(
      map((response) => response.rows.map((subscribed: any) => subscribed.value.data.user))
    ).subscribe({
      next: (subscribedUsers) => {
        const eventRequests = subscribedUsers.map((user: string) =>
          this.dbService.getOrganizedEventDetail(user).pipe(
            map((response: any) => response.rows.map((event: any) => event.value)),
            catchError(() => of([])) // Ensure errors don't break the entire flow
          )
        );
        forkJoin(eventRequests).subscribe({
          next: (events: any) => {
            this.allEvents.set(events.flat());

          },
          // complete: () => this.subscription.unsubscribe()
        });
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    });
  }

}
