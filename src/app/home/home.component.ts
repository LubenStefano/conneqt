import { Component, OnInit } from '@angular/core';
import { CreatePostAsideComponent } from '../post/create-post-aside/create-post-aside.component';
import { SavedPostsAsideComponent } from '../post/saved-posts-aside/saved-posts-aside.component';
import { PostFlowComponent } from '../post/post-flow/post-flow.component';
import { UserService } from '../user/user.service';
import { Subscription, tap } from 'rxjs';
import { User } from '../types/user';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CreatePostAsideComponent,
    SavedPostsAsideComponent,
    PostFlowComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(private userService: UserService) {}
  
  user: User | null = null;
  isAuthenticated = false;

  private subscription = new Subscription();

  ngOnInit() {
    const userSub = this.userService.getUser().pipe(
      tap(user => {
        this.isAuthenticated = !!user;
        if (user) {
          this.user = {
            uid: user.uid,
            username: user.displayName || 'Unknown User',
            userPfp: user.photoURL || '',
            savedPosts: Array.isArray((user as any).savedPosts) ? (user as any).savedPosts : [],
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
            email: user.email || undefined
          };
        } else {
          this.user = null;
        }
      })
    ).subscribe();

    this.subscription.add(userSub);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}