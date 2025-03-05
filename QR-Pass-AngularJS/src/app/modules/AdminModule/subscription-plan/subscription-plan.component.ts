import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { isExistPlanPrice, isExistDaysValid } from './subscription-plan.model';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { v4 as uuidv4 } from 'uuid'
import { DatabaseService } from '../../../services/database.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-side-pricing',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './subscription-plan.component.html',
  styleUrl: './subscription-plan.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSidePricingComponent implements OnInit {

  //  Lifecycle Hooks
  constructor(readonly fb: FormBuilder) {

    //  Pricing Form Property
    this.subscriptionForm = this.fb.group({
      price: ['', [Validators.required, Validators.min(1)], [isExistPlanPrice(this.http)]],
      daysValid: ['', [Validators.required, Validators.min(1)], [isExistDaysValid(this.http)]],
      description: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getAllSubscriptionPlan()
  }

  //  Properties
  protected subscriptionForm: FormGroup
  protected subscription!: Subscription

  private subscriptionPlans = signal<any>([])
  protected updatePricingPlan = signal<any>({})

  ERROR = signal<string>('')
  isFormVisible = signal<boolean>(false)

  //  Injections
  readonly dbService = inject(DatabaseService);

  readonly http = inject(HttpClient);
  readonly router = inject(Router);
  readonly destroyRef = inject(DestroyRef)

  //  Form using Methods
  onAddSubscriptionPricingPlan() {
    if (this.subscriptionForm.valid) {

      const data = {
        _id: `subscriptionplan_2_${uuidv4()}`,
        data: {
          price: Number(this.subscriptionForm.value.price),
          daysvalid: Number(this.subscriptionForm.value.daysValid),
          description: this.subscriptionForm.value.description,
          planstatus: 1,
          type: "subscriptionplan"
        }
      }
      this.subscription = this.dbService.createSubscriptionPlan(data).subscribe({
        next: (response) => {
          this.getAllSubscriptionPlan()
        },
        error: (error) => {
          this.ERROR.set('error on add plan!')
        },
        complete: () => {
          this.isFormVisible.set(false)
          this.subscriptionForm.reset()
          this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
        }
      })
    }
  }

  onUpdateSubscriptionPricingPlan() {
    const updateData = {
      ...this.updatePricingPlan(),
      data: {
        ...this.updatePricingPlan().data,
        price: Number(this.subscriptionForm.value.price),
        daysvalid: Number(this.subscriptionForm.value.daysValid),
        description: this.subscriptionForm.value.description,
      }
    }
    if (updateData) {
      this.subscription = this.dbService.updateSubscriptionPlan(this.updatePricingPlan()._id, updateData).subscribe({
        next: (response: any) => {
          this.getAllSubscriptionPlan()
          this.isFormVisible.set(false)
        },
        error: (error) => {
          this.ERROR.set("Error on Updating...!")
        },
        complete: () => {
          this.updatePricingPlan.set({})
          this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
        }
      })
    }
  }

  onAddExistSubscriptionPlan(_id: string) {
    this.subscription = this.dbService.getSubscriptionPlan(_id).subscribe({
      next: (response: any) => {
        const subscriptionPlan = response.rows[0].value;
        const updateData = {
          ...subscriptionPlan,
          data: {
            ...subscriptionPlan.data,
            planstatus: 1
          }
        }
        if (updateData) {
          this.subscription = this.dbService.updateSubscriptionPlan(subscriptionPlan._id, updateData).subscribe({
            next: (response: any) => {
              this.getAllSubscriptionPlan()
            },
            error: (error) => {
              this.ERROR.set("Error on Updating...!")
            },
            complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
          })
        }
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }

  onUpdateSubscriptionPlanDetails(_id: string) {
    this.triggerUpdate()
    this.setUpdateSubscriptionForm(_id);
  }

  onDeleteSubscriptionPlan(_id: string) {
    this.subscription = this.dbService.getSubscriptionPlan(_id).subscribe({
      next: (response: any) => {

        const updatedData = { ...response.rows[0].value.data, planstatus: 0 };
        const data = { _id: _id, _rev: response.rows[0].value._rev, data: updatedData };

        this.subscription = this.dbService.updateSubscriptionPlan(_id, data).subscribe({
          next: (response) => {
            if (response.ok) {
              this.getAllSubscriptionPlan()
            }
          },
          error: (error) => {
            console.error(error);

          },
          complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
        })
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    });
  }

  triggerFormVisible() {
    this.updatePricingPlan.set({})
    this.subscriptionForm.patchValue({
      price: '',
      daysValid: '',
      description: ''
    })
    this.isFormVisible.set(true)
  }

  triggerUpdate() {
    this.isFormVisible.set(true)
  }
  triggerCancel() {
    this.updatePricingPlan.set({})
    this.subscriptionForm.patchValue({
      price: '',
      daysValid: '',
      description: ''
    })
    this.isFormVisible.set(false)
  }
  isEmptyObject(obj: any): boolean {
    return obj && Object.keys(obj).length === 0;
  }

  //  Get Method
  get activeSubscriptionPlan() {
    return this.subscriptionPlans().filter((plan: any) => plan.data.planstatus === 1)
  }
  get inActiveSubscriptionPlan() {
    return this.subscriptionPlans().filter((plan: any) => plan.data.planstatus === 0)
  }


  //  Private methods
  private getAllSubscriptionPlan() {
    this.subscription = this.dbService.getSubscriptionPlan().subscribe({
      next: (response) => {

        const subscriptionPlan = response.rows.map((plan: any) => plan.value)
        this.subscriptionPlans.set(subscriptionPlan);

        console.log("Subscription List ", this.subscriptionPlans());
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }

  private setUpdateSubscriptionForm(_id: string) {
    this.subscription = this.dbService.getSubscriptionPlan(_id).subscribe({
      next: (response) => {
        this.updatePricingPlan.set(response.rows[0].value);
        if (this.updatePricingPlan()) {
          this.subscriptionForm.patchValue({
            price: this.updatePricingPlan()?.data.price ?? 0,
            daysValid: this.updatePricingPlan()?.data.daysValid ?? 0,
            description: this.updatePricingPlan()?.data.description ?? '',
          });
        }
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }
}
