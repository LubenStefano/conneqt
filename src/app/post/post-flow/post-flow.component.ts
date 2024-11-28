import { Component, OnInit } from '@angular/core';
import { UserBadgeComponent } from '../../user/user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Post } from '../../types/post';
import { PostService } from '../post.service';

import {
  faShareFromSquare,
  faComment,
  faHeart,
  faBookmark,
} from '@fortawesome/free-regular-svg-icons';

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

  posts: Post[] = [];
  user = "";

  constructor(private postService: PostService) {}

  ngOnInit() {
    // Fetch all posts
    this.postService.getPosts().subscribe((posts) => {
      this.posts = posts;
    });
  }
  
}
