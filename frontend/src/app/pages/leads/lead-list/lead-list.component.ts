// LeadsListComponent atualizado para consumir Lead[] | PaginatedResult<Lead> de LeadService.list
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { Lead, PaginatedResult } from '@app/core/models';
import { LeadService } from '@app/core/services/lead.service';
import { LEAD_STATUS_OPTIONS } from '@app/core/models';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-leads-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './lead-list.component.html',
  styleUrls: ['./lead-list.component.scss'],
})
export class LeadsListComponent implements OnInit, OnDestroy {
  search = new FormControl<string>('');
  status = new FormControl<string>('');
  leads: Lead[] = [];
  loading = false;
  error = '';

  leadStatuses = LEAD_STATUS_OPTIONS;

  private destroy$ = new Subject<void>();

  // pagination state (useful if backend returns paginated)
  page = 1;
  pageSize = 20;
  totalPages = 1;
  totalCount = 0;

  constructor(private leadService: LeadService, private router: Router) {}

  ngOnInit() {
    this.load();

    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.page = 1;
        this.load();
      });

    this.status.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private isPaginated(obj: any): obj is PaginatedResult<Lead> {
    return obj && typeof obj === 'object' && Array.isArray((obj as any).items);
  }

  load() {
    this.loading = true;
    this.error = '';

    const q = this.search.value ?? '';
    const s = this.status.value ?? '';

    this.leadService
      .list(q, s, this.page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (Array.isArray(res)) {
            this.leads = res;
            this.totalPages = 1;
            this.totalCount = this.leads.length;
          } else if (this.isPaginated(res)) {
            this.leads = res.items ?? [];
            this.page = res.pageNumber ?? this.page;
            this.totalPages = res.totalPages ?? 1;
            this.totalCount = res.totalCount ?? 0;
          } else if (res && Array.isArray((res as any).data)) {
            // fallback: some APIs return { data: [...] }
            this.leads = (res as any).data;
            this.totalPages = 1;
            this.totalCount = this.leads.length;
          } else {
            this.leads = [];
            this.totalPages = 1;
            this.totalCount = 0;
          }

          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load leads', err);
          this.error = 'Failed to load leads';
          this.loading = false;
        },
      });
  }

  newLead() {
    this.router.navigate(['/leads', 'new']);
  }

  edit(lead: Lead, event?: Event) {
    if (event) event.stopPropagation();
    this.router.navigate(['/leads', lead.id]);
  }

  openDetail(lead: Lead) {
    this.router.navigate(['/leads', lead.id]);
  }
}
