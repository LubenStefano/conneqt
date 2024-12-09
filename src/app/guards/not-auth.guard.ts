import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { map } from 'rxjs/operators';

export const notAuthGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.getUser().pipe(
    map(user => {
      if (user) {
        router.navigate(['/home']);
        return false;
      } else {
        return true;
      }
    })
  );
};