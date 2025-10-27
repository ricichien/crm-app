import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { Lead, PaginatedResult } from '@app/core/models';
import { LeadService } from '@app/core/services/lead.service';
import { LEAD_STATUS_OPTIONS } from '@app/core/models';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';

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
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatChipsModule,
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

  // pagination state
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

  // navegação
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

  // helpers
  getInitials(lead: Lead): string {
    const fn = (lead.firstName || '').trim();
    const ln = (lead.lastName || '').trim();
    if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
    if (fn) return fn.slice(0, 2).toUpperCase();
    if (ln) return ln.slice(0, 2).toUpperCase();
    return '?';
  }

  // evita acessar propriedade que pode não existir no seu model
  getJobTitle(lead: Lead): string {
    // procura por campos comuns sem quebrar a tipagem
    return (
      ((lead as any).title as string) ??
      ((lead as any).jobTitle as string) ??
      ((lead as any).position as string) ??
      ''
    );
  }

  onPage(event: any) {
    this.page = (event.pageIndex ?? 0) + 1;
    this.pageSize = event.pageSize ?? this.pageSize;
    this.load();
  }

  trackById(index: number, lead: Lead) {
    return lead.id ?? index;
  }
}
