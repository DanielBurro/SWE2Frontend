// event.model.ts

export type EventStatus = 'PLANNED' | 'ACTIVE' | 'CANCELLED' | 'DONE';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  status: EventStatus;
  hostName: string;
  hostId: number;
  locationName: string;
  locationId: number;
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  hostId: number;
  locationId: number;
}

// ── Status-Converter ──

const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  PLANNED:   'Geplant',
  ACTIVE:    'Aktiv',
  CANCELLED: 'Abgesagt',
  DONE:      'Beendet',
};

const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  PLANNED:   '#c9a96e',
  ACTIVE:    '#4caf82',
  CANCELLED: '#e86464',
  DONE:      '#5a82c9',
};

export function getEventStatusLabel(status: EventStatus): string {
  return EVENT_STATUS_LABELS[status] ?? status;
}

export function getEventStatusColor(status: EventStatus): string {
  return EVENT_STATUS_COLORS[status] ?? '#888';
}