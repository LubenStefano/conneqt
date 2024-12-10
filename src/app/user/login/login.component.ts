import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../user.service';
import { ErrorHandlerService } from '../../error/error-handling.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, FontAwesomeModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(
    private userService: UserService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {}

  faUser = faUser;
  regExp = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{1,}$');

  login(form: NgForm) {
    if (!form.valid) {
      if (form.value.email === '') {
        this.errorHandler.showError('Email is required');
        return;
      }
      if (!form.value.email.match(this.regExp)) {
        this.errorHandler.showError('Invalid email format');
        return;
      }
      if (form.value.password === '') {
        this.errorHandler.showError('Password is required');
        return;
      }
      return;
    }

    const user = {
      email: form.value.email,
      password: form.value.password,
    };

    this.userService.login(user.email, user.password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        let errorMessage = 'An unknown error occurred. Please try again later.';

        if (err.message) {
          switch (err.message) {
            case 'auth/invalid-credential':
              errorMessage = 'Wrong email or password.';
              break;
            case 'auth/user-disabled':
              errorMessage = 'The user account has been disabled.';
              break;
            case 'auth/user-not-found':
              errorMessage = 'No user found with this email.';
              break;
            case 'auth/wrong-password':
              errorMessage = 'Wrong password.';
              break;
            case 'auth/email-already-in-use':
              errorMessage =
                'The email address is already in use by another account.';
              break;
            case 'auth/operation-not-allowed':
              errorMessage = 'Operation not allowed. Please contact support.';
              break;
            case 'auth/weak-password':
              errorMessage = 'The password is too weak.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'The email address is not valid.';
              break;
            default:
              errorMessage = err.message;
              break;
          }
        }

        this.errorHandler.showError(errorMessage);
      },
    });
  }
}
