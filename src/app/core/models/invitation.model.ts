// invitation.model.ts

export interface Invitation {
  id: number;
  eventId: number;
  eventTitle: string;
  guestId: number;
  guestName: string;
  status: string;
  plusOnes: number;
  sentAt: string;
}

export interface SendInvitationDto {
  eventId: number;
  guestId: number;
}

export interface UpdateInvitationStatusDto {
  status: string;
  plusOnes: number;
}