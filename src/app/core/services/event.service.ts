// event.services.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventDto, EventStatus } from '../models/event.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/events`;

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.base);
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.base}/${id}`);
  }

  getByHost(hostId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.base}/host/${hostId}`);
  }

  getUpcoming(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.base}/upcoming`);
  }

  create(dto: CreateEventDto): Observable<Event> {
    return this.http.post<Event>(this.base, dto);
  }

  update(id: number, dto: Partial<CreateEventDto>): Observable<Event> {
    return this.http.put<Event>(`${this.base}/${id}`, dto);
  }

  changeStatus(id: number, status: EventStatus): Observable<Event> {
    return this.http.put<Event>(`${this.base}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
