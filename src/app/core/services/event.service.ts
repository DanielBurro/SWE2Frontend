// event.services.ts
// GET/POST /api/events

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventDto } from '../models/event.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/events`;

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.base);
  }

  getByHost(hostId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.base}/host/${hostId}`);
  }

  create(dto: CreateEventDto): Observable<Event> {
    return this.http.post<Event>(this.base, dto);
  }
}