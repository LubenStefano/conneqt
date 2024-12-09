import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserBadgeComponent } from '../../shared/user-badge/user-badge.component'; 
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faImage,
  faArrowAltCircleRight,
  faPlusSquare,
  faTimesCircle
} from '@fortawesome/free-regular-svg-icons';
import { UserService } from '../../user/user.service';
import { FormsModule, NgForm } from '@angular/forms';
import { PostService } from '../post.service';
import { ImageCropperComponent } from '../image-cropper/image-cropper.component';
import { ErrorHandlerService } from '../../error/error-handling.service';


@Component({
  selector: 'app-create-post-aside',
  standalone: true,
  imports: [
    CommonModule,
    UserBadgeComponent,
    FontAwesomeModule,
    FormsModule,
    ImageCropperComponent,
  ],
  templateUrl: './create-post-aside.component.html',
  styleUrls: ['./create-post-aside.component.css'],
})
export class CreatePostAsideComponent implements OnInit {
  faImage = faImage;
  faArrow = faArrowAltCircleRight;
  faPlus = faPlusSquare;
  faTimes = faTimesCircle;

  username = '';
  userId = '';
  userPfp = '';

  errorMessage = '';
  selectedImage: string | null = null;
  showCropper = false;
  selectedFileEvent: Event | null = null;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.userService.getUser().subscribe({
      next: (user) => {
        this.username = user?.displayName || '';
        this.userId = user?.uid || '';
        this.userPfp = user?.photoURL || '';
      },
      error: (error) => {
        console.error('Failed to load user:', error);
        this.errorMessage = 'Failed to load user data';
      },
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

  createPost(form: NgForm): void {
    console.log('Creating post...');

    if (!form.valid || !this.userId) {
      this.errorHandler.showError('Content is required!');
      return;
    }

    const postContent = form.value.postContent;

    if (this.selectedImage) {
      console.log('Uploading image before creating post...');
      this.postService.uploadImageToFirebase(this.selectedImage).subscribe({
        next: (imageUrl) => {
          console.log('Image uploaded successfully:', imageUrl);
          this.submitPost(postContent, imageUrl);
        },
        error: (err) => {
          console.error('Failed to upload image:', err);
          this.errorMessage = 'Failed to upload image: ' + err.message;
        },
      });
    } else {
      console.log('Creating post without image');
      this.submitPost(postContent);
    }

    form.resetForm();
    this.selectedImage = null;
    this.selectedFileEvent = null;
  }

  private submitPost(content: string, imgUrl?: string) {
    console.log('Submitting post:', { content, imgUrl });

    this.postService.createPost(content, this.userId, imgUrl).subscribe({
      next: (createdPost) => {
        console.log('Post created successfully:', createdPost);
        this.errorMessage = '';
        this.showCropper = false;
        this.selectedImage = null;
        this.selectedFileEvent = null;
      },
      error: (err) => {
        let errorMessage = 'Error occurred during post creation';
        if (err.code) {
          switch (err.code) {
            case 'post/invalid-data':
              errorMessage = 'Invalid post data.';
              break;
            case 'post/creation-failed':
              errorMessage = 'Post creation failed. Please try again.';
              break;
            default:
              errorMessage = err.message;
              break;
          }
        }
        this.errorHandler.showError(errorMessage);
      },
    });
  }
  removeSelectedFile(): void {
    this.selectedImage = null;
  }
}
