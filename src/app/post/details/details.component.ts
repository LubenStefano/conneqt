import { Component, HostListener, OnInit } from '@angular/core';
import { UserBadgeComponent } from '../../shared/user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Post } from '../../types/post';
import { PostService } from '../post.service';
import { UserService } from '../../user/user.service';
import {
  faArrowAltCircleRight,
  faPenToSquare,
  faTrashCan,
} from '@fortawesome/free-regular-svg-icons';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../types/user';
import { map, switchMap, tap } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Comment } from '../../types/comment';
import { PostBoxComponent } from '../../shared/post-box/post-box.component';
import { ErrorHandlerService } from '../../error/error-handling.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    UserBadgeComponent,
    FontAwesomeModule,
    FormsModule,
    RouterLink,
    PostBoxComponent,
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  faArrow = faArrowAltCircleRight;
  faEllipsisH = faEllipsisH;
  faPenToSquare = faPenToSquare;
  faTrash = faTrashCan;

  likeBubbles: { [key: string]: boolean } = {};

  post: (Post & User) | null = null;
  user: User | null = null;
  comments: Comment[] = [];

  prevLikedState: boolean = false;
  prevSavedState: boolean = false;

  showCopyPopup = false;
  copiedPostId: string | null = null;

  activePopupId: string | null = null;
  showOptionsMenu = false;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private userService: UserService,
    private errorHandler: ErrorHandlerService
  ) { }

  isAuthenticated = false;
  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');

    if (!postId) {
      console.error('Post ID is null or undefined');
      return;
    }

    const post$ = this.postService.getPostById(postId).pipe(
      switchMap((post) =>
        this.userService.getUserByReference(post.creator).pipe(
          map((user) => ({
            ...post,
            _id: post._id,
            username: user.displayName || 'Unknown User', // Add these fields
            userPfp: user.photoURL || '', // Add these fields
            displayName: user.displayName,
            photoURL: user.photoURL,
            uid: user.uid,
            savedPosts: user.savedPosts || [],
          }))
        )
      )
    );

    this.userService
      .getUser()
      .pipe(
        tap((user) => {
          this.isAuthenticated = !!user;
          this.user = user
            ? {
              uid: user.uid,
              username: user.displayName || 'Unknown User',
              userPfp: user.photoURL || '',
              savedPosts: Array.isArray((user as any).savedPosts)
                ? (user as any).savedPosts
                : [],
              displayName: user.displayName || undefined,
              photoURL: user.photoURL || undefined,
              email: user.email || undefined,
            }
            : null;
        }),
        switchMap(() => post$)
      )
      .subscribe({
        next: (post) => {
          this.post = post;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.post = null;
        },
      });

    const comments$ = this.postService.getComments(postId);

    comments$.subscribe({
      next: (comments: Comment[]) => {
        this.comments = comments; // Correctly typed as Comment[]
      },
      error: (error: any) => {
        console.error('Error loading comments:', error);
        this.comments = []; // Handle error case and set empty array
      },
    });
  }
  likePost(id: string) {
    if (!this.isAuthenticated || !this.user) {
      return;
    }

    const post = this.post;
    if (!post || !post.likes) return;

    this.prevLikedState = this.isLiked(post);
    if (!this.prevLikedState) {
      this.likeBubbles[id] = true;
    }

    this.postService.likePost(id, this.user.uid).subscribe({
      next: () => {
        if (this.prevLikedState) {
          post.likes = post.likes.filter((uid) => uid !== this.user!.uid);
        } else {
          post.likes = post.likes || [];
          post.likes.push(this.user!.uid);
          setTimeout(() => {
            this.likeBubbles[id] = false;
          }, 800);
        }
      },
      error: (error) => console.error('Error liking post:', error),
    });
  }

  savePost(postId: string) {
    if (!this.isAuthenticated || !this.user) {
      return;
    }

    const isSaved = this.isSaved(postId);
    this.prevSavedState = isSaved;

    const saveAction$ = isSaved
      ? this.userService.unsavePost(this.user.uid, postId)
      : this.userService.savePost(this.user.uid, postId);

    saveAction$.subscribe({
      next: () => {
        if (this.user) {
          if (isSaved) {
            this.user.savedPosts = this.user.savedPosts.filter(
              (id) => id !== postId
            );
          } else {
            this.user.savedPosts = [...(this.user.savedPosts || []), postId];
          }
        }
      },
      error: (error) => console.error('Error saving/unsaving post:', error),
    });
  }

  isLiked(post: Post | null): boolean {
    if (!this.isAuthenticated || !this.user || !post || !post.likes)
      return false;
    return post.likes.includes(this.user.uid);
  }
  isSaved(postId: string): boolean {
    if (!this.isAuthenticated || !this.user) return false;
    return this.user.savedPosts?.includes(postId) ?? false;
  }

  deletePost(postId: string) {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        if (this.post && this.post._id === postId) {
          this.post = null;
        }
        this.closeOptionsMenu();
      },
      error: (error) => console.error('Error deleting post:', error),
    });
  }

  sharePost(postId: string) {
    const url = `${window.location.href}`; // Generate the full link
    navigator.clipboard
      .writeText(url)
      .then(() => {
        this.copiedPostId = postId;
        this.showCopyPopup = true;

        setTimeout(() => {
          this.showCopyPopup = false;
          this.copiedPostId = null;
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  }
  comment(form: NgForm) {
    const postId = this.post?._id;
    const content = form.value.commentContent;
    const userId = this.user?.uid;
    const userPfp = this.user?.userPfp;
    const displayName = this.user?.displayName;

    if (!postId) {
      console.error('Post ID is null or undefined');
      return;
    }
    if (!this.isAuthenticated || !this.user) {
      this.errorHandler.showError('Please login to comment');
      return;
    }
    if (!userId || !userPfp) {
      console.error('User ID or User Profile Picture is null or undefined');
      return;
    }
    if (!content) {
      this.errorHandler.showError('Comment content required');
      return;
    }
    if (!displayName) {
      console.error('Display Name is null or undefined');
      return;
    }

    this.postService
      .addComment(postId, content, userId, displayName, userPfp)
      .subscribe({
        next: (comment) => {
          form.resetForm();
        },
        error: (error) => this.errorHandler.showError(error),
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.options-menu') && !target.closest('#faEllipsisH')) {
      this.closeOptionsMenu();
    }
  }

  toggleOptionsMenu(commentId: string, event: Event) {
    event.stopPropagation();
    this.activePopupId = this.activePopupId === commentId ? null : commentId;
  }

  closeOptionsMenu() {
    this.activePopupId = null;
  }

  deleteComment(postId: string, commentId: string) {
    this.postService.deleteComment(postId, commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(
          (comment) => comment._id !== commentId
        );
        this.closeOptionsMenu();
      },
      error: (error) => console.error('Error deleting comment:', error),
    });
  }
}
