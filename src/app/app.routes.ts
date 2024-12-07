import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { ProfileComponent } from './user/profile/profile.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { DetailsComponent } from './post/details/details.component';
import { EditPostComponent } from './post/edit-post/edit-post.component';
import { EditCommentComponent } from './post/edit-comment/edit-comment.component';
import { EditProfileComponent } from './user/edit-profile/edit-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'profile/:id', component: ProfileComponent},
  {path: 'profile/:id/edit', component: EditProfileComponent},
  {path: 'post/:id', component: DetailsComponent},
  {path: 'post/:id/edit', component: EditPostComponent},
  {
    path: 'post/:postId/comment/:commentId/edit',
    component: EditCommentComponent
  },
  {path: '**', component: ErrorPageComponent}
];
