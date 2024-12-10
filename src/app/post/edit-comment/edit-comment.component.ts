import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, NgForm } from '@angular/forms';
import { PostService } from '../post.service';
import { UserService } from '../../user/user.service';
import { Comment } from '../../types/comment';
import { UserBadgeComponent } from '../../shared/user-badge/user-badge.component';
import { switchMap, tap } from 'rxjs';
import { User } from '../../types/user';

@Component({
  selector: 'app-edit-comment',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule, UserBadgeComponent],
  templateUrl: './edit-comment.component.html',
  styleUrl: './edit-comment.component.css',
})
export class EditCommentComponent implements OnInit {
  comment: Comment | null = null;
  user: User | null = null;
  isSubmitting = false;
  private postId: string = '';
  private commentId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('postId') || '';
    this.commentId = this.route.snapshot.paramMap.get('commentId') || '';

    if (!this.postId || !this.commentId) {
      this.router.navigate(['/']);
      return;
    }

    // Load user and comment data
    this.userService
      .getUser()
      .pipe(
        tap((user) => {
          if (user) {
            this.user = {
              uid: user.uid,
              username: user.displayName || 'Unknown User',
              userPfp: user.photoURL || '',
              savedPosts: [],
              displayName: user.displayName || undefined,
              photoURL: user.photoURL || undefined,
              email: user.email || undefined,
            };
          }
        }),
        switchMap(() => this.postService.getComments(this.postId))
      )
      .subscribe({
        next: (comments) => {
          this.comment = comments.find((c) => c._id === this.commentId) || null;
          if (!this.comment) {
            this.router.navigate(['/post', this.postId]);
          }
        },
        error: (error) => {
          console.error('Error loading comment:', error);
          this.router.navigate(['/post', this.postId]);
        },
      });
  }

  updateComment(form: NgForm) {
    if (!form.valid || !this.comment || !this.postId || !this.commentId) return;

    this.isSubmitting = true;
    this.postService
      .updateComment(this.postId, this.commentId, form.value.content)
      .subscribe({
        next: () => {
          this.router.navigate(['/post', this.postId]);
        },
        error: (error) => {
          console.error('Error updating comment:', error);
          this.isSubmitting = false;
        },
      });
  }

  cancel() {
    this.router.navigate(['/post', this.postId]);
  }
}
