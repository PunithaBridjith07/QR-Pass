import { Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { RegisterComponent } from './modules/sharedComponents/register/register.component';
import { LoginComponent } from './modules/sharedComponents/login/login.component';
import { AdminHomeComponent } from './modules/AdminModule/admin-home/admin-home.component';
import { UserHomeComponent } from './modules/userModule/user-home/user-home.component';
import { AdminSideUsersDetailsComponent } from './modules/AdminModule/admin-side-users-details/admin-side-users-details.component';
import { AdminSidePricingComponent } from './modules/AdminModule/subscription-plan/subscription-plan.component';
import { AdminSideEventDetailsComponent } from './modules/AdminModule/admin-side-event-details/admin-side-event-details.component';
import { AdminSideOffersComponent } from './modules/AdminModule/subscription-offers/subscription-offers.component';
import { OrganizeEventComponent } from './modules/userModule/organize-event/organize-event.component';
import { UserSubscriptionComponent } from './modules/userModule/user-subscription/user-subscription.component';
import { AllEventsComponent } from './modules/userModule/all-events/all-events.component';
import { EventComponent } from './modules/userModule/event/event.component';
import { BookingComponent } from './modules/userModule/booking/booking.component';

export const routes: Routes = [
    {
        path: '', component: HomeComponent
    },
    {
        path: 'register', component: RegisterComponent
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'admin',
        component: AdminHomeComponent,
        children: [
            { path: '', redirectTo: 'event-list', pathMatch: 'full' },
            { path: 'event-list', component: AdminSideEventDetailsComponent },
            { path: 'user-list', component: AdminSideUsersDetailsComponent },
            { path: 'pricing', component: AdminSidePricingComponent },
            { path: 'offer', component: AdminSideOffersComponent }
        ]
    },
    {
        path: ':userId',
        component: UserHomeComponent,
        children: [
            { path: '', redirectTo: 'all-event', pathMatch: 'full' },
            { path: 'all-event', component: AllEventsComponent },
            { path: 'event/:eventId', component: EventComponent },
            { path: 'event/booking/:seats', component: BookingComponent },
            { path: 'organize-events', component: OrganizeEventComponent },
            { path: 'subscription', component: UserSubscriptionComponent },
        ]
    }

];
