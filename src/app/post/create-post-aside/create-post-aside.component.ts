import { Component, OnInit } from '@angular/core';
import { UserBadgeComponent } from '../../user/user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faImage,
  faArrowAltCircleRight,
  faPlusSquare,
} from '@fortawesome/free-regular-svg-icons';
import { UserService } from '../../user/user.service';
import { FormsModule, NgForm } from '@angular/forms';
import { PostService } from '../post.service';


@Component({
  selector: 'app-create-post-aside',
  standalone: true,
  imports: [UserBadgeComponent, FontAwesomeModule, FormsModule],
  templateUrl: './create-post-aside.component.html',
  styleUrl: './create-post-aside.component.css',
})
export class CreatePostAsideComponent implements OnInit {
  faImage = faImage;
  faArrow = faArrowAltCircleRight;
  faPlus = faPlusSquare;
}