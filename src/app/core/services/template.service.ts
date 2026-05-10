import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  CreateUserEventTemplateDto,
  EventTemplate,
  EventTemplateSnapshot,
  cloneTemplateSnapshot,
  createTemplateContent,
} from '../models/event-template.model';

const USER_TEMPLATES_STORAGE_KEY = 'oystr-user-event-templates';

const SYSTEM_TEMPLATES: EventTemplate[] = [
  {
    id: 'birthday',
    name: 'Geburtstag',
    description: 'Ein freundlicher Ablauf für eine Geburtstagsfeier mit Einladung, Highlights und Abschluss.',
    icon: 'gift',
    source: 'system',
    title: 'Mein Geburtstag',
    content: createTemplateContent([
      { type: 'header', data: { text: 'Du bist eingeladen!', level: 2 } },
      {
        type: 'paragraph',
        data: {
          text: 'Ich möchte meinen Geburtstag gerne mit dir feiern und freue mich sehr, wenn du dabei bist.',
        },
      },
      { type: 'header', data: { text: 'Was dich erwartet', level: 3 } },
      {
        type: 'paragraph',
        data: {
          text: 'Es gibt gutes Essen, entspannte Musik und genug Zeit für gemeinsame Erinnerungen und neue Geschichten.',
        },
      },
      {
        type: 'quote',
        data: {
          text: 'Bring gute Laune mit, den Rest übernehme ich.',
          caption: 'Geburtstagsgruß',
          alignment: 'left',
        },
      },
    ]),
  },
  {
    id: 'wedding',
    name: 'Hochzeit',
    description: 'Eine ruhige Vorlage für Trauung, Feier und alle wichtigen Hinweise an eure Gäste.',
    icon: 'heart',
    source: 'system',
    title: 'Unsere Hochzeit',
    content: createTemplateContent([
      { type: 'header', data: { text: 'Wir sagen Ja', level: 2 } },
      {
        type: 'paragraph',
        data: {
          text: 'Wir freuen uns sehr, diesen besonderen Tag gemeinsam mit unseren Lieblingsmenschen zu feiern.',
        },
      },
      { type: 'header', data: { text: 'Ablauf des Tages', level: 3 } },
      {
        type: 'paragraph',
        data: {
          text: 'Nach der Trauung möchten wir mit euch anstoßen, essen, lachen und bis in den Abend hinein feiern.',
        },
      },
      {
        type: 'quote',
        data: {
          text: 'Danke, dass du diesen Moment mit uns teilst.',
          caption: 'Mit Liebe',
          alignment: 'left',
        },
      },
    ]),
  },
  {
    id: 'dinner',
    name: 'Dinner',
    description: 'Ideal für ein gemeinsames Abendessen mit kurzen Infos zu Anlass, Ablauf und Stimmung.',
    icon: 'coffee',
    source: 'system',
    title: 'Gemeinsames Dinner',
    content: createTemplateContent([
      { type: 'header', data: { text: 'Ein Abend am Tisch', level: 2 } },
      {
        type: 'paragraph',
        data: {
          text: 'Ich lade dich zu einem entspannten Dinner ein, bei dem gutes Essen und gute Gespräche im Mittelpunkt stehen.',
        },
      },
      { type: 'header', data: { text: 'Der Plan', level: 3 } },
      {
        type: 'paragraph',
        data: {
          text: 'Wir starten mit einem Aperitif, genießen gemeinsam das Essen und lassen den Abend in ruhiger Atmosphäre ausklingen.',
        },
      },
      {
        type: 'quote',
        data: {
          text: 'Komm hungrig und bring Zeit mit.',
          caption: 'Dinner Einladung',
          alignment: 'left',
        },
      },
    ]),
  },
  {
    id: 'houseparty',
    name: 'Hausparty',
    description: 'Eine lockere Vorlage für Musik, Freunde und einen ungezwungenen Abend zuhause.',
    icon: 'customer-service',
    source: 'system',
    title: 'Hausparty',
    content: createTemplateContent([
      { type: 'header', data: { text: 'Die Wohnung wird zur Tanzfläche', level: 2 } },
      {
        type: 'paragraph',
        data: {
          text: 'Ich schmeiße eine Hausparty und freue mich, wenn du auf einen lauten, lustigen und entspannten Abend vorbeikommst.',
        },
      },
      { type: 'header', data: { text: 'Worauf du dich freuen kannst', level: 3 } },
      {
        type: 'paragraph',
        data: {
          text: 'Es gibt Musik, Getränke, kleine Snacks und genug Platz für gute Gespräche zwischen Küche, Wohnzimmer und Balkon.',
        },
      },
      {
        type: 'quote',
        data: {
          text: 'Je später der Abend, desto besser die Playlist.',
          caption: 'Hausparty Modus',
          alignment: 'left',
        },
      },
    ]),
  },
];

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private _userTemplates = signal<EventTemplate[]>([]);
  private _pendingTemplate = signal<EventTemplateSnapshot | null>(null);

  readonly systemTemplates = computed(() => SYSTEM_TEMPLATES);
  readonly userTemplates = computed(() => this._userTemplates());
  readonly allTemplates = computed(() => [...SYSTEM_TEMPLATES, ...this._userTemplates()]);

  constructor() {
    this.loadUserTemplates();
  }

  createUserTemplate(dto: CreateUserEventTemplateDto): EventTemplate {
    const template: EventTemplate = {
      id: this.createTemplateId(),
      name: dto.name.trim(),
      description: dto.description?.trim() || 'Gespeichert aus deinem aktuellen Event-Entwurf.',
      icon: 'save',
      source: 'user',
      title: dto.title.trim(),
      content: cloneTemplateSnapshot({ title: dto.title, content: dto.content }).content,
      createdAt: new Date().toISOString(),
    };

    this._userTemplates.update((templates) => {
      const nextTemplates = [template, ...templates];
      this.persistUserTemplates(nextTemplates);
      return nextTemplates;
    });

    return template;
  }

  deleteUserTemplate(templateId: string): void {
    this._userTemplates.update((templates) => {
      const nextTemplates = templates.filter((template) => template.id !== templateId);
      this.persistUserTemplates(nextTemplates);
      return nextTemplates;
    });
  }

  queueTemplate(template: EventTemplate): void {
    this._pendingTemplate.set(
      cloneTemplateSnapshot({
        title: template.title,
        content: template.content,
      }),
    );
  }

  consumePendingTemplate(): EventTemplateSnapshot | null {
    const pendingTemplate = this._pendingTemplate();
    this._pendingTemplate.set(null);
    return pendingTemplate ? cloneTemplateSnapshot(pendingTemplate) : null;
  }

  private loadUserTemplates(): void {
    if (!this.isBrowser) {
      return;
    }

    const rawTemplates = localStorage.getItem(USER_TEMPLATES_STORAGE_KEY);
    if (!rawTemplates) {
      return;
    }

    try {
      const parsedTemplates = JSON.parse(rawTemplates) as EventTemplate[];
      this._userTemplates.set(parsedTemplates);
    } catch {
      localStorage.removeItem(USER_TEMPLATES_STORAGE_KEY);
      this._userTemplates.set([]);
    }
  }

  private persistUserTemplates(templates: EventTemplate[]): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(USER_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  }

  private createTemplateId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `template-${Date.now()}`;
  }
}
