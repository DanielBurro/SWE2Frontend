// location.service.ts
// /api/locations

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

  create(location: Omit<Location, 'id'>): Observable<Location> {
    return this.http.post<Location>(this.base, location);
  }
}
