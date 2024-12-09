// edit-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UserBadgeComponent } from '../../shared/user-badge/user-badge.component'; 
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { ImageCropperComponent } from '../../post/image-cropper/image-cropper.component';
import { User } from '../../types/user';


@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    FormsModule,
    UserBadgeComponent,
    FontAwesomeModule,
    ImageCropperComponent,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent implements OnInit {
  user: User | null = null;
  username = '';
  isSubmitting = false;
  faImage = faImage;

  selectedImage: string | null = null;
  showCropper = false;
  selectedFileEvent: Event | null = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.getUser().subscribe(user => {
      if (user) {
        this.user = {
          uid: user.uid,
          username: user.displayName || '',
          userPfp: user.photoURL || '',
          savedPosts: [],
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          email: user.email || undefined
        };
        this.username = this.user.username;
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  onFileSelected(event: Event) {
    this.selectedFileEvent = event;
    this.showCropper = true;
  }

  onImageCropped(image: string) {
    this.selectedImage = image;
  }

  onCropSaved() {
    this.showCropper = false;
  }

  onCropCancelled() {
    this.showCropper = false;
    this.selectedImage = null;
    this.selectedFileEvent = null;
  }

  updateProfile(form: NgForm) {
    if (!form.valid || !this.user) return;

    this.isSubmitting = true;
    const updates: { displayName?: string; photoURL?: string } = {};

    if (this.username !== this.user.username) {
      updates.displayName = this.username;
    }

    if (this.selectedImage) {
      updates.photoURL = this.selectedImage;
    }

    this.userService.updateProfile(this.user.uid, updates).subscribe({
      next: () => {
        this.router.navigate(['/profile', this.user?.uid]);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/profile', this.user?.uid]);
  }
}