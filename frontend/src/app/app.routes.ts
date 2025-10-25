import { Routes } from '@angular/router';
import { TaskBoardComponent } from './components/task-board/task-board.component';
import { LoginPage } from './pages/login/login';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'tasks', component: TaskBoardComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: '**', redirectTo: 'tasks' },
];
