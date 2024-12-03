import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../user.service';
import { DEFAULT_USER_IMG } from '../../constants';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, FontAwesomeModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'], // Fixed typo: styleUrl -> styleUrls
})
export class RegisterComponent {
  constructor(private userService: UserService, private router: Router) {}
  faUser = faUser;
  regExp = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$');
  errorMessages= '';

  register(form:NgForm){
    if(!form.valid){
      if(form.value.username === ''){
        this.errorMessages = 'Username is required';
        return;
      }
      if(form.value.email === ''){
        this.errorMessages = 'Email is required';
        return;
      }
      if(!form.value.email.match(this.regExp)){
        this.errorMessages = 'Email is invalid';
        return;
      }
      if(form.value.password === ''){
        this.errorMessages = 'Password is required';
        return;
      }
      if(form.value.password.length < 6){
        this.errorMessages = 'Password must be at least 6 characters';
        return;
      }
      if(form.value.rePassword === ''){
        this.errorMessages = 'Confirm password is required';
      }
      return;
    }
    if(form.value.password !== form.value.rePassword){
      this.errorMessages = 'Passwords do not match';
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
        this.errorMessages = err.message || 'Error occurred during registration';
      }
    });
  }

}
