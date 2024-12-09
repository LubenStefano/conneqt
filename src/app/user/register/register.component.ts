import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../user.service';
import { DEFAULT_USER_IMG } from '../../constants';
import { ErrorHandlerService } from '../../error/error-handling.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, FontAwesomeModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'], // Fixed typo: styleUrl -> styleUrls
})
export class RegisterComponent {
  constructor(
    private userService: UserService,
     private router: Router,
     private errorHandler: ErrorHandlerService
    ) {}
  faUser = faUser;
  regExp = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$');

  register(form:NgForm){
    if(!form.valid){
      if(form.value.username === ''){
       this.errorHandler.showError('Username is required');
        return;
      }
      if(form.value.email === ''){
        this.errorHandler.showError('Email is required');
        return;
      }
      if(!form.value.email.match(this.regExp)){
        this.errorHandler.showError('Email is invalid');
        return;
      }
      if(form.value.password === ''){
        this.errorHandler.showError('Password is required');
        return;
      }
      if(form.value.password.length < 6){
        this.errorHandler.showError('Password must be at least 6 characters long');
        return;
      }
      if(form.value.rePassword === ''){
        this.errorHandler.showError('Please re-enter your password');
      }
      return;
    }
    if(form.value.password !== form.value.rePassword){
      this.errorHandler.showError('Passwords do not match');
      return;
    }
    const user = {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
      img: DEFAULT_USER_IMG,
      id: '', // Will be assigned by the backend or Firebase
      savedPosts: [],
    };

    console.log(user);

    this.userService.register(user).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        let errorMessage = 'Error occurred during registration';
        if (err.code) {
          switch (err.code) {
            case 'auth/email-already-in-use':
              errorMessage = 'The email address is already in use by another account.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'The email address is not valid.';
              break;
            case 'auth/operation-not-allowed':
              errorMessage = 'Operation not allowed. Please contact support.';
              break;
            case 'auth/weak-password':
              errorMessage = 'The password is too weak.';
              break;
            default:
              errorMessage = err.message;
              break;
          }
        }
        this.errorHandler.showError(errorMessage);
      }
    });
  }

}
