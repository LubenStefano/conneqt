import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../user/user.service';
import { PostService } from '../post/post.service';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export const postCreatorGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state
) => {
  const userService = inject(UserService);
  const postService = inject(PostService);
  const router = inject(Router);

  const postId = route.paramMap.get('id');

  if (!postId) {
    router.navigate(['/home']);
    return of(false);
  }

  return userService.getUser().pipe(
    switchMap((user) => {
      if (!user) {
        router.navigate(['/login']);
        return of(false);
      }

      return postService.getPostById(postId).pipe(
        map((post) => {
          if (post.uid === user.uid) {
            return true;
          } else {
            router.navigate(['/home']);
            return false;
          }
        })
      );
    })
  );
};
