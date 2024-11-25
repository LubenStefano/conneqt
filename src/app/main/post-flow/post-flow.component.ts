import { Component } from '@angular/core';
import { UserBadgeComponent } from "../user-badge/user-badge.component";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShareFromSquare, faComment, faHeart, faBookmark } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-post-flow',
  standalone: true,
  imports: [UserBadgeComponent, FontAwesomeModule],
  templateUrl: './post-flow.component.html',
  styleUrl: './post-flow.component.css'
})
export class PostFlowComponent {
  faShare = faShareFromSquare;
  faComment = faComment;
  faHeart = faHeart;
  faBookmark = faBookmark;
}
