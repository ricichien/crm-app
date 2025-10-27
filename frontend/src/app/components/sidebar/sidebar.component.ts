import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    // { label: 'Tasks', path: '/tasks', icon: 'check_circle', exact: false },
  ];

  toggle(): void {
    this.isExpanded = !this.isExpanded;
  }
}
