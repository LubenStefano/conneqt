import { Component } from '@angular/core';
import { UserBadgeComponent } from '../user-badge/user-badge.component';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [UserBadgeComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

}
