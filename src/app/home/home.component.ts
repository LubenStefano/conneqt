import { Component } from '@angular/core';
import { CreatePostAsideComponent } from '../post/create-post-aside/create-post-aside.component';
import { SavedPostsAsideComponent } from '../post/saved-posts-aside/saved-posts-aside.component';
import { PostFlowComponent } from '../post/post-flow/post-flow.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CreatePostAsideComponent,
    SavedPostsAsideComponent,
    PostFlowComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {}
