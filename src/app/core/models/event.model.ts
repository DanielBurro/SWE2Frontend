// event.model.ts

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  //status: 'PLANNED' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  status: string;
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

export type EventStatus = Event['status'];
