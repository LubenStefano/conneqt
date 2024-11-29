import { Component, OnInit } from '@angular/core';
import { UserBadgeComponent } from '../../user/user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Post } from '../../types/post';
import { PostService } from '../post.service';
import { UserService } from '../../user/user.service';

import {
  faShareFromSquare,
  faComment,
  faHeart,
  faBookmark,
} from '@fortawesome/free-regular-svg-icons';
import { User } from '../../types/user';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-post-flow',
  standalone: true,
  imports: [UserBadgeComponent, FontAwesomeModule],
  templateUrl: './post-flow.component.html',
  styleUrl: './post-flow.component.css',
})
export class PostFlowComponent implements OnInit {
  faShare = faShareFromSquare;
  faComment = faComment;
  faHeart = faHeart;
  faBookmark = faBookmark;

  posts: (Post & User)[] = [];

  constructor(
    private postService: PostService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Fetch all posts
    this.postService.getPosts().subscribe((posts) => {
      console.log('Fetched posts:', posts); // Log posts
      const postsWithUserInfo$ = posts.map((post) =>
        this.userService.getUserByReference(post.creator).pipe(
          map((user) => ({
            ...post,
            username: user?.displayName || 'Unknown User',
            userPfp: user?.photoURL || 'default-profile-pic-url',
          }))
        )
      );

      // Combine all posts with user info
      combineLatest(postsWithUserInfo$).subscribe((postsWithUserInfo) => {
        this.posts = postsWithUserInfo;
        console.log('Posts with user info:', this.posts);
      });
    });
  }
}
