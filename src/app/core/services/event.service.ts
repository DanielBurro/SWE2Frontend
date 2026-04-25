// event.services.ts

import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventDto, EventStatus } from '../models/event.model';
import { environment } from '../../../environments/environment';
import { GridsterItemConfig } from 'angular-gridster2';
import * as crypto from 'node:crypto';

// Interface für die Builder-Elemente
export interface BuilderElement extends GridsterItemConfig {
  id: string;
  type: string;
  label: string;
  icon: string;
  data: any;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/events`;

  // --- BUILDER STATE (NEU) ---
  // Wir nutzen Signals für maximale Performance und einfaches Handling im Frontend
  private _builderElements = signal<BuilderElement[]>([]);

  // Read-only Zugriff für die Komponenten
  public builderElements: Signal<BuilderElement[]> = computed(() => this._builderElements());

  // --- BUILDER FUNKTIONEN (Frontend-Only für jetzt) ---

  /**
   * Fügt ein neues Element basierend auf dem Typ hinzu
   */
  addElement(type: string, label: string, icon: string) {
    const newElement: BuilderElement = {
      x: 0,
      y: 0,
      cols: 3,
      rows: 1, // Startet jetzt als schlanke Zeile
      id: window.crypto.randomUUID(),
      type,
      label,
      icon,
      data: this.getDefaultDataForType(type),
    };
    this._builderElements.update((elements) => [...elements, newElement]);
  }

  /**
   * Entfernt ein Element aus dem Builder
   */
  removeElement(id: string) {
    this._builderElements.update((elements) => elements.filter((el) => el.id !== id));
  }

  /**
   * Ändert die Spaltenbreite (1, 2 oder 3)
   */
  updateElementSize(id: string, cols: number) {
    this._builderElements.update((elements) =>
      elements.map((el) => (el.id === id ? { ...el, cols } : el)),
    );
  }

  updateElementPos(id: string, start: number, cols: number) {
    this._builderElements.update((elements) =>
      elements.map((el) => (el.id === id ? { ...el, start, cols } : el)),
    );
  }

  /**
   * Sortiert die Elemente um (wird vom CDK Drag & Drop aufgerufen)
   */
  reorderElements(previousIndex: number, currentIndex: number) {
    this._builderElements.update((elements) => {
      const newArray = [...elements];
      const [movedItem] = newArray.splice(previousIndex, 1);
      newArray.splice(currentIndex, 0, movedItem);
      return newArray;
    });
  }

  /**
   * Hilfsfunktion für Standard-Inhalte je nach Typ
   */
  private getDefaultDataForType(type: string): any {
    switch (type) {
      case 'text':
        return { text: '', placeholder: 'Dein Text hier...' };
      case 'heading':
        return { text: '', level: 2 };
      case 'image':
        return { url: '', caption: '' };
      case 'video':
        return { url: '', provider: 'youtube' };
      default:
        return {};
    }
  }

  // --- BESTEHENDE API FUNKTIONEN ---

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.base);
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.base}/${id}`);
  }

  getByHost(hostId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.base}/host/${hostId}`);
  }

  getUpcoming(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.base}/upcoming`);
  }

  /**
   * Modifiziert: Nimmt die Builder-Elemente automatisch mit in das DTO auf,
   * sobald das Backend dafür bereit ist.
   */
  create(dto: CreateEventDto): Observable<Event> {
    // Hier kombinieren wir das DTO mit den aktuellen Builder-Elementen
    const fullDto = {
      ...dto,
      builderContent: this._builderElements(), // Wir hängen die Elemente einfach dran
    };
    return this.http.post<Event>(this.base, fullDto);
  }

  update(id: number, dto: Partial<CreateEventDto>): Observable<Event> {
    return this.http.put<Event>(`${this.base}/${id}`, dto);
  }

  changeStatus(id: number, status: EventStatus): Observable<Event> {
    return this.http.put<Event>(`${this.base}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
