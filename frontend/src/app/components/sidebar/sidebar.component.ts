import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menu = [
    { label: 'Board', path: '/' },
    { label: 'Leads', path: '/leads' },
    { label: 'Tasks', path: '/tasks' }, // placeholder
    // add more items here (Reports, Settings, etc.)
  ];
}
