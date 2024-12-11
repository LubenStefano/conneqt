import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Post } from '../../types/post';
import { PostService } from '../post.service';
import { UserService } from '../../user/user.service';
import { User } from '../../types/user';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { PostBoxComponent } from '../../shared/post-box/post-box.component';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-post-flow',
  standalone: true,
  imports: [FontAwesomeModule, PostBoxComponent, NgClass, RouterLink],
  templateUrl: './post-flow.component.html',
  styleUrls: ['./post-flow.component.css'],
})
export class PostFlowComponent implements OnInit {
  likeBubbles: { [key: string]: boolean } = {};

  posts: (Post & User)[] = [];
  user: User | null = null;

  prevLikedState: boolean = false;
  prevSavedState: boolean = false;

  showCopyPopup = false;
  copiedPostId: string | null = null;

  loading = true;

  constructor(
    private postService: PostService,
    private userService: UserService,
    private clipboard: Clipboard
  ) {}

  isAuthenticated = false;

  ngOnInit() {
    const posts$ = this.postService.getPosts().pipe(
      switchMap((posts) => {
        const postsWithUserInfo$ = posts.map((post) =>
          this.userService.getUserByReference(post.creator).pipe(
            map((creator) => ({
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
      tap((user) => {
        this.isAuthenticated = !!user;
        if (user) {
          const customUser: User = {
            uid: user.uid,
            username: user.displayName || 'Unknown User',
            userPfp: user.photoURL || '',
            savedPosts: Array.isArray((user as any).savedPosts)
              ? (user as any).savedPosts
              : [],
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
            email: user.email || undefined,
          };
          this.user = customUser;
        } else {
          this.user = null;
        }
      })
    );

    combineLatest([posts$, user$]).subscribe({
      next: ([posts, _]) => {
        this.posts = posts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.posts = [];
        this.loading = false;
      },
    });
  }

  likePost(id: string) {
    if (!this.isAuthenticated || !this.user) {
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
          this.posts = [...this.posts];
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
    const baseUrl = window.location.href.replace('/home', '');
    const url = `${baseUrl}/post/${postId}`;
    this.clipboard.copy(url);

    this.copiedPostId = postId;
    this.showCopyPopup = true;

    setTimeout(() => {
      this.showCopyPopup = false;
      this.copiedPostId = null;
    }, 1000);
  }
}
