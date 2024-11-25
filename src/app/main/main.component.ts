import { Component } from '@angular/core';
import { CreatePostAsideComponent } from './create-post-aside/create-post-aside.component';
import { SavedPostsAsideComponent } from './saved-posts-aside/saved-posts-aside.component';
import { PostFlowComponent } from './post-flow/post-flow.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CreatePostAsideComponent, SavedPostsAsideComponent, PostFlowComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

}
