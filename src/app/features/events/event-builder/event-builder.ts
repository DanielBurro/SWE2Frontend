import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  NgZone,
  OnDestroy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';

// Definition für die Buttons im Header (Blueprint)
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
    CdkDragPlaceholder,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    NzInputDirective,
    FormsModule,
  ],
})
export class EventBuilder implements AfterViewInit, OnDestroy {
  @ViewChild('headerContainer', { read: ElementRef }) headerContainer!: ElementRef;
  @ViewChild('pillElement') pillElement!: ElementRef;

  // Der Service ist jetzt unser "Single Source of Truth"
  public eventService = inject(EventService);

  // Blueprint-Liste für die Header-Buttons
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

  // Variablen für das dynamische Header-Layout
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

  // --- LOGIK FÜR DAS HEADER-LAYOUT ---

  calculateLayout(): void {
    if (!this.headerContainer || !this.pillElement) return;

    const containerWidth = this.headerContainer.nativeElement.offsetWidth;
    const pillWidth = this.pillElement.nativeElement.offsetWidth + 24;
    const moreBtnWidth = 60;

    const availableWidth = containerWidth - pillWidth - moreBtnWidth;
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

  // --- LOGIK FÜR DEN BUILDER-CONTENT (Interaktion mit Service) ---

  /**
   * Wird aufgerufen, wenn ein Button im Header geklickt wird.
   * Erstellt eine neue Instanz im Service.
   */
  protected addItem(item: BuilderElementDefinition) {
    this.eventService.addElement(item.id, item.label, item.icon);

    // Falls das Item aus dem Dropdown hinzugefügt wurde, Menü schließen
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  /**
   * Löscht ein Element anhand seiner UUID
   */
  protected removeElement(id: string) {
    this.eventService.removeElement(id);
  }

  /**
   * Behandelt das Verschieben von Elementen im Gitter
   */
  onDrop(event: CdkDragDrop<any>) {
    this.eventService.reorderElements(event.previousIndex, event.currentIndex);
  }

  /**
   * Ändert die Spaltenbreite eines Elements (1, 2 oder 3)
   */
  changeSize(id: string, cols: number) {
    this.eventService.updateElementSize(id, cols);
  }

  startResize(event: MouseEvent, element: any) {
    event.preventDefault();
    const startX = event.clientX;
    const startCols = element.cols;
    const containerWidth = this.headerContainer.nativeElement.offsetWidth; // Grobe Referenz
    const colWidth = containerWidth / 3;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newColsAdd = Math.round(deltaX / colWidth);
      let finalCols = startCols + newColsAdd;

      // Grenzen einhalten
      finalCols = Math.max(1, Math.min(finalCols, 4 - element.start));

      if (finalCols !== element.cols) {
        this.eventService.updateElementPos(element.id, element.start, finalCols);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}
