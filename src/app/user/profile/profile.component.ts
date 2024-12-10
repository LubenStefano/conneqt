import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { UserBadgeComponent } from '../../shared/user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserService } from '../user.service';
import { PostService } from '../../post/post.service';
import { Post } from '../../types/post';
import { User } from '../../types/user';
import { FlowHighlightDirective } from './flow-option-highlight.directive';
import { Subscription, switchMap, tap, of, Observable, map, forkJoin } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostBoxComponent } from '../../shared/post-box/post-box.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    UserBadgeComponent,
    FontAwesomeModule,
    FlowHighlightDirective,
    RouterLink,
    PostBoxComponent,
    CommonModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  activePopupId: string | null = null;
  showOptionsMenu = false;

  userId!: string;
  routeSub!: Subscription;

  likeBubbles: { [key: string]: boolean } = {};

  posts: (Post & User)[] = [];
  user: User | null = null;
  userPfp = '';
  username = '';
  isAuthenticated = false;
  prevLikedState = false;
  prevSavedState = false;
  flow = 'posts';
  isLoading = true;
  isEmpty = false;

  userProfile = false;

  private subscription = new Subscription();

  showCopyPopup = false;
  copiedPostId: string | null = null;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private clipboard: Clipboard,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.resetUserProfile();
      this.resetFlow();
      this.loadUserData();
    });
  }

  loadUserData() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      console.error('User ID is null');
      return;
    }
  
    const user$ = this.userService.getUserById(userId).pipe(
      tap((user) => {
        this.isAuthenticated = !!user;
        if (user) {
          this.user = {
            uid: user.uid,
            username: user.displayName || 'Unknown User',
            userPfp: user.photoURL || '',
            savedPosts: Array.isArray((user as any).savedPosts)
              ? (user as any).savedPosts
              : [],
          };
          this.username = this.user.username;
          this.userPfp = this.user.userPfp;
          this.userService.getUser().subscribe((currentUser) => {
            if (this.user?.uid === currentUser?.uid) {
              this.userProfile = true;
            }
          });
        } else {
          this.user = null;
          this.isEmpty = true;
        }
      }),
      switchMap((user) => {
        if (!user) return of([]);
        this.isLoading = true;
        this.isEmpty = false;
  
        const posts$ =
          this.flow === 'posts'
            ? this.postService.getPostsByUser(user.uid)
            : this.postService.getSavedPosts(this.user?.savedPosts || []);
  
        return posts$.pipe(
          switchMap((posts) => {
            const updatedPosts$ = posts.map((post) =>
              this.getUserData(post.uid).pipe(
                map((userData) => ({
                  ...post,
                  username: userData?.username || 'Unknown User',
                  userPfp: userData?.userPfp || '',
                  savedPosts: userData?.savedPosts || [],
                  userId: userData?.uid || '',
                }))
              )
            );
            return updatedPosts$.length
              ? forkJoin(updatedPosts$)
              : of([]);
          })
        );
      })
    );
  
    this.subscription.add(
      user$.subscribe({
        next: (posts) => {
          this.posts = posts;
          this.isLoading = false;
          this.isEmpty = posts.length === 0;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.posts = [];
          this.isLoading = false;
          this.isEmpty = true;
          this.cdr.detectChanges();
        },
      })
    );
  }
  

  postFlow() {
    this.flow = 'posts';
    this.loadUserData(); // Refresh posts
  }

  postSaved() {
    this.flow = 'saved';
    this.loadUserData(); // Refresh posts
  }

  likePost(id: string) {
    if (!this.isAuthenticated || !this.user) {
      console.log('Please login to like posts');
      return;
    }

    const post = this.posts.find((p) => p._id === id);
    if (!post) return;

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
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error liking post:', error),
    });
  }

  savePost(postId: string) {
    if (!this.isAuthenticated || !this.user) {
      console.log('Please login to save posts');
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
            if (this.flow === 'saved') {
              this.posts = this.posts.filter((post) => post._id !== postId);
            }
          } else {
            this.user.savedPosts = [...(this.user.savedPosts || []), postId];
          }
          this.cdr.detectChanges();
        }
      },
      error: (error) => console.error('Error saving/unsaving post:', error),
    });
  }

  isLiked(post: Post): boolean {
    if (!this.isAuthenticated || !this.user) return false;
    return post.likes?.includes(this.user.uid) ?? false;
  }

  isSaved(postId: string): boolean {
    if (!this.isAuthenticated || !this.user) return false;
    return this.user.savedPosts?.includes(postId) ?? false;
  }

  sharePost(postId: string) {
    const baseUrl = window.location.href.replace(/\/profile\/.*$/, '');
    const url = `${baseUrl}/post/${postId}`;
    this.clipboard.copy(url);
    
    // Show popup for specific post
    this.copiedPostId = postId;
    this.showCopyPopup = true;

    // Hide popup after 2 seconds
    setTimeout(() => {
      this.showCopyPopup = false;
      this.copiedPostId = null;
    }, 1000);
  }

  getUserData(userId: string): Observable<User | null> {
    return this.userService.getUserById(userId).pipe(
      map((user) =>
        user
          ? {
              uid: user.uid,
              username: user.displayName || 'Unknown User',
              userPfp: user.photoURL || '',
              savedPosts: Array.isArray((user as any).savedPosts)
                ? (user as any).savedPosts
                : [],
            }
          : null
      )
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Check if click is outside options menu
    const target = event.target as HTMLElement;
    if (!target.closest('.options-menu') && !target.closest('#faEllipsisH')) {
      this.closeOptionsMenu();
    }
  }

  toggleOptionsMenu(postId: string, event: Event) {
    event.stopPropagation();
    this.activePopupId = this.activePopupId === postId ? null : postId;
    this.cdr.detectChanges();
  }

  closeOptionsMenu() {
    this.activePopupId = null;
    this.cdr.detectChanges();
  }

  editPost(postId: string) {
    console.log('Edit post:', postId);
    this.closeOptionsMenu();
  }

  deletePost(postId: string) {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter((post) => post._id !== postId);
        this.closeOptionsMenu();
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error deleting post:', error),
    });
  }

  resetUserProfile() {
    this.userProfile = false;
  }

  resetFlow() {
    this.flow = 'posts';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}