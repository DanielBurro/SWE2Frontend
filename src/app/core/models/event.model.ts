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

export interface EventElement {
  id: string;      // Eindeutige ID (z.B. Date.now() oder UUID)
  type: string;    // 'text', 'image', 'video' etc.
  config: any;     // Die spezifischen Daten (z.B. { text: 'Hallo', color: 'gold' })
  order: number;   // Wichtig für die Sortierung
}

export interface EventData {
  id?: string;     // Datenbank-ID (leer bei neuem Event)
  title: string;
  elements: EventElement[];
}

