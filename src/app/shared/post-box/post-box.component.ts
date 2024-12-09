import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../../types/post';
import { User } from '../../types/user';
import {
  faPaperPlane,
  faComment,
  faHeart,
  faBookmark,
  faPenToSquare,
  faTrashCan,
} from '@fortawesome/free-regular-svg-icons';
import {
  faHeart as faHeartSolid,
  faBookmark as faBookmarkSolid,
  faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { UserBadgeComponent } from '../user-badge/user-badge.component'; 
import { NgClass } from '@angular/common';

// Define a new type that combines Post and User properties
type PostWithUser = Post & Partial<User>;

@Component({
  selector: 'app-post-box',
  standalone: true,
  templateUrl: './post-box.component.html',
  styleUrls: ['./post-box.component.css'],
  imports: [FontAwesomeModule, RouterLink, UserBadgeComponent, NgClass],
})
export class PostBoxComponent {
  @Input() post: PostWithUser | null = null;
  @Input() user: User | null = null;
  @Input() isAuthenticated: boolean = false;
  @Input() likeBubbles: { [key: string]: boolean } = {};
  @Input() prevLikedState: boolean = false;
  @Input() prevSavedState: boolean = false;
  @Input() showCopyPopup: boolean = false;
  @Input() copiedPostId: string | null = null;
  @Input() activePopupId: string | null = null;
  @Input() showOptionsMenu: boolean = false;
  @Input() showEllipsisMenu: boolean = true;
  @Input() currentUserId: string | undefined;
  @Input() userProfile: boolean = false; // Add this line

  @Output() likePost = new EventEmitter<string>();
  @Output() savePost = new EventEmitter<string>();
  @Output() sharePost = new EventEmitter<string>();
  @Output() toggleOptionsMenu = new EventEmitter<{
    postId: string;
    event: Event;
  }>();
  @Output() closeOptionsMenu = new EventEmitter<void>();
  @Output() deletePost = new EventEmitter<string>();

  faShare = faPaperPlane;
  faComment = faComment;
  faHeart = faHeart;
  faHeartSolid = faHeartSolid;
  faBookmark = faBookmark;
  faBookmarkSolid = faBookmarkSolid;
  faEllipsisH = faEllipsisH;
  faPenToSquare = faPenToSquare;
  faTrash = faTrashCan;

  isCurrentUserAuthor(): boolean {
    return this.user?.uid === this.post?.uid;
  }

  isLiked(post: Post): boolean {
    if (!this.isAuthenticated || !this.user) return false;
    return post.likes?.includes(this.user.uid) ?? false;
  }

  isSaved(postId: string): boolean {
    if (!this.isAuthenticated || !this.user) return false;
    return this.user.savedPosts?.includes(postId) ?? false;
  }

  onDeletePost() {
    if (this.post) {
      this.deletePost.emit(this.post._id);
    }
  }
  
  get showEllipsis(): boolean {
    return (
      this.showEllipsisMenu &&
      this.isAuthenticated &&
      this.userProfile && // Add this condition
      this.post?.username === this.user?.username
    );
  }
}
