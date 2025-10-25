import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  isExpanded = false;

  menu = [
    { label: 'Board', path: '/', icon: 'dashboard' },
    { label: 'Leads', path: '/leads', icon: 'people' },
    { label: 'Tasks', path: '/tasks', icon: 'check_circle' },
  ];

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
