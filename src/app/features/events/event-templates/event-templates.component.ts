import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { EventTemplate } from '../../../core/models/event-template.model';
import { EventService } from '../../../core/services/event.service';
import { TemplateService } from '../../../core/services/template.service';

@Component({
  selector: 'app-event-templates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NzButtonModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
  ],
  template: `
    <section class="templates-page">
      <div class="page-shell">
        <div class="hero-card">
          <div class="hero-copy">
            <p class="eyebrow">Template Auswahl</p>
            <h1>Starte neue Events schneller mit Vorlagen</h1>
            <p class="hero-text">
              Wähle eines der vier System-Templates oder speichere deinen aktuellen Event-Entwurf als eigenes Template.
              Beim Anwenden wird immer ein neues Event vorbereitet, der aktuelle Inhalt wird dabei überschrieben.
            </p>
          </div>

          <div class="hero-actions">
            <a routerLink="/events/create" class="ghost-link">Leeres Event erstellen</a>
          </div>
        </div>

        <div class="save-card">
          <div class="section-head">
            <div>
              <p class="section-kicker">Eigene Templates</p>
              <h2>Aktuellen Entwurf speichern</h2>
            </div>
            <span class="status-pill" [class.status-pill-muted]="!hasDraftToSave()">
              {{ hasDraftToSave() ? 'Entwurf bereit' : 'Kein Entwurf aktiv' }}
            </span>
          </div>

          <p class="section-text">
            Eigene Templates werden aktuell direkt im Browser gespeichert und stehen dir auf diesem Gerät wieder zur
            Verfügung.
          </p>

          <div class="save-form">
            <input
              nz-input
              [(ngModel)]="draftTemplateName"
              placeholder="Name für dein Template"
              class="template-input"
            />
            <button
              nz-button
              nzType="default"
              class="action-button"
              [disabled]="!hasDraftToSave() || !draftTemplateName.trim()"
              (click)="saveCurrentDraftAsTemplate()"
            >
              <span nz-icon nzType="save"></span>
              Als Template speichern
            </button>
          </div>

          @if (!hasDraftToSave()) {
            <p class="helper-text">
              Öffne zuerst die Event-Erstellung, fülle Titel oder Inhalt und speichere den Entwurf dann hier als
              wiederverwendbares Template.
            </p>
          }
        </div>

        <div class="template-section">
          <div class="section-head">
            <div>
              <p class="section-kicker">System Templates</p>
              <h2>Vorgefertigte Vorlagen</h2>
            </div>
          </div>

          <div class="templates-grid">
            @for (template of systemTemplates(); track template.id) {
              <article class="template-card">
                <div class="template-preview">
                  <span nz-icon [nzType]="template.icon" class="template-icon"></span>
                  <span class="template-badge">System</span>
                </div>
                <div class="template-body">
                  <h3>{{ template.name }}</h3>
                  <p>{{ template.description }}</p>
                  <div class="template-meta">Event-Titel: {{ template.title }}</div>
                </div>
                <button nz-button class="action-button" (click)="applyTemplate(template)">
                  Auswählen
                </button>
              </article>
            }
          </div>
        </div>

        <div class="template-section">
          <div class="section-head">
            <div>
              <p class="section-kicker">Deine Templates</p>
              <h2>Persönliche Vorlagen</h2>
            </div>
          </div>

          @if (userTemplates().length > 0) {
            <div class="templates-grid">
              @for (template of userTemplates(); track template.id) {
                <article class="template-card">
                  <div class="template-preview template-preview-user">
                    <span nz-icon [nzType]="template.icon" class="template-icon"></span>
                    <span class="template-badge template-badge-user">Eigenes</span>
                  </div>
                  <div class="template-body">
                    <h3>{{ template.name }}</h3>
                    <p>{{ template.description }}</p>
                    <div class="template-meta">Event-Titel: {{ template.title }}</div>
                  </div>
                  <div class="template-actions">
                    <button nz-button class="action-button" (click)="applyTemplate(template)">
                      Verwenden
                    </button>
                    <button nz-button nzType="default" class="delete-button" (click)="deleteTemplate(template)">
                      <span nz-icon nzType="delete"></span>
                    </button>
                  </div>
                </article>
              }
            </div>
          } @else {
            <div class="empty-card">
              <nz-empty nzNotFoundContent="Noch keine eigenen Templates gespeichert"></nz-empty>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .templates-page {
      min-height: 100%;
      padding: 32px;
      background:
        radial-gradient(circle at top left, rgba(201, 169, 110, 0.16), transparent 30%),
        linear-gradient(180deg, #0d0f14 0%, #090a0f 100%);
    }

    .page-shell {
      max-width: 1180px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .hero-card,
    .save-card,
    .empty-card {
      border-radius: 24px;
      border: 1px solid rgba(201, 169, 110, 0.16);
      background: rgba(16, 18, 24, 0.92);
      box-shadow: 0 28px 60px rgba(0, 0, 0, 0.28);
    }

    .hero-card {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-end;
      padding: 32px;
    }

    .hero-copy h1,
    .section-head h2 {
      color: #f6f1e8;
      margin: 0;
      font-family: 'Playfair Display', serif;
      line-height: 1.1;
    }

    .hero-copy h1 {
      font-size: clamp(2rem, 3vw, 3rem);
      max-width: 12ch;
      margin-bottom: 14px;
    }

    .eyebrow,
    .section-kicker {
      margin: 0 0 10px;
      color: #c9a96e;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .hero-text,
    .section-text,
    .helper-text,
    .template-body p,
    .template-meta {
      color: rgba(232, 228, 220, 0.7);
      line-height: 1.6;
    }

    .hero-text {
      max-width: 62ch;
      margin: 0;
    }

    .ghost-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 220px;
      height: 44px;
      padding: 0 18px;
      border-radius: 999px;
      border: 1px solid rgba(201, 169, 110, 0.3);
      color: #f6f1e8;
      text-decoration: none;
      transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
    }

    .ghost-link:hover {
      background: rgba(201, 169, 110, 0.1);
      border-color: rgba(201, 169, 110, 0.6);
      transform: translateY(-1px);
    }

    .save-card,
    .template-section {
      padding: 28px;
    }

    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 12px;
    }

    .status-pill {
      border-radius: 999px;
      padding: 8px 12px;
      background: rgba(76, 175, 130, 0.12);
      color: #80d7a5;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-pill-muted {
      background: rgba(255, 255, 255, 0.06);
      color: rgba(232, 228, 220, 0.5);
    }

    .section-text,
    .helper-text {
      margin: 0;
    }

    .save-form {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      margin: 18px 0 10px;
    }

    .template-input {
      height: 44px;
    }

    .action-button,
    .delete-button {
      border-radius: 999px;
      height: 42px;
      border-color: rgba(201, 169, 110, 0.32);
      background: transparent;
      color: #f6f1e8;
    }

    .action-button:hover,
    .delete-button:hover {
      border-color: #c9a96e !important;
      color: #c9a96e !important;
      background: rgba(201, 169, 110, 0.08) !important;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px;
    }

    .template-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 100%;
      padding: 18px;
      border-radius: 20px;
      border: 1px solid rgba(201, 169, 110, 0.14);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.015));
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .template-card:hover {
      transform: translateY(-2px);
      border-color: rgba(201, 169, 110, 0.34);
    }

    .template-preview {
      position: relative;
      min-height: 136px;
      border-radius: 16px;
      background:
        linear-gradient(135deg, rgba(201, 169, 110, 0.16), rgba(255, 255, 255, 0.03)),
        #13161f;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .template-preview-user {
      background:
        linear-gradient(135deg, rgba(86, 120, 198, 0.16), rgba(255, 255, 255, 0.03)),
        #13161f;
    }

    .template-icon {
      font-size: 42px;
      color: #c9a96e;
    }

    .template-badge {
      position: absolute;
      top: 14px;
      left: 14px;
      border-radius: 999px;
      padding: 6px 10px;
      background: rgba(201, 169, 110, 0.16);
      color: #f4d7a2;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .template-badge-user {
      background: rgba(86, 120, 198, 0.18);
      color: #a9c0ff;
    }

    .template-body {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }

    .template-body h3 {
      margin: 0;
      color: #f6f1e8;
      font-size: 20px;
      font-weight: 700;
    }

    .template-body p {
      margin: 0;
      font-size: 14px;
    }

    .template-meta {
      font-size: 12px;
    }

    .template-actions {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
    }

    .delete-button {
      width: 42px;
      padding: 0;
    }

    .empty-card {
      padding: 20px;
    }

    :host ::ng-deep .template-input.ant-input {
      background: #111118;
      border: 1px solid rgba(201, 169, 110, 0.28);
      color: #e8e4dc;
      border-radius: 999px;
      padding-inline: 16px;
    }

    :host ::ng-deep .template-input.ant-input:focus,
    :host ::ng-deep .template-input.ant-input-focused {
      border-color: #c9a96e;
      box-shadow: 0 0 0 2px rgba(201, 169, 110, 0.14);
    }

    :host ::ng-deep .template-input.ant-input::placeholder {
      color: rgba(232, 228, 220, 0.34);
    }

    @media (max-width: 720px) {
      .templates-page {
        padding: 20px;
      }

      .hero-card,
      .save-card,
      .template-section {
        padding: 22px;
      }

      .hero-card,
      .section-head {
        flex-direction: column;
        align-items: flex-start;
      }

      .save-form {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class EventTemplatesComponent {
  private eventService = inject(EventService);
  private modal = inject(NzModalService);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private templateService = inject(TemplateService);

  draftTemplateName = '';

  readonly systemTemplates = this.templateService.systemTemplates;
  readonly userTemplates = this.templateService.userTemplates;
  readonly hasDraftToSave = computed(() => this.eventService.hasDraftContent());

  constructor() {
    const currentTitle = this.eventService.eventTitle().trim();
    if (currentTitle) {
      this.draftTemplateName = `${currentTitle} Template`;
    }
  }

  applyTemplate(template: EventTemplate): void {
    const hasDraft = this.eventService.hasDraftContent();

    this.modal.confirm({
      nzTitle: 'Template anwenden?',
      nzContent: hasDraft
        ? 'Dein aktueller Entwurf wird überschrieben und ein neues Event mit diesem Template vorbereitet.'
        : 'Ein neues Event wird mit diesem Template vorbereitet.',
      nzOkText: 'Template verwenden',
      nzCancelText: 'Abbrechen',
      nzOnOk: () => {
        this.templateService.queueTemplate(template);
        this.router.navigate(['/events/create']);
      },
    });
  }

  saveCurrentDraftAsTemplate(): void {
    if (!this.hasDraftToSave()) {
      this.message.warning('Es gibt aktuell keinen Event-Entwurf zum Speichern.');
      return;
    }

    const templateName = this.draftTemplateName.trim();
    if (!templateName) {
      this.message.warning('Bitte gib deinem Template einen Namen.');
      return;
    }

    const snapshot = this.eventService.getTemplateSnapshot(templateName);
    this.templateService.createUserTemplate({
      name: templateName,
      title: snapshot.title,
      content: snapshot.content,
      description: 'Gespeichert aus deinem aktuellen Event-Entwurf.',
    });

    this.message.success('Template gespeichert.');
    this.draftTemplateName = '';
  }

  deleteTemplate(template: EventTemplate): void {
    this.modal.confirm({
      nzTitle: 'Template löschen?',
      nzContent: `Das Template "${template.name}" wird dauerhaft aus deinem Browser entfernt.`,
      nzOkText: 'Löschen',
      nzCancelText: 'Abbrechen',
      nzOkDanger: true,
      nzOnOk: () => {
        this.templateService.deleteUserTemplate(template.id);
        this.message.success('Template gelöscht.');
      },
    });
  }
}
