import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faImage, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { PostService } from '../post.service';
import { UserService } from '../../user/user.service';
import { Post } from '../../types/post';
import { User } from '../../types/user';
import { FormsModule, NgForm } from '@angular/forms';
import { UserBadgeComponent } from '../../user/user-badge/user-badge.component';
import { switchMap, map } from 'rxjs';
import { ImageCropperComponent } from '../image-cropper/image-cropper.component';


@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [
    FontAwesomeModule,
    FormsModule,
    UserBadgeComponent,
    ImageCropperComponent,
],
  templateUrl: './edit-post.component.html',
  styleUrl: './edit-post.component.css'
})
export class EditPostComponent implements OnInit {
  post: (Post & Partial<User>) | null = null;
  user: User | null = null;
  isSubmitting = false;
  
  faImage = faImage;
  faTrash = faTrashCan;

  selectedImage: string | null = null;
  showCropper = false;
  selectedFileEvent: Event | null = null;
  photo: string | undefined | null = undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId) {
      console.error('No post ID provided');
      this.router.navigate(['/']);
      return;
    }

    // Combine user and post streams
    const combined$ = this.userService.getUser().pipe(
      switchMap(user => {
        if (!user) {
          throw new Error('Not authenticated');
        }

        this.user = {
          uid: user.uid,
          username: user.displayName || 'Unknown User',
          userPfp: user.photoURL || '',
          savedPosts: Array.isArray((user as any).savedPosts) ? (user as any).savedPosts : [],
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          email: user.email || undefined
        };

        return this.postService.getPostById(postId).pipe(
          switchMap(post =>
            this.userService.getUserByReference(post.creator).pipe(
              map(creator => ({
                ...post,
                uid: creator?.uid || 'unknown',
                username: creator?.displayName || 'Unknown User',
                userPfp: creator?.photoURL || 'default-profile-pic-url',
              }))
            )
          )
        );
      })
    );

    combined$.subscribe({
      next: (post) => {
        // Verify post belongs to current user
        if (this.user?.uid !== post.uid) {
          console.error('Not authorized to edit this post');
          this.router.navigate(['/']);
          return;
        }
        this.post = post;
        this.photo = post.img;
      },
      error: (error) => {
        console.error('Error loading post:', error);
        this.router.navigate(['/']);
      }
    });
  }

  onFileSelected(event: Event): void {
    console.log('File selected event received');
    this.selectedFileEvent = event;
    this.showCropper = true;
  }

  onImageCropped(croppedImage: string): void {
    console.log('Received cropped image');
    this.selectedImage = croppedImage;
    console.log('Image processed and stored');
    this.photo = croppedImage;
  }

  onCropSaved(): void {
    console.log('Crop saved, hiding cropper');
    this.showCropper = false;
  }

  onCropCancelled(): void {
    console.log('Crop cancelled, resetting state');
    this.selectedFileEvent = null;
    this.selectedImage = null;
    this.showCropper = false;
  }

  updatePost(form: NgForm) {
    if (!form.valid || !this.post?._id || !this.user) return;
    
    this.isSubmitting = true;

    // Handle image update
    const imageToUpdate = this.selectedImage !== null ? this.selectedImage : this.photo;

    if (imageToUpdate?.startsWith('data:image')) {
      // New image needs to be uploaded
      this.postService.uploadImageToFirebase(imageToUpdate)
        .pipe(
          switchMap(imageUrl => 
            this.postService.updatePost(this.post!._id, form.value.content, imageUrl)
          )
        ).subscribe({
          next: () => {
            this.router.navigate(['/post', this.post?._id]);
          },
          error: (error) => {
            console.error('Error updating post:', error);
            this.isSubmitting = false;
          }
        });
    } else {
      // No new image or keeping existing image URL
      this.postService.updatePost(
        this.post._id, 
        form.value.content, 
        imageToUpdate || undefined
      ).subscribe({
        next: () => {
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          console.error('Error updating post:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  // Add method to remove image
  removeImage() {
    this.photo = null;
    this.selectedImage = null;
  }

  cancel() {
    if (this.post?._id) {
      this.router.navigate(['/post', this.post._id]);
    } else {
      this.router.navigate(['/']);
    }
  }
}