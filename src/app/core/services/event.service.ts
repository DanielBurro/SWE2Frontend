// event.services.ts

import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventDto, EventStatus } from '../models/event.model';
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
  public eventContent = signal<any>(null);
  
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
   * Hilfsfunktion für Standard-Inhalte je nach Typ
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

  /**
   * Hilfsfunktion für Standard-Inhalte je nach Typ
   */
  applyTemplate(templateType: string) {
    if (templateType === 'birthday') {
      this.eventTitle.set('Mein Geburtstag 🎂');
      this._builderElements.set([
        {
          id: window.crypto.randomUUID(),
          type: 'heading',
          label: 'Heading',
          icon: 'font-size',
          data: { text: 'Herzlich Willkommen zu meiner Party!', level: 1 },
        },
        {
          id: window.crypto.randomUUID(),
          type: 'text',
          label: 'Text',
          icon: 'align-left',
          data: { text: 'Ich feiere meinen Geburtstag und würde mich freuen, wenn du dabei bist!' },
        },
      ]);
    } else if (templateType === 'wedding') {
      this.eventTitle.set('Unsere Hochzeit ❤️');
      this._builderElements.set([
        {
          id: window.crypto.randomUUID(),
          type: 'heading',
          label: 'Heading',
          icon: 'font-size',
          data: { text: 'Wir trauen uns!', level: 1 },
        },
        {
          id: window.crypto.randomUUID(),
          type: 'image',
          label: 'Image',
          icon: 'picture',
          data: { url: '' },
        },
      ]);
    } else if (templateType === 'party') {
      this.eventTitle.set('Hausparty! 🥳');
      this._builderElements.set([
        {
          id: window.crypto.randomUUID(),
          type: 'heading',
          label: 'Heading',
          icon: 'font-size',
          data: { text: 'Bier & Beats', level: 1 },
        },
      ]);
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
