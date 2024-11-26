import { Component } from '@angular/core';
import { UserBadgeComponent } from '../main/user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faImage,
  faArrowAltCircleRight,
  faPlusSquare,
} from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-create-post-aside',
  standalone: true,
  imports: [UserBadgeComponent, FontAwesomeModule],
  templateUrl: './create-post-aside.component.html',
  styleUrl: './create-post-aside.component.css',
})
export class CreatePostAsideComponent {
  faImage = faImage;
  faArrow = faArrowAltCircleRight;
  faPlus = faPlusSquare;
}
