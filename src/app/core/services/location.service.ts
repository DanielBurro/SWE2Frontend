// location.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from '../models/location.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/locations`;

  getAll(): Observable<Location[]> {
    return this.http.get<Location[]>(this.base);
  }

  getById(id: number): Observable<Location> {
    return this.http.get<Location>(`${this.base}/${id}`);
  }

  create(location: Omit<Location, 'id'>): Observable<Location> {
    return this.http.post<Location>(this.base, location);
  }

  update(id: number, location: Omit<Location, 'id'>): Observable<Location> {
    return this.http.put<Location>(`${this.base}/${id}`, location);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
