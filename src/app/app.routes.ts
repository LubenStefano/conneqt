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
import { authGuard } from './guards/auth.guard';
import { commentCreatorGuard } from './guards/comment.guard';
import { notAuthGuard } from './guards/not-auth.guard';
import { postCreatorGuard } from './guards/post-creator.guard';
import { profileGuard } from './guards/profile.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {path: 'login', component: LoginComponent, canActivate: [notAuthGuard]},
  {path: 'register', component: RegisterComponent, canActivate: [notAuthGuard]},
  {path: 'profile/:id', component: ProfileComponent,canActivate: [authGuard]},
  {path: 'profile/:id/edit', component: EditProfileComponent, canActivate: [authGuard, profileGuard]},
  {path: 'post/:id', component: DetailsComponent, canActivate: [authGuard]},
  {path: 'post/:id/edit', component: EditPostComponent, canActivate: [authGuard, postCreatorGuard]},
  {
    path: 'post/:postId/comment/:commentId/edit',
    component: EditCommentComponent,
    canActivate: [authGuard, commentCreatorGuard]
  },
  {path: '**', component: ErrorPageComponent}
];
