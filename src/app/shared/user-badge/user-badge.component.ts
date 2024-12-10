import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-badge',
  standalone: true,
  imports: [],
  templateUrl: './user-badge.component.html',
  styleUrls: ['./user-badge.component.css'],
})
export class UserBadgeComponent {
  @Input() username: string = '';
  @Input() userPfp: string = '';
  @Input() uid: string = '';

  constructor(private router: Router) {}

  goToProfile() {
    this.router.navigate(['/profile', this.uid]);
  }
}
