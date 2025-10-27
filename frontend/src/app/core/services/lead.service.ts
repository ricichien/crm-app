import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lead, LeadCreateDto, LeadUpdateDto, PaginatedResult } from '../models/lead.model';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private api = `${environment.apiUrl}/api/leads`;

  constructor(private http: HttpClient) {}

  getLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(this.api);
  }

  getLeadById(id: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.api}/${id}`);
  }

  createLead(dto: LeadCreateDto): Observable<Lead> {
    return this.http.post<Lead>(this.api, dto);
  }

  updateLead(id: string, dto: LeadUpdateDto): Observable<Lead> {
    return this.http.put<Lead>(`${this.api}/${id}`, dto);
  }

  deleteLead(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  list(
    search = '',
    status?: string,
    page = 1,
    pageSize = 10
  ): Observable<Lead[] | PaginatedResult<Lead>> {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);

    return this.http.get<Lead[]>(this.api, { params, observe: 'response' }).pipe(
      map((response) => {
        const body = response.body ?? [];
        const paginationHeader = response.headers.get('X-Pagination');
        if (paginationHeader) {
          const p = JSON.parse(paginationHeader);
          const paginated: PaginatedResult<Lead> = {
            items: body,
            pageNumber: p.pageNumber ?? p.PageNumber ?? 1,
            totalPages: p.totalPages ?? p.TotalPages ?? 1,
            totalCount: p.totalCount ?? p.TotalCount ?? 0,
            hasPreviousPage: p.hasPreviousPage ?? p.HasPreviousPage ?? false,
            hasNextPage: p.hasNextPage ?? p.HasNextPage ?? false,
          };
          return paginated;
        }

        return body;
      })
    );
  }
}
