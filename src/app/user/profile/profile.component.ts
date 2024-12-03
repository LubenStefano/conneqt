import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserBadgeComponent } from '../user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPaperPlane,
  faComment,
  faHeart,
  faBookmark,
} from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid, faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons'; 
import { UserService } from '../user.service';
import { PostService } from '../../post/post.service';
import { Post } from '../../types/post';
import { User } from '../../types/user';
import { FlowHighlightDirective } from './flow-option-highlight.directive';
import {Subscription, switchMap, tap, map, of } from 'rxjs';
import { NgClass } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [UserBadgeComponent, FontAwesomeModule, FlowHighlightDirective, NgClass],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  // Icons
  faShare = faPaperPlane;
  faComment = faComment;
  faHeart = faHeart; 
  faHeartSolid = faHeartSolid; 
  faBookmark = faBookmark;
  faBookmarkSolid = faBookmarkSolid;

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

  private subscription = new Subscription();

  showCopyPopup = false;
  copiedPostId: string | null = null;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private clipboard: Clipboard
  ) {}

  ngOnInit() {
    const user$ = this.userService.getUser().pipe(
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
          this.username = this.user.username;
          this.userPfp = this.user.userPfp;
        } else {
          this.user = null;
          this.isEmpty = true;
        }
      }),
      switchMap(user => {
        if (!user) return of([]);
        this.isLoading = true;
        this.isEmpty = false;
        return this.flow === 'posts' 
          ? this.postService.getPostsByUser(user.uid)
          : this.postService.getSavedPosts(this.user?.savedPosts || []);
      })
    );

    this.subscription.add(
      user$.subscribe({
        next: (posts) => {
          this.posts = posts.map(post => ({ 
            ...post, 
            ...this.user!, 
            createdAt: new Date(post.createdAt) 
          }));
          this.isLoading = false;
          this.isEmpty = posts.length === 0;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.posts = [];
          this.isLoading = false;
          this.isEmpty = true;
        }
      })
    );
  }

  postFlow() {
    this.flow = 'posts';
    this.ngOnInit(); // Refresh posts
  }

  postSaved() {
    this.flow = 'saved';
    this.ngOnInit(); // Refresh posts
  }

  likePost(id: string) {
    if (!this.isAuthenticated || !this.user) {
      console.log('Please login to like posts');
      return;
    }

    const post = this.posts.find((p) => p._id === id);
    if (!post) return;

    this.prevLikedState = this.isLiked(post);

    this.postService.likePost(id, this.user.uid).subscribe({
      next: () => {
        if (this.prevLikedState) {
          post.likes = post.likes.filter((uid) => uid !== this.user!.uid);
        } else {
          post.likes = post.likes || [];
          post.likes.push(this.user!.uid);
        }
      },
      error: (error) => console.error('Error liking post:', error)
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
            this.user.savedPosts = this.user.savedPosts.filter(id => id !== postId);
          } else {
            this.user.savedPosts = [...(this.user.savedPosts || []), postId];
          }
          this.posts = [...this.posts];
        }
      },
      error: (error) => console.error('Error saving/unsaving post:', error)
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
    const url = `${window.location.origin}/post/${postId}`;
    this.clipboard.copy(url);
    
    // Show popup for specific post
    this.copiedPostId = postId;
    this.showCopyPopup = true;

    setTimeout(() => {
      this.showCopyPopup = false;
      this.copiedPostId = null;
    }, 1000);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}