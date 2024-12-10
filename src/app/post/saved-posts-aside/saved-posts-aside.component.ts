import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserBadgeComponent } from '../../shared/user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmarkCircle } from '@fortawesome/free-regular-svg-icons';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../user/user.service';
import { PostService } from '../post.service';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Post } from '../../types/post';
import { User } from '../../types/user';
import { of, Subscription } from 'rxjs';

@Component({
  selector: 'app-saved-posts-aside',
  standalone: true,
  imports: [UserBadgeComponent, FontAwesomeModule, RouterLink],
  templateUrl: './saved-posts-aside.component.html',
  styleUrl: './saved-posts-aside.component.css',
})
export class SavedPostsAsideComponent implements OnInit, OnDestroy {
  faBookmark = faBookmark;
  faXmark = faXmarkCircle;
  savedPosts: Post[] = [];
  isLoading = true;
  currentUser: User | null = null;

  private subscriptions = new Subscription();

  constructor(
    private userService: UserService,
    private postService: PostService
  ) {}

  ngOnInit() {
    const userSub = this.userService
      .getUser()
      .pipe(
        switchMap((firebaseUser) => {
          if (firebaseUser) {
            this.currentUser = {
              uid: firebaseUser.uid,
              username: firebaseUser.displayName || 'Unknown User',
              userPfp: firebaseUser.photoURL || '',
              savedPosts: (firebaseUser as any).savedPosts || [],
              displayName: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined,
              email: firebaseUser.email || undefined,
              createdAt: (firebaseUser as any).createdAt,
            };

            return this.postService.getSavedPosts(this.currentUser.savedPosts);
          }
          return of([]);
        })
      )
      .subscribe({
        next: (posts) => {
          this.savedPosts = posts;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching saved posts:', error);
          this.isLoading = false;
        },
      });

    this.subscriptions.add(userSub);
  }

  unsavePost(postId: string) {
    if (!this.currentUser?.uid) return;

    const unsaveSub = this.userService
      .unsavePost(this.currentUser.uid, postId)
      .subscribe({
        next: () => {
          this.savedPosts = this.savedPosts.filter(
            (post) => post._id !== postId
          );
          if (this.currentUser) {
            this.currentUser.savedPosts = this.currentUser.savedPosts.filter(
              (id) => id !== postId
            );
          }
        },
        error: (error) => console.error('Error unsaving post:', error),
      });

    this.subscriptions.add(unsaveSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
