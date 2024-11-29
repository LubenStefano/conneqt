import { Component, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { UserService } from '../user.service';
import { PostService } from '../../post/post.service';
import { Post } from '../../types/post';
import { UserBadgeComponent } from '../user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faShareFromSquare,
  faComment,
  faHeart,
  faBookmark,
} from '@fortawesome/free-regular-svg-icons';
import { FlowHighlightDirective } from './flow-option-highlight.directive';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [UserBadgeComponent, FontAwesomeModule, FlowHighlightDirective],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  constructor(private userService: UserService, private postService: PostService) {}
  
  faShare = faShareFromSquare;
  faComment = faComment;
  faHeart = faHeart;
  faBookmark = faBookmark;

  user: User | null = null; // Holds the logged-in user data
  posts: Post[] = []; // Holds the user's posts
  username = '';
  userPfp = '';
  flow = 'posts';

  postFlow(){
    this.flow = 'posts';
  }
  postSaved(){
    this.flow = 'saved';
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.userService.getUser().subscribe({
      next: (user) => {
        this.user = user;
        this.username = user?.displayName || '';
        this.userPfp = user?.photoURL!;

        if (user) {
          this.loadUserPosts(user.uid);
        }
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      },
    });
  }

  loadUserPosts(userId: string): void {
    this.postService.getPostsByUser(userId).subscribe({
      next: (posts) => {
        this.posts = posts;
        console.log('User posts:', this.posts);
      },
      error: (err) => {
        console.error('Error fetching posts:', err);
      },
    });
  }
}
