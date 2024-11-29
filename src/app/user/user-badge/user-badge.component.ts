import { Component, Input} from '@angular/core';


@Component({
  selector: 'app-user-badge',
  standalone: true,
  imports: [],
  templateUrl: './user-badge.component.html',
  styleUrls: ['./user-badge.component.css']
})
export class UserBadgeComponent {
  @Input() username: string = '';
  @Input() userPfp: string = '';
}
