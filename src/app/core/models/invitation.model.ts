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

// ── Status-Converter ──

const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  PENDING:  'Ausstehend',
  ACCEPTED: 'Zugesagt',
  DECLINED: 'Abgelehnt',
};

const INVITATION_STATUS_COLORS: Record<InvitationStatus, string> = {
  PENDING:  '#c9a96e',
  ACCEPTED: '#4caf82',
  DECLINED: '#e86464',
};

export function getInvitationStatusLabel(status: InvitationStatus): string {
  return INVITATION_STATUS_LABELS[status] ?? status;
}

export function getInvitationStatusColor(status: InvitationStatus): string {
  return INVITATION_STATUS_COLORS[status] ?? '#888';
}