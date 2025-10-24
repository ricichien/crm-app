import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { 
  Lead, 
  LeadCreateDto, 
  LeadUpdateDto, 
  PaginatedResult 
} from '../models/lead.model';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private readonly apiUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  getLeads(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Observable<PaginatedResult<Lead>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (sortBy) {
      params = params
        .set('sortBy', sortBy)
        .set('sortOrder', sortOrder);
    }

    return this.http.get<Lead[]>(this.apiUrl, { 
      params,
      observe: 'response' 
    }).pipe(
      map(response => {
        const paginationHeader = response.headers.get('X-Pagination');
        const pagination = paginationHeader ? JSON.parse(paginationHeader) : null;

        return {
          items: response.body || [],
          pageNumber: pagination?.pageNumber || 1,
          totalPages: pagination?.totalPages || 1,
          totalCount: pagination?.totalCount || 0,
          hasPreviousPage: pagination?.hasPreviousPage || false,
          hasNextPage: pagination?.hasNextPage || false
        };
      })
    );
  }

  getLeadById(id: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.apiUrl}/${id}`);
  }

  createLead(lead: LeadCreateDto): Observable<Lead> {
    return this.http.post<Lead>(this.apiUrl, lead);
  }

  updateLead(id: string, lead: LeadUpdateDto): Observable<Lead> {
    return this.http.put<Lead>(`${this.apiUrl}/${id}`, lead);
  }

  deleteLead(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getLeadSources() {
    return this.http.get<{id: number, name: string}[]>(`${this.apiUrl}/sources`);
  }

  getLeadStatuses() {
    return this.http.get<{id: number, name: string}[]>(`${this.apiUrl}/statuses`);
  }
}