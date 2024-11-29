import { Component, OnInit } from '@angular/core';
import { UserBadgeComponent } from '../../user/user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmarkCircle } from '@fortawesome/free-regular-svg-icons';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-saved-posts-aside',
  standalone: true,
  imports: [UserBadgeComponent, FontAwesomeModule],
  templateUrl: './saved-posts-aside.component.html',
  styleUrl: './saved-posts-aside.component.css',
})
export class SavedPostsAsideComponent implements OnInit {
  constructor(private userService: UserService) {}
  faBookmark = faBookmark;
  faXmark = faXmarkCircle;
}
