// event.model.ts

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  //status: 'PLANNED' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  status: string;
  hostName: string;
  locationName: string;
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  hostId: number;
  locationId: number;
}

export type EventStatus = Event['status'];

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
