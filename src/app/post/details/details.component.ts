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
import {
  faHeart as faHeartSolid,
  faBookmark as faBookmarkSolid,
} from '@fortawesome/free-solid-svg-icons';
import { User } from '../../types/user';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [UserBadgeComponent, FontAwesomeModule, NgClass],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  faShare = faPaperPlane;
  faComment = faComment;
  faHeart = faHeart;
  faHeartSolid = faHeartSolid;
  faBookmark = faBookmark;
  faBookmarkSolid = faBookmarkSolid;

  likeBubbles: { [key: string]: boolean } = {};

  post: (Post & User) | null = null;
  user: User | null = null;

  prevLikedState: boolean = false;
  prevSavedState: boolean = false;

  showCopyPopup = false;
  copiedPostId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private userService: UserService,
    private clipboard: Clipboard
  ) {}

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
          ...user,
        }))
      )
    )
  );

  this.userService.getUser().pipe(
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
  ).subscribe({
    next: (post) => {
      this.post = post;
      console.log('Post loaded:', this.post);
    },
    error: (error) => {
      console.error('Error loading data:', error);
      this.post = null;
    },
  });
}
  likePost(id: string) {
    console.log('Like post:', id);
    
    if (!this.isAuthenticated || !this.user) {
      console.log('Please login to like posts');
      return;
    }
  
    const post = this.post; // Използваме текущия пост
    if (!post || !post.likes) return;
  
    this.prevLikedState = this.isLiked(post);
    if (!this.prevLikedState) {
      this.likeBubbles[id] = true; // Анимация за лайк
    }
  
    this.postService.likePost(id, this.user.uid).subscribe({
      next: () => {
        if (this.prevLikedState) {
          // Премахваме лайка, ако е бил наличен
          post.likes = post.likes.filter((uid) => uid !== this.user!.uid);
        } else {
          // Добавяме лайка
          post.likes = post.likes || [];
          post.likes.push(this.user!.uid);
          setTimeout(() => {
            this.likeBubbles[id] = false; // Спиране на анимацията
          }, 800);
        }
      },
      error: (error) => console.error('Error liking post:', error),
    });
  }

  savePost(postId: string) {
    if (!this.isAuthenticated || !this.user) {
      console.log('Please login to save posts');
      return;
    }
  
    const isSaved = this.isSaved(postId); // Проверка дали е запазен
    this.prevSavedState = isSaved;
  
    const saveAction$ = isSaved
      ? this.userService.unsavePost(this.user.uid, postId) // Премахване на запазен пост
      : this.userService.savePost(this.user.uid, postId); // Запазване на поста
  
    saveAction$.subscribe({
      next: () => {
        if (this.user) {
          if (isSaved) {
            // Ако е бил запазен, го премахваме от списъка
            this.user.savedPosts = this.user.savedPosts.filter(
              (id) => id !== postId
            );
          } else {
            // Добавяме към списъка на запазените
            this.user.savedPosts = [...(this.user.savedPosts || []), postId];
          }
        }
      },
      error: (error) => console.error('Error saving/unsaving post:', error),
    });
  }

  isLiked(post: Post | null): boolean {
    if (!this.isAuthenticated || !this.user || !post || !post.likes) return false;
    return post.likes.includes(this.user.uid);
  }
  isSaved(postId: string): boolean {
    if (!this.isAuthenticated || !this.user) return false;
    return this.user.savedPosts?.includes(postId) ?? false; // Проверка дали постът е запазен
  }

sharePost(postId: string) {
  const url = `${window.location.origin}/post/${postId}`; // Генериране на линка
  this.clipboard.copy(url); // Копиране в клипборда

  // Показваме попъп за потвърждение
  this.copiedPostId = postId;
  this.showCopyPopup = true;

  // Скриване на попъпа след 2 секунди
  setTimeout(() => {
    this.showCopyPopup = false;
    this.copiedPostId = null;
  }, 1000);
}
}
