import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { isExistDaysValid, isExistPlanPrice, SubscriptionPlan } from '../../AdminModule/subscription-plan/subscription-plan.model';
import { SubscriptionOffer } from '../../AdminModule/subscription-offers/subscription-offers.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule, PercentPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid'
import { Router } from '@angular/router';
import { SubscribedDetail } from '../organize-event/organize-event.model';
import { DatabaseService } from '../../../services/database.service';

@Component({
  selector: 'app-user-subscription',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PercentPipe],
  templateUrl: './user-subscription.component.html',
  styleUrl: './user-subscription.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSubscriptionComponent {

  //  LifeCycle Hooks
  constructor(readonly fb: FormBuilder) {
    //  Subscribe Form
    this.subscribeForm = fb.group({
      price: [{ value: '', disabled: true }, [Validators.required, Validators.min(1)], [isExistPlanPrice(this.http)]],
      daysValid: [{ value: '', disabled: true }, [Validators.required, Validators.min(1)], [isExistDaysValid(this.http)]],
      description: [{ value: '', disabled: true }, [Validators.required]],
      startDate: [{ value: '', disabled: true }, [Validators.required]],
      endDate: [{ value: '', disabled: true }, [Validators.required]]
    });

  }

  ngOnInit() {
    this.getSubscriptionPlan();
    this.getSubscriptionOffer()
    this.getAllEvents()
    this.setPublishedCounts(this.userId())
    this.isSubscribe()
  }

  //  Injections
  readonly dbService = inject(DatabaseService);

  readonly http = inject(HttpClient)
  readonly destroyRef = inject(DestroyRef)
  readonly router = inject(Router)

  //  Properties
  subscribeForm: FormGroup;
  subscription!: Subscription;

  userId = input.required<string>()   //  Using Routes URL

  protected subscriptionPlans = signal<SubscriptionPlan[]>([]);
  protected subscriptionOffers = signal<SubscriptionOffer[]>([]);
  protected payments = signal<any>([]);

  protected selectedSubscriptionPlan = signal<SubscriptionPlan | null>(null);
  protected selectedSubscriptionOffer = signal<SubscriptionOffer | null>(null)

  publishedCount = signal<number>(0)
  isSubscribed = signal<boolean>(false)
  organizedEvent = signal<Event[]>([])

  isFormVisible = signal<boolean>(false)
  isPaid = signal<boolean>(false)
  originalAmount = signal<number>(0)
  totalAmount = signal<number>(0)

  ERROR = signal<string>('')


  //  Form Manage Methods
  protected onPaySubscription() {
    let date = new Date();

    const selectedSubscriptionPlan = this.selectedSubscriptionPlan();
    const selectedSubscriptionOffer = this.selectedSubscriptionOffer();
    const subscribedData: SubscribedDetail = {
      _id: `subscribeddetail_2_${uuidv4()}`,
      data: {
        user: this.userId().split('_2_')[1],
        subscriptionplan: selectedSubscriptionPlan?._id.split('_2_')[1] ?? "",
        subscriptionoffer: selectedSubscriptionOffer?._id.split('_2_')[1] ?? "",
        startdate: this.subscribeForm.value.startDate,
        enddate: this.subscribeForm.value.endDate,
        daysvalid: selectedSubscriptionPlan?.data.daysvalid ?? 0,
        status: "active",
        type: "subscribeddetail"
      }
    };
    if (selectedSubscriptionOffer) {
      this.subscription = this.dbService.getSubscriptionOffer(selectedSubscriptionOffer?._id).subscribe({
        next: (response: any) => {
          const existOffer = response.rows[0]?.value;

          if (!existOffer.data.offerusedusers.includes(this.userId())) {
            const updatedData = {
              ...existOffer.data, offerusedusers: Array.isArray(existOffer.offerusedusers)
                ? [...existOffer.offerusedusers, this.userId()]
                : [this.userId()]
            };
            const data = { ...existOffer, data: updatedData }
            this.subscription = this.dbService.updateSubscriptionOffer(existOffer._id, data).subscribe({
              next: (response: any) => {
                this.getSubscriptionOffer();
              },
              complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe()),
            });
          }
        },
        complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe()),
      });
    }

    // POST on Subscribed Details
    this.subscription = this.dbService.addSubscribedDetail(subscribedData).subscribe({
      next: () => console.log("Added Subscribed detail"),
      error: (error) => {
        this.ERROR.set("Subscription Failed")
        console.log(this.ERROR());
      },
      complete: () => {
        this.isFormVisible.set(false);
        this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
      },
    });

    //  Published Payment Structure
    const paymentData = {
      _id: `payment_2_${uuidv4()}`,
      data: {
        user: this.userId().split('_2_')[1],
        subscribeddetail: subscribedData._id.split('_2_')[1],
        paid: this.totalAmount(),
        date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
        time: date.toTimeString().split(" ")[0],
        type: "publishedpayment"
      }
    };

    //  Add Payment Detail
    this.subscription = this.dbService.addPaymentDetail(paymentData).subscribe({
      next: () => {
        this.subscription = this.dbService.getUserById(this.userId()).subscribe({
          next: (response: any) => {
            const existUserData = response.rows[0]?.value;
            if (!existUserData) return;

            //  Email Payment Details
            const emailData = { to: existUserData.data.email, paid: paymentData.data.paid, date: paymentData.data.date, time: paymentData.data.time }
            this.subscription = this.dbService.onPaySubscription(emailData).subscribe({
              next: (response: any) => console.log(response.message),
            });
            this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
          },
          complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe()),
        });
      },
      complete: () => {
        // Payment Status
        this.subscribeForm.reset()
        this.selectedSubscriptionPlan.set(null)
        this.selectedSubscriptionOffer.set(null)
        setTimeout(() => {
          this.isPaid.set(true);
          setTimeout(() => {
            this.isPaid.set(false)
            this.router.navigate(['/', this.userId(), 'organize-events'])
          }, 3000);
        }, 50);
        this.destroyRef.onDestroy(() => this.subscription.unsubscribe());

      }
    });
  }

  protected onSelectSubscriptionPlan(_id: string) {
    // Function to format date as dd/mm/yyyy
    let startDate = new Date();
    let endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    this.subscribeForm.reset()
    const subscription = this.dbService.getSubscriptionPlan(_id).subscribe({
      next: (response: any) => {
        this.selectedSubscriptionPlan.set({ ...response.rows.map((subscriptionPlan: any) => subscriptionPlan.value)[0] })
        this.subscribeForm.patchValue({
          price: this.selectedSubscriptionPlan()?.data.price,
          daysValid: this.selectedSubscriptionPlan()?.data.daysvalid,
          description: this.selectedSubscriptionPlan()?.data.description,
          startDate: `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
          endDate: `${endDate.getDate()}/${endDate.getMonth() + 1}/${endDate.getFullYear()}`
        })
        this.originalAmount.set(Number(this.selectedSubscriptionPlan()?.data.price))
        this.totalAmount.set(this.originalAmount())
      },
      complete: () => {
        this.isFormVisible.set(true)
        this.destroyRef.onDestroy(() => subscription.unsubscribe())
      }
    })
  }

  protected onSelectSubscriptionOffer(_id: string) {
    this.subscription = this.dbService.getSubscriptionOffer(_id).subscribe({
      next: (response: any) => {
        const selectedOffer = response.rows[0]?.value;
        this.selectedSubscriptionOffer.set({ ...selectedOffer });
        const offerAmount = (this.originalAmount() * Number(selectedOffer.data.offerpercent)) / 100;
        const totalAmountWithOffer = this.originalAmount() - offerAmount;
        this.totalAmount.set(totalAmountWithOffer)
      },
      error: (error) => {
        console.log("Error on select Offer ", error);
      },
      complete: () => {
        this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
      }
    })

  }


  triggerCancel() {
    this.isFormVisible.set(false)
    this.selectedSubscriptionPlan.set(null)
    this.selectedSubscriptionOffer.set(null)
  }

  //  Couch Manage Methods
  protected getSubscriptionPlan(_id?: string) {
    this.subscription = this.dbService.getSubscriptionPlan(_id).subscribe({
      next: (response) => {
        if (_id) {
          const subscriptionPlan = response.rows.map((plan: any) => plan.value)[0];
          this.selectedSubscriptionPlan.set({ ...subscriptionPlan });
        } else {
          const subscriptionPlan = response.rows.map((plan: any) => plan.value);
          this.subscriptionPlans.set(subscriptionPlan);
        }
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
      }
    });
  }

  protected getSubscriptionOffer(_id?: string) {
    this.subscription = this.dbService.getSubscriptionOffer(_id).subscribe({
      next: (response) => {
        if (_id) {
          const subscriptionOffer = response.rows.map((offer: any) => offer.value)[0]
          this.selectedSubscriptionOffer.set({ ...subscriptionOffer })
        } else {
          const subscriptionOffer = response.rows.map((offer: any) => offer.value)
          this.subscriptionOffers.set(subscriptionOffer)
        }
      },
      error: (error) => {
        console.log("ERROR on get Offer");
      },
      complete: () => {
        this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
      }
    })
  }

  get applicableOffers() {
    const applicableOffers = this.subscriptionOffers().filter(offer =>
      !offer.data.offerusedusers.includes(this.userId()) &&
      offer.data.offerapplicable <= this.publishedCount()
    );
    return applicableOffers
  }

  protected getAllEvents() {
    this.subscription = this.dbService.getOrganizedEventDetail(this.userId()).subscribe({
      next: (response) => {
        const allEvent = response.rows.map((event: { value: Event }) => event.value)

        this.organizedEvent.set(allEvent);
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }

  protected setPublishedCounts(organizeId: string) {
    let count = this.organizedEvent().filter((payment: any) => `user_2_${payment.data.user}` === organizeId && payment.data.type === 'publishedpayment').length
    this.publishedCount.set(count < 1 ? 0 : count)
  }

  protected isSubscribe() {
    this.subscription = this.dbService.getSubscribedDetail("active").subscribe({
      next: (response: any) => {
        const subscribed = response.rows.map((subscribe: any) => subscribe.value).filter((subscribe: any) => `user_2_${subscribe.data.user}` === this.userId())
        console.log(subscribed);

        if (subscribed.length > 0) {
          this.isSubscribed.set(true)
        }
      },
      complete: () => {
        this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
      }
    })
  }
}
