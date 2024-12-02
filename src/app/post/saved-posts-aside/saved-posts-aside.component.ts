import { Component, OnInit } from '@angular/core';
import { UserBadgeComponent } from '../../user/user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmarkCircle } from '@fortawesome/free-regular-svg-icons';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../user/user.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-saved-posts-aside',
  standalone: true,
  imports: [UserBadgeComponent, FontAwesomeModule, RouterLink],
  templateUrl: './saved-posts-aside.component.html',
  styleUrl: './saved-posts-aside.component.css',
})
export class SavedPostsAsideComponent implements OnInit {
  constructor(private userService: UserService) {}
  faBookmark = faBookmark;
  faXmark = faXmarkCircle;
  username = '';
  userPfp = '';

  ngOnInit() {
    this.userService.getUser().subscribe((user) => {
      this.username = user?.displayName || '';
      this.userPfp = user?.photoURL!;
    });
  }
}
