import { Component, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App implements OnDestroy {
  showSidebar = true;
  private sub = new Subscription();

  constructor(private router: Router, private authService: AuthService) {
    const s = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const isLogin = this.router.url.includes('/login');
        this.showSidebar = this.authService.isAuthenticated() && !isLogin;
      }
    });
    this.sub.add(s);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
