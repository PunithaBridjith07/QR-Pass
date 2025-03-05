import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { isOfferApplicableExist, isDescriptionExist, SubscriptionOffer } from './subscription-offers.model';
import { PercentPipe } from '@angular/common';
import { v4 as uuidv4 } from 'uuid'
import { DatabaseService } from '../../../services/database.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subscription-offers',
  standalone: true,
  imports: [ReactiveFormsModule, PercentPipe],
  templateUrl: './subscription-offers.component.html',
  styleUrl: './subscription-offers.component.css'
})
export class AdminSideOffersComponent implements OnInit {

  //  Properties
  protected updateOffer = signal<any>({})
  readonly subscription_offer = signal<SubscriptionOffer[]>([])

  protected subscriptionOffersForm: FormGroup
  protected subscription!: Subscription

  ERROR = signal<string>('')
  isFormVisible = signal<boolean>(false)

  //  Injections
  readonly dbService = inject(DatabaseService);

  readonly http = inject(HttpClient);
  readonly router = inject(Router);
  readonly destroyRef = inject(DestroyRef)

  //  LifeCycle Hooks
  constructor(readonly fb: FormBuilder) {

    //  Offer Form Property
    this.subscriptionOffersForm = this.fb.group({
      offerPercent: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      offerApplicable: ['', [Validators.required, Validators.min(0)], [isOfferApplicableExist(this.http)]],
      description: ['', [Validators.required], [isDescriptionExist(this.http)]]
    });
  }

  ngOnInit() {
    this.getAllSubscriptionOffer()
  }

  //  Form Using Methods
  protected onAddOffer() {

    if (this.subscriptionOffersForm.valid) {
      const newSubscriptionOffer: SubscriptionOffer = {
        _id: `subscriptionoffer_2_${uuidv4()}`,
        data: {
          offerpercent: Number(this.subscriptionOffersForm.value.offerPercent),
          offerapplicable: Number(this.subscriptionOffersForm.value.offerApplicable),
          offercode: `OFFER${this.subscriptionOffersForm.value.offerApplicable}`,
          description: this.subscriptionOffersForm.value.description ?? '',
          offerusedusers: [],
          offerstatus: 1,
          type: "subscriptionoffer"
        }
      }
      this.subscription = this.dbService.createSubscriptionOffer(newSubscriptionOffer).subscribe({
        next: (response) => {
          this.getAllSubscriptionOffer()
        }, error: (error) => {
          console.log("Error on Adding offer...");
        },
        complete: () => {
          this.isFormVisible.set(false)
          this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
        }
      })
    }
  }

  protected onUpdateOfferDetails(_id: string) {
    this.triggerUpdate()
    this.setUpdateSubscriptionOfferForm(_id)
  }

  protected onUpdateOffer() {
    const updateData = {
      ...this.updateOffer(), data: {
        ...this.updateOffer().data,
        offerpercent: Number(this.subscriptionOffersForm.value.offerPercent),
        offerapplicable: Number(this.subscriptionOffersForm.value.offerApplicable),
        description: this.subscriptionOffersForm.value.description,
        offerstatus: 1
      }
    }
    if (updateData) {
      this.subscription = this.dbService.updateSubscriptionOffer(this.updateOffer()._id, updateData).subscribe({
        next: (response: any) => {
          this.getAllSubscriptionOffer()
          this.isFormVisible.set(false)
        },
        error: (error) => {
          this.ERROR.set("Error on Updating...!")
        },
        complete: () => {
          this.updateOffer.set({})
          this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
        }
      })
    }
  }

  onAddExistingSubscriptionOffer(_id: string) {
    this.subscription = this.dbService.getSubscriptionOffer(_id).subscribe({
      next: (response: any) => {
        const subscriptionOffer = response.rows[0].value;
        const updateData = {
          ...subscriptionOffer,
          data: {
            ...subscriptionOffer.data,
            offerstatus: 1
          }
        }
        if (updateData) {
          this.subscription = this.dbService.updateSubscriptionOffer(subscriptionOffer._id, updateData).subscribe({
            next: (response: any) => {
              this.getAllSubscriptionOffer()
            },
            error: (error) => {
              this.ERROR.set("Error on Updating...!")
            },
            complete: () => {
              this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
            }
          })
        }
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }

  protected onDeleteOffer(_id: string) {
    const existOffer: SubscriptionOffer = this.subscription_offer().find((offer: SubscriptionOffer) => offer._id === _id)!;
    const updatedOfferData: SubscriptionOffer = { ...existOffer, data: { ...existOffer.data, offerstatus: 0 } };
    this.subscription = this.dbService.updateSubscriptionOffer(_id, updatedOfferData).subscribe({
      next: (response) => {
        this.getAllSubscriptionOffer()
      },
      error: (error) => {
        console.log("Error on deleting Offer...");
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }

  triggerFormVisible() {
    this.updateOffer.set({})
    this.subscriptionOffersForm.patchValue({
      offerPercent: '',
      offerApplicable: '',
      description: '',
    })
    this.isFormVisible.set(true)
  }

  triggerUpdate() {
    this.isFormVisible.set(true)
  }
  triggerCancel() {
    this.updateOffer.set({})
    this.subscriptionOffersForm.patchValue({
      offerPercent: '',
      offerApplicable: '',
      description: '',
    })
    this.isFormVisible.set(false)
  }
  isEmptyObject(obj: any): boolean {
    return obj && Object.keys(obj).length === 0;
  }

  //  Get Methods
  get availableOffers() {
    return this.subscription_offer().filter((offer: SubscriptionOffer) => offer.data.offerstatus === 1)
  }

  get inActiveOffers() {
    return this.subscription_offer().filter((offer: SubscriptionOffer) => offer.data.offerstatus === 0)
  }

  //  Private or Protected Methods
  protected getAllSubscriptionOffer(_id?: string) {
    this.subscription = this.dbService.getSubscriptionOffer().subscribe({
      next: (response) => {
        this.subscription_offer.set(response.rows.map((offer: any) => offer.value))
      },
      error: (error) => {
        console.log("ERROR on get All Offers");
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }

  protected setUpdateSubscriptionOfferForm(_id: string) {
    this.subscription = this.dbService.getSubscriptionOffer(_id).subscribe({
      next: (response) => {
        this.updateOffer.set(response.rows[0].value);
        if (this.updateOffer()) {
          this.subscriptionOffersForm.patchValue({
            offerPercent: this.updateOffer().data.offerpercent,
            offerApplicable: this.updateOffer().data.offerapplicable,
            description: this.updateOffer().data.description
          })
        }
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }

}
