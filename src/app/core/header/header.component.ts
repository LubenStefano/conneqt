import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../user/user.service';
import { User } from '@angular/fire/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  user: User | null = null;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.userService.getUser().subscribe((user) => {
      this.user = user;
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
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
