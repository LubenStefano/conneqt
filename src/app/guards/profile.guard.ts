import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { map } from 'rxjs/operators';

export const profileGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const userId = route.paramMap.get('id'); // Assuming the route has a parameter 'id' for user ID

  return userService.getUser().pipe(
    map(user => {
      if (user && user.uid === userId) {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    })
  );
};