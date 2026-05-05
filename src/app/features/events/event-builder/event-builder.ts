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
import { BuilderElement, EventService } from '../../../core/services/event.service';
import { BaseCard } from '../../../components/event-cards/base-card/base-card';
import { TextCard } from '../../../components/event-cards/text-card/text-card';
import { HeadingCard } from '../../../components/event-cards/heading-card/heading-card';
import { ImageCard } from '../../../components/event-cards/image-card/image-card';
import { NzModalService, NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EventSettingsComponent } from '../event-settings/event-settings.component';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NzButtonModule } from 'ng-zorro-antd/button';

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
    BaseCard,
    TextCard,
    HeadingCard,
    ImageCard,
    DragDropModule,
  ],
  providers: [NzModalService]
})
export class EventBuilder implements AfterViewInit, OnDestroy {
  @ViewChild('headerContainer', { read: ElementRef }) headerContainer!: ElementRef;
  @ViewChild('pillElement') pillElement!: ElementRef;

  public eventService = inject(EventService);
  private modal = inject(NzModalService);
  private message = inject(NzMessageService);

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

  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
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
  }

  calculateLayout(): void {
    if (!this.headerContainer || !this.pillElement) return;

    const containerWidth = this.headerContainer.nativeElement.offsetWidth;
    const pillWidth = this.pillElement.nativeElement.offsetWidth + 24;
    const moreBtnWidth = 60;
    const rightActionsWidth = 250;

    const availableWidth = containerWidth - pillWidth - moreBtnWidth - rightActionsWidth;
    const itemWidth = 115;

    let maxVisible = Math.floor(availableWidth / itemWidth);
    maxVisible = Math.max(0, Math.min(maxVisible, this.allElements.length));

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
    this.eventService.addElement(item.id, item.label, item.icon);
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  public removeElement(id: string) {
    this.eventService.removeElement(id);
  }

  onSettings() {
    this.modal.create({
      nzTitle: 'Event Einstellungen',
      nzContent: EventSettingsComponent,
      nzWidth: 500,
      nzFooter: null,
      nzCentered: true,
      nzClassName: 'dark-modal'
    });
  }

  onPublish() {
    this.message.loading('Event wird veröffentlicht...', { nzDuration: 2000 }).onClose.subscribe(() => {
      this.message.success('Dein Event wurde erfolgreich veröffentlicht!');
    });
  }

  pickGradient() {
    const modal = this.modal.create({
      nzTitle: 'Hintergrund anpassen',
      nzContent: ColorPickerModal,
      nzData: {
        color1: this.eventService.color1(),
        color2: this.eventService.color2()
      },
      nzWidth: 400,
      nzFooter: null,
      nzClassName: 'dark-modal',
      nzMaskClosable: false, // Prevent accidental closure
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.eventService.updateColors(result.color1, result.color2);
      }
    });
  }

  adjustTitleHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  drop(event: CdkDragDrop<BuilderElement[]>) {
    this.eventService.reorderElements(event.previousIndex, event.currentIndex);
  }
}
