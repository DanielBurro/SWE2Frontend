// event.services.ts

import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventDto, EventStatus } from '../models/event.model';
import {
  EventTemplateContent,
  EventTemplateSnapshot,
  cloneTemplateSnapshot,
  createTemplateContent,
  hasTemplateContent,
} from '../models/event-template.model';
import { environment } from '../../../environments/environment';

// Simplified Interface for the Builder-Elemente (Document-style)
export interface BuilderElement {
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

  // --- BUILDER STATE ---
  private _builderElements = signal<BuilderElement[]>([]);
  public builderElements: Signal<BuilderElement[]> = computed(() => this._builderElements());

  public eventTitle = signal<string>('');
  public eventDate = signal<Date | null>(null);
  public eventLocation = signal<string>('');
  public eventLocationId = signal<number | null>(null);
  public eventContent = signal<any>(null);
  public currentEventId = signal<number | null>(null);

  // Persistent gradient state
  public color1 = signal<string>('#c9a96e');
  public color2 = signal<string>('#111118');
  public coverGradient = computed(() => `linear-gradient(135deg, ${this.color1()} 0%, ${this.color2()} 100%)`);

  updateTitle(newTitle: string) {
    this.eventTitle.set(newTitle);
  }

  updateColors(c1: string, c2: string) {
    this.color1.set(c1);
    this.color2.set(c2);
  }

  hasDraftContent(): boolean {
    return this.eventTitle().trim().length > 0 || hasTemplateContent(this.eventContent());
  }

  getTemplateSnapshot(fallbackTitle = 'Neues Event'): EventTemplateSnapshot {
    const content = (this.eventContent() as EventTemplateContent | null) ?? createTemplateContent([]);

    return cloneTemplateSnapshot({
      title: this.eventTitle().trim() || fallbackTitle,
      content,
    });
  }

  applyTemplateSnapshot(template: EventTemplateSnapshot) {
    const nextTemplate = cloneTemplateSnapshot(template);

    this.currentEventId.set(null);
    this.eventDate.set(null);
    this.eventLocation.set('');
    this.eventLocationId.set(null);
    this.eventTitle.set(nextTemplate.title);
    this.eventContent.set(nextTemplate.content);
    this._builderElements.set([]);
  }

  resetBuilder() {
    this.eventTitle.set('');
    this.eventDate.set(null);
    this.eventLocation.set('');
    this.eventLocationId.set(null);
    this.eventContent.set(null);
    this.currentEventId.set(null);
    this._builderElements.set([]);
  }

  // --- BUILDER FUNKTIONEN ---

  addElement(type: string, label: string, icon: string) {
    const newElement: BuilderElement = {
      id: window.crypto.randomUUID(),
      type,
      label,
      icon,
      data: this.getDefaultDataForType(type),
    };
    this._builderElements.update((elements) => [...elements, newElement]);
  }

  removeElement(id: string) {
    this._builderElements.update((elements) => elements.filter((el) => el.id !== id));
  }

  updateElement(id: string, updates: Partial<BuilderElement>) {
    this._builderElements.update((elements) =>
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    );
  }

  reorderElements(previousIndex: number, currentIndex: number) {
    this._builderElements.update((elements) => {
      const newArray = [...elements];
      const [movedItem] = newArray.splice(previousIndex, 1);
      newArray.splice(currentIndex, 0, movedItem);
      return newArray;
    });
  }

  /**
   * Hilfsfunktion fuer Standard-Inhalte je nach Typ
   */
  private getDefaultDataForType(type: string): any {
    switch (type) {
      case 'text':
        return { text: '' };
      case 'heading':
        return { text: '', level: 2 };
      case 'image':
        return { url: '' };
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
   * sobald das Backend dafuer bereit ist.
   */
  create(dto: CreateEventDto): Observable<Event> {
    const fullDto = {
      ...dto,
      builderContent: this._builderElements(),
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
