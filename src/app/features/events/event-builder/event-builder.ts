import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EventSettingsComponent } from '../event-settings/event-settings.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import EditorJS, { ToolConstructable } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Embed from '@editorjs/embed';

class CustomList extends List {
  override renderSettings() {
    return super.renderSettings().filter(
      (item: any) => {
        /**
         * We use 'any' here because MenuConfigItem is a union type that includes
         * separators and HTML items which don't have a 'label' or 'title' property.
         * Accessing it directly on the union type causes a TypeScript error.
         */
        const label = item.label || item.title;
        return ['Unordered', 'Ordered'].includes(label);
      });
  }
}




interface BuilderElementDefinition {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-event-builder',
  standalone: true,
  templateUrl: './event-builder.html',
  styleUrls: ['./event-builder.scss'],
  imports: [CommonModule, NzIconModule, NzLayoutModule, FormsModule, DragDropModule, NzButtonModule, NzAvatarModule, NzDividerModule, NzEmptyModule],
  providers: [NzModalService],
})
export class EventBuilder implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('headerContainer', { read: ElementRef }) headerContainer!: ElementRef;
  @ViewChild('pillElement') pillElement!: ElementRef;
  @ViewChild('rightActions') rightActions!: ElementRef;

  public eventService = inject(EventService);
  private userService = inject(UserService);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  readonly allElements: BuilderElementDefinition[] = [
    { id: 'text', label: 'Text', icon: 'align-left' },
    { id: 'heading', label: 'Heading', icon: 'font-size' },
    { id: 'list', label: 'List', icon: 'unordered-list' },
    { id: 'quote', label: 'Quote', icon: 'message' },
  ];

  visibleItems: BuilderElementDefinition[] = [];
  overflowItems: BuilderElementDefinition[] = [];
  isMenuOpen = false;
  private editorInstance?: EditorJS;

  private resizeObserver: ResizeObserver | null = null;

  // Preview state
  showPreview = false;
  private previewEditorInstance?: EditorJS;
  currentUser: User | null = null;

  ngOnInit() {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback for demo/development if endpoint is missing
        this.currentUser = {
          id: 1,
          username: 'demo_user',
          firstName: 'Max',
          lastName: 'Mustermann',
          email: 'max@example.com',
          createdAt: new Date().toISOString()
        };
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initEditor();

    setTimeout(() => this.calculateLayout(), 150);

    this.resizeObserver = new ResizeObserver(() => {
      this.ngZone.run(() => this.calculateLayout());
    });

    if (this.headerContainer) {
      this.resizeObserver.observe(this.headerContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.editorInstance) {
      this.editorInstance.destroy();
    }
    if (this.previewEditorInstance) {
      this.previewEditorInstance.destroy();
    }
  }

  private initEditor() {
    // delay initialization slightly to allow eventContent to settle when loading existing events
    setTimeout(() => {
        const existingData = this.eventService.eventContent();

        this.editorInstance = new EditorJS({
          holder: 'editor-holder',
          data: existingData || undefined,
          onChange: async () => {
            if (this.editorInstance) {
              try {
                const data = await this.editorInstance.save();
                this.eventService.eventContent.set(data);
              } catch (e) {
                console.error('Failed to auto-save editor data:', e);
              }
            }
          },
          tools: {
            header: {
              class: Header as any,
              inlineToolbar: true,
              config: {
                placeholder: 'Überschrift',
                levels: [1, 2, 3],
                defaultLevel: 2,
              },
            },
            list: {
              class: CustomList as unknown as ToolConstructable,
              toolbox: [
                { data: { style: 'ordered' } },
                { data: { style: 'unordered' } },
              ],
              inlineToolbar: true,
              config: {
                placeholder: 'Liste',
                defaultStyle: 'unordered',
              },
            },
            quote: { class: Quote as any, inlineToolbar: true },
            embed: {
              class: Embed,
              config: {
                services: { youtube: true, facebook: true, twitter: true, instagram: true },
              },
            },
          },
        });
    }, 100);
  }

  calculateLayout(): void {
    if (!this.headerContainer || !this.pillElement || !this.rightActions) return;

    const containerWidth = this.headerContainer.nativeElement.offsetWidth;
    const padding = 32; // Header horizontal padding (16px * 2)
    const pillWidth = this.pillElement.nativeElement.offsetWidth + 24; // Width + margin
    const rightActionsWidth = this.rightActions.nativeElement.offsetWidth + 16; // Width + margin
    const safetyMargin = 12; // Extra space to prevent tight-fitting issues

    const availableTotal = containerWidth - padding - pillWidth - rightActionsWidth - safetyMargin;
    const itemFullWidth = 112;
    const countThatFits = Math.floor(availableTotal / itemFullWidth);

    let maxVisible: number;

    if (countThatFits >= this.allElements.length) {
      maxVisible = this.allElements.length;
    } else {
      const moreBtnWidth = 52;
      const availableWithMore = availableTotal - moreBtnWidth;
      maxVisible = Math.max(0, Math.floor(availableWithMore / itemFullWidth));
    }

    if (this.visibleItems.length !== maxVisible) {
      this.visibleItems = this.allElements.slice(0, maxVisible);
      this.overflowItems = this.allElements.slice(maxVisible);

      if (this.overflowItems.length === 0) {
        this.isMenuOpen = false;
      }
      this.cdr.detectChanges();
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.cdr.detectChanges();
  }

  protected addItem(item: BuilderElementDefinition) {
    if (['text', 'heading', 'list', 'quote', 'embed'].includes(item.id)) {
      this.addItemToEditor(item);
    } else {
      this.eventService.addElement(item.id, item.label, item.icon);
    }

    if (this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  private addItemToEditor(item: BuilderElementDefinition) {
    if (!this.editorInstance) return;

    let type = 'paragraph';
    let data = {};

    switch (item.id) {
      case 'heading':
        type = 'header';
        data = { text: '', level: 2 };
        break;
      case 'list':
        type = 'list';
        data = { style: 'unordered', items: [''] };
        break;
      case 'quote':
        type = 'quote';
        data = { text: '', caption: '', alignment: 'left' };
        break;
      case 'embed':
        type = 'embed';
        data = {};
        break;
    }

    this.editorInstance.blocks.insert(type, data);
    this.editorInstance.caret.setToLastBlock();
  }

  onSettings() {
    this.modal.create({
      nzTitle: 'Event Einstellungen',
      nzContent: EventSettingsComponent,
      nzWidth: 500,
      nzFooter: null,
      nzCentered: true,
      nzClassName: 'dark-modal',
    });
  }

  async onPreview() {
    if (this.editorInstance) {
      try {
        const data = await this.editorInstance.save();
        this.eventService.eventContent.set(data);
      } catch (e) {
        console.error('Failed to save before preview:', e);
      }
    }

    this.showPreview = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.initPreviewEditor();
    }, 50);
  }

  closePreview() {
    this.showPreview = false;
    if (this.previewEditorInstance) {
      this.previewEditorInstance.destroy();
      this.previewEditorInstance = undefined;
    }
    this.cdr.detectChanges();
  }

  private initPreviewEditor() {
    const data = this.eventService.eventContent();

    this.previewEditorInstance = new EditorJS({
      holder: 'preview-editor-holder',
      readOnly: true,
      data: data || undefined,
      tools: {
        header: { class: Header as any },
        list: {
          class: CustomList as unknown as ToolConstructable,
          toolbox: [
            { data: { style: 'ordered' } },
            { data: { style: 'unordered' } },
          ],
        },
        quote: { class: Quote as any },
        embed: { class: Embed },
      },
    });
  }

  async onPublish() {
    if (this.editorInstance) {
      try {
        const data = await this.editorInstance.save();
        this.eventService.eventContent.set(data);
      } catch (e) {
        console.error('Failed to auto-save editor data before publishing:', e);
      }
    }

    const title = this.eventService.eventTitle();
    const dateObj = this.eventService.eventDate();
    const locationId = this.eventService.eventLocationId();

    if (!title || !dateObj || !locationId) {
      this.message.error('Bitte Titel, Datum und Ort in den Einstellungen festlegen!');
      return;
    }

    const msgId = this.message.loading('Event wird veröffentlicht...', { nzDuration: 0 }).messageId;

    const dto = {
      title: title,
      description: JSON.stringify(this.eventService.eventContent()),
      date: dateObj.toISOString(),
      hostId: this.currentUser?.id || 1,
      locationId: locationId
    };

    if (this.eventService.currentEventId()) {
      // Update existing
      this.eventService.update(this.eventService.currentEventId()!, dto).subscribe({
        next: (event) => {
          this.message.remove(msgId);
          this.message.success('Dein Event wurde erfolgreich aktualisiert!');
          this.router.navigate(['/event', event.id]);
        },
        error: () => {
          this.message.remove(msgId);
          this.message.error('Fehler beim Aktualisieren des Events.');
        }
      });
    } else {
      // Create new
      this.eventService.create(dto).subscribe({
        next: (event) => {
          this.message.remove(msgId);
          this.message.success('Dein Event wurde erfolgreich veröffentlicht!');
          this.eventService.currentEventId.set(event.id);
          this.router.navigate(['/event', event.id]);
        },
        error: () => {
          this.message.remove(msgId);
          this.message.error('Fehler beim Veröffentlichen des Events.');
        }
      });
    }
  }

  adjustTitleHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // Formatting helpers for preview
  formatDate(d: Date | null): string {
    if (!d) return 'Datum ausstehend';
    return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatTime(d: Date | null): string {
    if (!d) return '--:--';
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'DU';
    const first = this.currentUser.firstName ? this.currentUser.firstName[0] : '';
    const last = this.currentUser.lastName ? this.currentUser.lastName[0] : '';
    return (first + last).toUpperCase() || 'DU';
  }

  getUserFullName(): string {
    if (!this.currentUser) return 'Du';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim();
  }
}
