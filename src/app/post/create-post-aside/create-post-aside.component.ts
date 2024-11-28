import { Component, OnInit } from '@angular/core';
import { UserBadgeComponent } from '../../user/user-badge/user-badge.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faImage,
  faArrowAltCircleRight,
  faPlusSquare,
} from '@fortawesome/free-regular-svg-icons';
import { UserService } from '../../user/user.service';
import { FormsModule, NgForm } from '@angular/forms';
import { PostService } from '../post.service';


@Component({
  selector: 'app-create-post-aside',
  standalone: true,
  imports: [UserBadgeComponent, FontAwesomeModule, FormsModule],
  templateUrl: './create-post-aside.component.html',
  styleUrl: './create-post-aside.component.css',
})
export class CreatePostAsideComponent implements OnInit {
  faImage = faImage;
  faArrow = faArrowAltCircleRight;
  faPlus = faPlusSquare;

  username = "";
  userId = "";
  errorMessage = "";

  constructor(private userService: UserService, private postService: PostService) {}

  ngOnInit() {
    this.userService.getUser().subscribe((user) => {
      this.username = user?.displayName || '';
      this.userId = user?.uid || '';
    });
  }

  createPost(form: NgForm): void {
    if (!form.valid) {
      if (form.value.postContent === '') {
        this.errorMessage = 'Content is required';
        return;
      }
      return;
    }

    const post = {
      content: form.value.postContent,
      userId: this.userId,

    };

    // Call the service to create the post
    this.postService.createPost(post.content, post.userId)  // Replace 'userId' with actual user ID
      .subscribe({
        next: (createdPost) => {
          console.log('Post created:', createdPost);
          // Optionally navigate or reset form here
        },
        error: (err) => {
          this.errorMessage = 'Failed to create post: ' + err.message;
        }
      });
  }
}