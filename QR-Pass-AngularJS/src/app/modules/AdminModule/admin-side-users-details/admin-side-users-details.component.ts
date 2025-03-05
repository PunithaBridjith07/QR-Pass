import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-side-users-details',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-side-users-details.component.html',
  styleUrl: './admin-side-users-details.component.css'
})
export class AdminSideUsersDetailsComponent {

  searchUser = signal('')

}
