import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  isExpanded = true;

  menu = [
    { label: 'Board', path: '/board', icon: 'dashboard', exact: true },
    { label: 'Leads', path: '/leads', icon: 'people', exact: false },
  ];

  constructor(private router: Router) {}

  toggle(): void {
    this.isExpanded = !this.isExpanded;
  }

  logout(): void {
    // limpa storages
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Error clearing storage', e);
    }

    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
    });

    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}
