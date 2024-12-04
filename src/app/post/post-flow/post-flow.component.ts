import { Component, OnInit } from '@angular/core';
import { UserBadgeComponent } from '../../user/user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Post } from '../../types/post';
import { PostService } from '../post.service';
import { UserService } from '../../user/user.service';
import { NgClass } from '@angular/common';
import {
  faPaperPlane,
  faComment,
  faHeart,
  faBookmark,
} from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid, faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons'; 
import { User } from '../../types/user';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-post-flow',
  standalone: true,
  imports: [UserBadgeComponent, FontAwesomeModule, NgClass],
  templateUrl: './post-flow.component.html',
  styleUrls: ['./post-flow.component.css'],
})
export class PostFlowComponent implements OnInit {
  // Icons
  faShare = faPaperPlane;
  faComment = faComment;
  faHeart = faHeart; 
  faHeartSolid = faHeartSolid; 
  faBookmark = faBookmark;
  faBookmarkSolid = faBookmarkSolid;

  likeBubbles: {[key: string]: boolean} = {};

  posts: (Post & User)[] = [];
  user: User | null = null;

  prevLikedState: boolean = false;
  prevSavedState: boolean = false;

  showCopyPopup = false;
  copiedPostId: string | null = null;

  constructor(
    private postService: PostService,
    private userService: UserService,
    private clipboard: Clipboard
  ) {}

  // ... existing properties ...
  isAuthenticated = false;

  ngOnInit() {
    // Split streams for user and posts
    const posts$ = this.postService.getPosts().pipe(
      switchMap(posts => {
        const postsWithUserInfo$ = posts.map(post =>
          this.userService.getUserByReference(post.creator).pipe(
            map(creator => ({
              ...post,
              uid: creator?.uid || 'unknown',
              username: creator?.displayName || 'Unknown User',
              userPfp: creator?.photoURL || 'default-profile-pic-url',
              savedPosts: creator?.savedPosts || [],
            }))
          )
        );
        return combineLatest(postsWithUserInfo$);
      })
    );

    const user$ = this.userService.getUser().pipe(
      tap(user => {
        this.isAuthenticated = !!user;
        if (user) {
          // Cast the Firebase user to our custom User interface with proper type checking
          const customUser: User = {
            uid: user.uid,
            username: user.displayName || 'Unknown User',
            userPfp: user.photoURL || '',
            savedPosts: Array.isArray((user as any).savedPosts) ? (user as any).savedPosts : [],
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
            email: user.email || undefined
          };
          this.user = customUser;
        } else {
          this.user = null;
        }
      })
    );

    // Combine streams
    combineLatest([posts$, user$]).subscribe({
      next: ([posts, _]) => {
        this.posts = posts;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.posts = [];
      }
    });
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
          this.posts = [...this.posts]; // Force change detection
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

    // Hide popup after 2 seconds
    setTimeout(() => {
      this.showCopyPopup = false;
      this.copiedPostId = null;
    }, 1000);
  }
}