// invitation.service.ts
// alle /api/invitations Endpoints

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invitation, SendInvitationDto, UpdateInvitationStatusDto } from '../models/invitation.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/invitations`;

  send(dto: SendInvitationDto): Observable<Invitation> {
    return this.http.post<Invitation>(this.base, dto);
  }

  getByUser(userId: number): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.base}/user/${userId}`);
  }

  getByEvent(eventId: number): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.base}/event/${eventId}`);
  }

  updateStatus(id: number, dto: UpdateInvitationStatusDto): Observable<Invitation> {
    return this.http.put<Invitation>(`${this.base}/${id}/status`, dto);
  }
}