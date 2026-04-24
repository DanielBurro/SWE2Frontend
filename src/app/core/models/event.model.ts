export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  status: string;
  hostId?: number;
  hostName: string;
  locationId?: number;
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
