import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login';
import { TaskBoardComponent } from './components/task-board/task-board.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LeadDetailComponent } from './pages/leads/lead-detail/lead-detail.component';
import { LeadsListComponent } from './pages/leads/lead-list/lead-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'leads', component: LeadsListComponent, canActivate: [AuthGuard] },
  { path: 'leads/new', component: LeadDetailComponent, canActivate: [AuthGuard] },
  { path: 'leads/:id', component: LeadDetailComponent, canActivate: [AuthGuard] },
  { path: 'board', component: TaskBoardComponent, canActivate: [AuthGuard] }, // keep for later
  { path: '', redirectTo: 'leads', pathMatch: 'full' },
  { path: '**', redirectTo: 'leads' },
];
