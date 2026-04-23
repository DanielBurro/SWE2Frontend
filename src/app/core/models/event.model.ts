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