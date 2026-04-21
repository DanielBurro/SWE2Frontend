// invitation.model.ts

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface Invitation {
  id: number;
  eventId: number;
  eventTitle: string;
  guestId: number;
  guestName: string;
  status: InvitationStatus;
  plusOnes: number;
  sentAt: string;
}

export interface SendInvitationDto {
  eventId: number;
  guestId: number;
}

export interface UpdateInvitationStatusDto {
  status: InvitationStatus;
  plusOnes: number;
}