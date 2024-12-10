import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../user/user.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  isMenuOpen = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private renderer: Renderer2,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    this.userService.getUser().subscribe((user) => {
      this.user = user;
    });

    this.router.events.subscribe(() => {
      this.closeMenu();
    });

    this.renderer.listen('window', 'click', (event: Event) => {
      if (this.isMenuOpen && !this.elRef.nativeElement.contains(event.target)) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  onLogout() {
    this.userService.logout().subscribe({
      next: () => {
        this.user = null;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error logging out:', err);
      },
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
