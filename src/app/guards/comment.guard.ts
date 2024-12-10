import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../user/user.service';
import { PostService } from '../post/post.service';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export const commentCreatorGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state
) => {
  const userService = inject(UserService);
  const postService = inject(PostService);
  const router = inject(Router);

  const postId = route.paramMap.get('postId');
  const commentId = route.paramMap.get('commentId');

  if (!postId || !commentId) {
    router.navigate(['/home']);
    return of(false);
  }

  return userService.getUser().pipe(
    switchMap((user) => {
      if (!user) {
        router.navigate(['/login']);
        return of(false);
      }

      const userUid = user.uid;

      return postService.getComments(postId).pipe(
        map((comments) => {
          const comment = comments.find((c) => c._id === commentId);
          if (comment?.uid === userUid) {
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
