import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../user.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, FontAwesomeModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(private userService: UserService, private router: Router) {}

  faUser = faUser;
  errorMessages = '';
  regExp = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$');

  login(form: NgForm) {
    if (!form.valid) {
      if (form.value.email === '') {
        this.errorMessages = 'Email is required';
        return;
      }
      if(!form.value.email.match(this.regExp)){
        this.errorMessages = 'Email is invalid';
        return;
      }
      if (form.value.password === '') {
        this.errorMessages = 'Password is required';
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
        this.errorMessages = err.message || 'Error occurred during login';
      },
    });
  }
}
