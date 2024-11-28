import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../user/user.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  user: User | null = null;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.userService.getUser().subscribe((user) => {
      this.user = user;
      console.log(this.user);
    });
  }

  onLogout() {
    this.userService.logout().subscribe({
      next: () => {
        this.user = null; 
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        console.error('Error logging out:', err); 
      }
    });
  }
}
