import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  NgZone,
  OnDestroy,
  ChangeDetectorRef,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { NzModalService, NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EventSettingsComponent } from '../event-settings/event-settings.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NzButtonModule } from 'ng-zorro-antd/button';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';

@Component({
  selector: 'app-color-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule],
  template: `
    <div class="color-picker-container">
      <div class="picker-row">
        <label>Startfarbe:</label>
        <input type="color" [(ngModel)]="color1" />
      </div>
      <div class="picker-row">
        <label>Endfarbe:</label>
        <input type="color" [(ngModel)]="color2" />
      </div>
      <div class="preview-box" [style.background]="getGradient()"></div>

      <div class="modal-footer">
        <button nz-button nzType="primary" (click)="handleOk()">Übernehmen</button>
      </div>
    </div>
  `,
  styles: [`
    .color-picker-container { padding: 10px 0; }
    .picker-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .preview-box { height: 120px; border-radius: 12px; margin-top: 10px; border: 1px solid rgba(255,255,255,0.1); }
    label { color: #e8e4dc; font-weight: 500; }
    .modal-footer { margin-top: 24px; display: flex; justify-content: flex-end; }
  `]
})
export class ColorPickerModal implements OnInit {
  color1 = '#c9a96e';
  color2 = '#111118';

  private modalData = inject(NZ_MODAL_DATA, { optional: true });
  private modalRef = inject(NzModalRef);

  ngOnInit() {
    if (this.modalData) {
      this.color1 = this.modalData.color1;
      this.color2 = this.modalData.color2;
    }
  }

  handleOk() {
    this.modalRef.close({ color1: this.color1, color2: this.color2 });
  }

  getGradient() { return `linear-gradient(135deg, ${this.color1} 0%, ${this.color2} 100%)`; }
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
  imports: [
    CommonModule,
    NzIconModule,
    NzLayoutModule,
    FormsModule,
    DragDropModule,
  ],
  providers: [NzModalService],
})
export class EventBuilder implements AfterViewInit, OnDestroy {
  @ViewChild('headerContainer', { read: ElementRef }) headerContainer!: ElementRef;
  @ViewChild('pillElement') pillElement!: ElementRef;
  @ViewChild('rightActions') rightActions!: ElementRef;

  public eventService = inject(EventService);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  readonly allElements: BuilderElementDefinition[] = [
    { id: 'text', label: 'Text', icon: 'align-left' },
    { id: 'image', label: 'Image', icon: 'picture' },
    { id: 'heading', label: 'Heading', icon: 'font-size' },
    { id: 'list', label: 'List', icon: 'unordered-list' },
    { id: 'quote', label: 'Quote', icon: 'message' },
    { id: 'divider', label: 'Divider', icon: 'border-bottom' },
    { id: 'location', label: 'Location', icon: 'environment' },
    { id: 'music', label: 'Music', icon: 'customer-service' },
    { id: 'video', label: 'Video', icon: 'video-camera' },
    { id: 'table', label: 'Table', icon: 'table' },
  ];

  visibleItems: BuilderElementDefinition[] = [];
  overflowItems: BuilderElementDefinition[] = [];
  isMenuOpen = false;
  private editorInstance?: EditorJS;

  private resizeObserver: ResizeObserver | null = null;

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
  }

  private initEditor() {
    this.editorInstance = new EditorJS({
      holder: 'editor-holder',
      tools: {
        header: {
          class: Header as any,
          inlineToolbar: ['link'],
          config: {
            placeholder: 'Überschrift...',
            levels: [2, 3, 4],
            defaultLevel: 2
          }
        },
        list: {
          class: List as any,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },
      },
      placeholder: 'Erzähle deinen Gästen mehr über das Event...',
      /**
       * Drag and drop is enabled by default in Editor.js.
       * The 'six dots' handle is the native drag handle.
       */
      onReady: () => {
        console.log('Editor.js is ready with Oystr Event Tools');
      },
    });
  }

  calculateLayout(): void {
    if (!this.headerContainer || !this.pillElement || !this.rightActions) return;

    const containerWidth = this.headerContainer.nativeElement.offsetWidth;
    const padding = 32; // Header horizontal padding (16px * 2)
    const pillWidth = this.pillElement.nativeElement.offsetWidth + 24; // Width + margin
    const rightActionsWidth = this.rightActions.nativeElement.offsetWidth + 16; // Width + margin
    const safetyMargin = 12; // Extra space to prevent tight-fitting issues

    // 1. Calculate available width without the 'more' button first
    const availableTotal = containerWidth - padding - pillWidth - rightActionsWidth - safetyMargin;

    // Each item is roughly 100px min-width + 8px gap
    const itemFullWidth = 112;

    // 2. Check how many can fit
    const countThatFits = Math.floor(availableTotal / itemFullWidth);

    let maxVisible: number;

    if (countThatFits >= this.allElements.length) {
      // Everything fits! No need for overflow items.
      maxVisible = this.allElements.length;
    } else {
      // Not everything fits, we need the 'more' button.
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
    // If it's a standard text/list item, we can add it to EditorJS
    if (['text', 'heading', 'list', 'quote', 'divider'].includes(item.id)) {
      this.addItemToEditor(item);
    } else {
      // Fallback to custom elements for complex items like image, location, etc.
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

    switch(item.id) {
      case 'heading':
        type = 'header';
        data = { text: '', level: 2 };
        break;
      case 'list':
        type = 'list';
        data = { style: 'unordered', items: [] };
        break;
      case 'quote':
        type = 'quote';
        data = { text: '', caption: '', alignment: 'left' };
        break;
      case 'divider':
        type = 'delimiter';
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

  onPublish() {
    this.message
      .loading('Event wird veröffentlicht...', { nzDuration: 2000 })
      .onClose.subscribe(() => {
        this.message.success('Dein Event wurde erfolgreich veröffentlicht!');
      });
  }

  pickGradient() {
    const modal = this.modal.create({
      nzTitle: 'Hintergrund anpassen',
      nzContent: ColorPickerModal,
      nzData: {
        color1: this.eventService.color1(),
        color2: this.eventService.color2(),
      },
      nzWidth: 400,
      nzFooter: null,
      nzClassName: 'dark-modal',
      nzMaskClosable: false, // Prevent accidental closure
    });

    modal.afterClose.subscribe((result) => {
      if (result) {
        this.eventService.updateColors(result.color1, result.color2);
      }
    });
  }

  adjustTitleHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
