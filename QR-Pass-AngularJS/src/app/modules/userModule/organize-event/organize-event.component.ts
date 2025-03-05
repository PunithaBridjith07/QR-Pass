import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Districts, districts, Event, indianStates, isArtistAvailable, isVenueAvailable, offerPercentValid, Seat, State, SubscribedDetail } from './organize-event.model';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid'
import { CurrencyPipe, DatePipe, PercentPipe, TitleCasePipe } from '@angular/common';
import { DatabaseService } from '../../../services/database.service';


@Component({
  selector: 'app-organize-event',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, PercentPipe, TitleCasePipe],
  templateUrl: './organize-event.component.html',
  styleUrl: './organize-event.component.css'
})

export class OrganizeEventComponent implements OnInit {

  //  LifeCycle Hooks
  constructor(readonly http: HttpClient, readonly fb: FormBuilder) {
    this.eventForm = this.fb.group({
      eventName: ['', [Validators.required]],
      artist: ['', [Validators.required]],
      seats: [0, [Validators.required]],
      price: [0, [Validators.required]],
      offerApplicable: [0, [Validators.required, Validators.min(0)]],
      offerPercent: [
        { value: 0, disabled: true },
        [Validators.required, Validators.min(1), offerPercentValid('offerApplicable')]
      ],
      date: ['', [Validators.required]],
      time: ['', [Validators.required], [isVenueAvailable(this.http, 'date', 'time', this.isEmptyObject(this.editEvent()))]],
      venue: ['', [Validators.required]],
      image: [null],
      state: ['TamilNadu', [Validators.required]],
      district: [{ value: '', disabled: true }, [Validators.required]],
      locationViaMap: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });

  }

  ngOnInit(): void {

    this.getEventByOrganizedId(this.userId().split('_2_')[1])
    this.setSubscribedDetail("active")

    // **Enable or Disable offerPercent based on offerApplicable**
    this.eventForm.get('offerApplicable')?.valueChanges.subscribe(value => {
      const offerPercentControl = this.eventForm.get('offerPercent');
      if (value > 0) {
        offerPercentControl?.enable();
      } else {
        offerPercentControl?.disable();
        offerPercentControl?.setValue(0); // Reset value when disabled
      }
    });

    const date = new Date()
    this.currentDate.set(`${date.getFullYear()}-${(date.getMonth() + 1) <= 9 ? ('0' + (date.getMonth() + 1).toString()) : date.getMonth() + 1}-${date.getDate()}`)
  }

  //  Injections
  readonly dbService = inject(DatabaseService);
  readonly destroyRef = inject(DestroyRef)

  //  Properties
  userId = input.required<string>()

  protected subscription!: Subscription
  protected eventForm: FormGroup

  protected organizedEvents = signal<Event[]>([])
  protected subscribedDetail = signal<SubscribedDetail | null>(null)
  isSubscribed = signal<boolean>(false)
  selectedImage = signal<File | null>(null)
  protected imagePath = signal<string>('')

  states = signal<State[]>(indianStates)
  districts = signal<Districts>(districts)

  editEvent = signal<Event | null>(null)
  isFormVisible = signal<boolean>(false)
  currentDate = signal<string>('')


  popUpMessage = signal<string>('')
  ERROR = signal<string>('')

  //  Form Using Methods

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.selectedImage.set(file);
    if (file) { // Ensure file is not null
    } else {
      console.error('No file selected');
    }
  }

  onCreateEvent() {
    console.log(this.eventForm);

    if (this.eventForm.valid) {
      const eventId = `event_2_${uuidv4()}`
      const formData = new FormData()
      const selectedImage = this.selectedImage()
      if (selectedImage) {
        formData.append('image', selectedImage)
        this.subscription = this.dbService.onStoreEventImage(this.userId(), eventId, formData).subscribe({
          next: (response: any) => {
            this.imagePath.set(response.eventImage);
            if (this.imagePath()) {
              //  Convert upload image to Path
              const data: Event = {
                _id: eventId,
                data: {
                  eventname: this.eventForm.value.eventName,
                  artist: this.eventForm.value.artist,
                  date: this.eventForm.value.date,
                  time: this.eventForm.value.time,
                  seats: Number(this.eventForm.value.seats),
                  price: Number(this.eventForm.value.price),
                  venue: this.eventForm.value.venue,
                  state: this.eventForm.value.state,
                  district: this.eventForm.value.district,
                  locationviamap: this.eventForm.value.locationViaMap,
                  offerapplicable: Number(this.eventForm.value.offerApplicable) || 0,
                  offerpercent: Number(this.eventForm.value.offerPercent) || 0,
                  description: this.eventForm.value.description,
                  imageurl: this.imagePath(),
                  user: this.userId().split('_2_')[1],
                  createdat: new Date(),
                  type: "event"
                }
              }

              this.subscription = this.dbService.createEvent(data).subscribe({
                next: (response) => {
                  if (response.ok) {
                    const seats: Seat = this.onSeatGeneration(data._id, data.data.seats)
                    this.subscription = this.dbService.createEventSeatDetail(seats).subscribe({
                      next: (response) => {
                        if (response.ok) {
                          this.getEventByOrganizedId(this.userId().split('_2_')[1])
                        }
                      },
                      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
                    })
                  }
                },
                complete: () => {
                  this.isFormVisible.set(false);
                  this.selectedImage.set(null)
                  this.imagePath.set('');
                  this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
                }
              })
            }

          },
          complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
        })
      }
    }
  }

  /* **********************Important to validate update time********************* */
  private updateAsyncValidators(editEventId: string) {
    this.eventForm.get('time')?.setAsyncValidators(
      isArtistAvailable(this.http, 'artist', 'date', editEventId)
    );
    this.eventForm.get('time')?.updateValueAndValidity();
  }

  onUpdateOrganizedEvent() {
    if (this.eventForm.valid) {
      const editEvent = this.editEvent()
      if (editEvent) {
        const updatedData: Event = {
          ...editEvent,
          data: {
            ...editEvent.data,
            artist: this.eventForm.value.artist,
            date: this.eventForm.value.date,
            time: this.eventForm.value.time,
            seats: this.eventForm.value.seats,
            description: this.eventForm.value.description,
            imageurl: this.imagePath(),
          }
        }
        this.subscription = this.dbService.updateEvent(editEvent._id, updatedData).subscribe({
          next: (response) => {
            this.getEventByOrganizedId(`user_2_${editEvent.data.user}`);
          },
          complete: () => {
            this.editEvent.set(null)
            this.isFormVisible.set(false)
            this.imagePath.set('')
            this.eventForm.reset()
            this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
          }
        })
      }
    }
  }

  // onOfferPercentDisable() {

  // }

  triggerFormVisible() {
    this.editEvent.set(null)
    this.eventForm.reset()
    this.eventForm.get('eventName')?.enable()
    this.eventForm.get('price')?.enable()
    this.eventForm.get('offerApplicable')?.enable()
    this.eventForm.get('offerPercent')?.enable()
    this.eventForm.get('venue')?.enable()
    this.eventForm.get('image')?.enable()
    this.eventForm.get('state')?.enable()
    this.eventForm.get('district')?.enable()
    this.eventForm.get('locationViaMap')?.enable()
    this.isFormVisible.set(true)
  }

  triggerUpdate(_id: string) {
    this.eventForm.get('eventName')?.disable()
    this.eventForm.get('price')?.disable()
    this.eventForm.get('offerApplicable')?.disable()
    this.eventForm.get('offerPercent')?.disable()
    this.eventForm.get('venue')?.disable()
    this.eventForm.get('image')?.disable()
    this.eventForm.get('state')?.disable()
    this.eventForm.get('district')?.disable()
    this.eventForm.get('locationViaMap')?.disable()
    this.onSetEventForm(_id)
  }

  triggerCancel() {
    this.eventForm.reset()
    this.editEvent.set(null)
    this.isFormVisible.set(false)
  }
  isEmptyObject(obj: any): boolean {
    return obj === null;
  }

  get fromCurrentDate() {
    const minDate: string = new Date().toISOString().split('T')[0];
    return minDate;
  }

  //  Private or Protected Methods
  protected getEventByOrganizedId(OrganizedId: string) {
    const subscription: Subscription = this.dbService.getOrganizedEventDetail(OrganizedId).subscribe({
      next: (response) => {
        if (response.rows) {
          this.organizedEvents.set(response.rows.map((organizedEvent: any) => organizedEvent.value))
        }
        console.log(this.organizedEvents());

      },
      error: (error) => {
        console.error(error);
      },
      complete: () => this.destroyRef.onDestroy(() => subscription.unsubscribe())
    })
  }

  protected setSubscribedDetail(status: string) {
    const subscription: Subscription = this.dbService.getSubscribedDetail(status).subscribe({
      next: (response) => {
        const subscribedDetail = response.rows.map((subscribed: any) => subscribed.value).filter((subscribed: SubscribedDetail) => `user_2_${subscribed.data.user}` === this.userId())

        if (subscribedDetail.length > 0) {
          this.subscribedDetail.set(subscribedDetail[0])
          this.isSubscribed.set(true)
        }

        const checkSubscribedDetail = this.subscribedDetail()

        if (checkSubscribedDetail !== null) {

          if (!this.checkSubscription(checkSubscribedDetail.data.startdate, checkSubscribedDetail.data.enddate)) {
            const updatedData = {
              ...checkSubscribedDetail, data: { ...checkSubscribedDetail?.data, status: "expired" }
            }
            this.isSubscribed.set(false)
            this.subscribedDetail.set(null)
            console.log(updatedData);

            const subscription: Subscription = this.dbService.updateSubscribedDetail(checkSubscribedDetail._id, updatedData).subscribe({
              next: (response) => {
                this.popUpMessage.set("Subscription Expired!")
              },
              complete: () => this.destroyRef.onDestroy(() => subscription.unsubscribe())
            })
          }
        }
      },
      complete: () => this.destroyRef.onDestroy(() => subscription.unsubscribe())
    })
  }

  //  Check subscription status on every call of Component
  protected checkSubscription(startDate: string, endDate: string): boolean {
    const parseDate = (dateStr: string): Date => {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    };


    const currentDate = new Date();
    const start = parseDate(startDate);
    const end = parseDate(endDate);


    return currentDate >= start && currentDate <= end;
  }

  //  Generate Seat Data
  private onSeatGeneration(eventId: string, noOfSeats: number): Seat {
    const seat: Seat = {
      _id: `seat_2_${uuidv4()}`,
      data: {
        event: eventId.split('_2_')[1],
        type: "seat",
        seats:{}
      }
    };

    for (let i = 1; i <= noOfSeats; i++) {
      seat.data.seats[`s${i}`] = 'available';
    }

    return seat
  }


  protected onSetEventForm(_id: string) {
    this.subscription = this.dbService.getEventDetail(_id).subscribe({
      next: (response) => {
        this.editEvent.set(response.rows[0].value);
        const editEvent = this.editEvent()
        if (editEvent) {
          this.eventForm.patchValue({
            eventName: editEvent.data.eventname,
            artist: editEvent.data.artist,
            date: editEvent.data.date,
            time: editEvent.data.time,
            seats: editEvent.data.seats,
            price: editEvent.data.price,
            venue: editEvent.data.venue,
            state: editEvent.data.state,
            district: editEvent.data.district,
            locationViaMap: editEvent.data.locationviamap,
            offerApplicable: editEvent.data.offerapplicable,
            offerPercent: editEvent.data.offerpercent,
            description: editEvent.data.description
          })
          this.imagePath.set(editEvent.data.imageurl);
          this.updateAsyncValidators(editEvent._id)
        }
      },
      complete: () => {
        this.isFormVisible.set(true)
        this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
      }
    })
  }
}
